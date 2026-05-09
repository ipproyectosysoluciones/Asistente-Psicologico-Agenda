/**
 * Script de ingestión de PDFs para la base de conocimiento RAG.
 *
 * Lee recursivamente todos los archivos `*.pdf` desde la carpeta definida por
 * la variable de entorno `LIBROS_PATH` (por defecto: `<cwd>/Libros`).
 * La categoría de cada documento se extrae del nombre de la carpeta padre inmediata.
 *
 * Ejecutar una sola vez (o cuando se agreguen nuevos libros):
 *   node bot/src/scripts/ingestPdfs.js
 *
 * Variables de entorno requeridas (tomadas del .env del bot):
 *   PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT
 *   OPENAI_API_KEY
 *   LIBROS_PATH  (opcional — default: <cwd>/Libros)
 *
 * ---
 *
 * PDF ingestion script for the RAG knowledge base.
 *
 * Recursively reads all `*.pdf` files from the folder defined by the
 * `LIBROS_PATH` env var (default: `<cwd>/Libros`).
 * The category of each document is derived from its immediate parent folder name.
 *
 * Run once (or whenever new books are added):
 *   node bot/src/scripts/ingestPdfs.js
 *
 * Required env vars (loaded from the bot's .env):
 *   PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT
 *   OPENAI_API_KEY
 *   LIBROS_PATH  (optional — default: <cwd>/Libros)
 */

import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

// Load .env from bot root — resolve relative to this script's location
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const botRoot = path.resolve(__dirname, '..', '..')

// dotenv is not a listed dependency; load only if available, otherwise rely on
// caller to inject env vars (e.g. via `dotenv -e .env node script.js`)
try {
    const requireLocal = createRequire(import.meta.url)
    const dotenv = requireLocal('dotenv')
    dotenv.config({ path: path.join(botRoot, '.env') })
} catch {
    // dotenv not available — env vars must be pre-loaded by the calling shell
}

import { ragService } from '../services/ragService.js'

const TAG = '[ingestPdfs]'
const LIBROS_PATH = process.env.LIBROS_PATH || path.join(process.cwd(), 'Libros')

/**
 * Recopila recursivamente todos los archivos `.pdf` bajo un directorio raíz.
 *
 * Recursively collects all `.pdf` files under a root directory.
 *
 * @param {string} dir - Directorio raíz / Root directory.
 * @returns {Promise<string[]>} Rutas absolutas de todos los PDFs / Absolute paths of all PDFs.
 */
async function collectPDFs(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const results = []

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            const nested = await collectPDFs(fullPath)
            results.push(...nested)
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
            results.push(fullPath)
        }
    }

    return results
}

/**
 * Derive la categoría de un archivo a partir del nombre de su carpeta padre.
 * Si el padre es el directorio raíz de libros, usa 'general'.
 *
 * Derives the category of a file from its immediate parent folder name.
 * Falls back to 'general' if the parent is the books root directory.
 *
 * @param {string} filePath - Ruta absoluta del archivo / Absolute file path.
 * @returns {string} Categoría derivada / Derived category.
 */
function deriveCategory(filePath) {
    const parentDir = path.basename(path.dirname(filePath))
    // If the file sits directly inside LIBROS_PATH, use 'general'
    return path.dirname(filePath) === LIBROS_PATH ? 'general' : parentDir
}

async function main() {
    console.log(`${TAG} Books root: ${LIBROS_PATH}`)

    let pdfs
    try {
        pdfs = await collectPDFs(LIBROS_PATH)
    } catch (err) {
        console.error(`${TAG} Cannot read LIBROS_PATH: ${err.message}`)
        process.exit(1)
    }

    if (pdfs.length === 0) {
        console.log(`${TAG} No PDF files found under ${LIBROS_PATH}. Nothing to ingest.`)
        process.exit(0)
    }

    console.log(`${TAG} Found ${pdfs.length} PDF(s). Starting ingestion...`)

    let totalInserted = 0
    let totalSkipped = 0

    for (const filePath of pdfs) {
        const filename = path.basename(filePath)
        const category = deriveCategory(filePath)

        console.log(`${TAG} Processing ${filename} (category: ${category})...`)

        try {
            const { inserted, skipped } = await ragService.ingest({ filePath, category })
            console.log(`${TAG} ${filename}: inserted=${inserted} skipped=${skipped}`)
            totalInserted += inserted
            totalSkipped += skipped
        } catch (err) {
            // Per-file errors are logged but do not abort the entire run
            console.error(`${TAG} Error processing ${filename}: ${err.message}`)
        }
    }

    console.log(`${TAG} Done. Total inserted=${totalInserted} skipped=${totalSkipped}`)
    process.exit(0)
}

main()
