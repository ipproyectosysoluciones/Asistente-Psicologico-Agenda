/**
 * Servicio RAG (Retrieval-Augmented Generation) para la base de conocimiento psicoeducativa.
 * Realiza búsqueda semántica sobre embeddings vectoriales almacenados en PostgreSQL
 * y genera respuestas contextualizadas con GPT-4o.
 *
 * RAG service for the psychoeducational knowledge base.
 * Performs semantic search over vector embeddings stored in PostgreSQL
 * and generates contextualised responses using GPT-4o.
 */

import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import pg from 'pg'
import pdfParse from 'pdf-parse'
import { aiService } from './aiService.js'

const { Pool } = pg

/**
 * Mensaje de redirección para consultas de personalización clínica.
 * Displayed when the user frames the query as a personal case.
 *
 * @type {string}
 */
const REDIRECT_MESSAGE =
    'Solo un profesional puede evaluar tu situación personal. Te invito a agendar una consulta con uno de nuestros psicólogos. Escribí *agendar* para reservar tu turno.'

/**
 * Detecta si una consulta describe una situación personal del usuario
 * que requiere derivación a un profesional, sin pasar por RAG.
 *
 * Detects whether a query describes a personal situation that must be
 * redirected to a professional (never answered via RAG).
 *
 * @param {string} query - Consulta del usuario / User query.
 * @returns {boolean}
 */
function isPersonalisedQuery(query) {
    return /\b(yo\s+ten|mi\s+(amigo|familiar|hijo|hija|pareja)|creo\s+que\s+sufro|me\s+diagnos)/i.test(query)
}

/**
 * Divide un texto en chunks de ~500 tokens con solapamiento de ~50 tokens.
 * Aproximación: 1 token ≈ 0,75 palabras → 500 tokens ≈ 375 palabras, overlap ≈ 38 palabras.
 * La división primaria es `\n\n` (párrafos); los límites se respetan reagrupando palabras.
 *
 * Splits text into ~500-token chunks with ~50-token overlap.
 * Approximation: 1 token ≈ 0.75 words → 500 tokens ≈ 375 words, overlap ≈ 38 words.
 * Primary split is `\n\n` (paragraphs); boundaries are respected by regrouping words.
 *
 * @param {string} text - Texto completo a fragmentar / Full text to chunk.
 * @returns {string[]} Array de chunks / Array of chunks.
 */
function chunkText(text) {
    const TARGET_WORDS = 375
    const OVERLAP_WORDS = 38

    // Flatten text into word array, preserving paragraph boundaries as empty strings
    const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
    const allWords = []
    for (const para of paragraphs) {
        allWords.push(...para.split(/\s+/).filter(Boolean))
    }

    const chunks = []
    let start = 0

    while (start < allWords.length) {
        const end = Math.min(start + TARGET_WORDS, allWords.length)
        const slice = allWords.slice(start, end)
        if (slice.length > 0) {
            chunks.push(slice.join(' '))
        }
        start += TARGET_WORDS - OVERLAP_WORDS
    }

    return chunks
}

/**
 * Genera una clave SHA-256 para el cache a partir de una consulta.
 *
 * Generates a SHA-256 cache key from a query string.
 *
 * @param {string} query - Consulta a hashear / Query to hash.
 * @returns {string} Hash hexadecimal / Hexadecimal hash.
 */
function cacheKey(query) {
    return crypto.createHash('sha256').update(query).digest('hex')
}

/**
 * Crea una instancia del servicio RAG con dependencias inyectadas.
 * Sigue el patrón factory para facilitar testing con mocks.
 *
 * Creates a RAG service instance with injected dependencies.
 * Follows the factory pattern to enable testing with mocks.
 *
 * @param {{ db: object, aiService: object, cache?: Map<string, {value: any, expiresAt: number}>, _pdfParse?: Function, _readFile?: Function }} deps
 * @param {object} deps.db - Adaptador de base de datos con método `query` / DB adapter with `query` method.
 * @param {object} deps.aiService - Instancia del AI service / AI service instance.
 * @param {Map} [deps.cache] - Cache Map opcional; si no se provee se crea uno interno / Optional cache Map; internal one created if omitted.
 * @param {Function} [deps._pdfParse] - Override de pdf-parse para testing / pdf-parse override for testing.
 * @param {Function} [deps._readFile] - Override de fs.readFile para testing / fs.readFile override for testing.
 * @returns {object} Instancia del servicio RAG / RAG service instance.
 */
export function createRAGService({ db, aiService: injectedAIService, cache, _pdfParse, _readFile } = {}) {
    // Allow injecting replacements for I/O dependencies in tests
    const parsePDF = _pdfParse ?? pdfParse
    const readFile = _readFile ?? fs.readFile
    const _cache = cache ?? new Map()
    const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

    /**
     * Recupera un valor del cache si no ha expirado.
     *
     * Retrieves a cached value if not expired.
     *
     * @param {string} key
     * @returns {any|undefined}
     */
    function getCache(key) {
        const entry = _cache.get(key)
        if (!entry) return undefined
        if (Date.now() > entry.expiresAt) {
            _cache.delete(key)
            return undefined
        }
        return entry.value
    }

    /**
     * Almacena un valor en el cache con TTL de 1 hora.
     *
     * Stores a value in the cache with a 1-hour TTL.
     *
     * @param {string} key
     * @param {any} value
     */
    function setCache(key, value) {
        _cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
    }

    return {
        /**
         * Responde una consulta general usando RAG: embed → búsqueda coseno → GPT-4o.
         * Detecta personalización y redirige sin consultar RAG.
         * Devuelve null cuando el embedding falla o no hay resultados por encima del umbral.
         *
         * Answers a general query using RAG: embed → cosine search → GPT-4o.
         * Detects personalised queries and redirects without hitting RAG.
         * Returns null when embedding fails or no results meet the threshold.
         *
         * @param {string} query - Consulta del usuario / User query.
         * @param {string} [lang='es'] - Idioma de respuesta / Response language (reserved for future i18n).
         * @returns {Promise<{answer: string, sources: string[]}|null>}
         */
        async answer(query, lang = 'es') {
            // 1. Personalisation redirect — never goes through RAG
            if (isPersonalisedQuery(query)) {
                return { answer: REDIRECT_MESSAGE, sources: [] }
            }

            // 2. Cache check — avoids re-embedding identical queries
            const key = cacheKey(query)
            const cached = getCache(key)
            if (cached !== undefined) return cached

            // 3. Embed the query
            const embedding = await injectedAIService.embed(query)
            if (!embedding || embedding.length === 0) {
                // API error path — let caller fall back to category lookup
                return null
            }

            // 4. Cosine similarity search via pgvector (<=> = cosine distance, lower is better)
            const vectorLiteral = `[${embedding.join(',')}]`
            const result = await db.query(
                `SELECT chunk_text, source_path,
                        (embedding <=> $1::vector) AS distance
                 FROM knowledge_embeddings
                 ORDER BY 3
                 LIMIT 5`,
                [vectorLiteral]
            )

            // 5. Threshold: keep only rows with cosine distance < 0.25 (similarity > 0.75)
            const relevant = result.rows.filter(row => row.distance < 0.25)
            if (relevant.length === 0) return null

            // 6. Build context string for GPT-4o
            const contextStr = relevant
                .map((row, i) => `[${i + 1}] ${row.chunk_text}`)
                .join('\n\n')

            // 7. Generate contextualised response
            const answer = await injectedAIService.complete({ user: query, context: contextStr })

            // 8. Collect distinct source paths
            const sources = [...new Set(relevant.map(row => row.source_path).filter(Boolean))]

            const response = { answer, sources }

            // 9. Store in cache
            setCache(key, response)

            return response
        },

        /**
         * Ingesta un archivo PDF en la base de conocimiento vectorial.
         * Parsea el PDF, divide en chunks, genera embeddings e inserta en PostgreSQL.
         *
         * Ingests a PDF file into the vector knowledge base.
         * Parses the PDF, splits into chunks, generates embeddings and inserts into PostgreSQL.
         *
         * @param {{ filePath: string, category: string }} opts
         * @param {string} opts.filePath - Ruta absoluta al archivo PDF / Absolute path to the PDF file.
         * @param {string} opts.category - Categoría temática del documento / Thematic category of the document.
         * @returns {Promise<{inserted: number, skipped: number}>}
         */
        async ingest({ filePath, category }) {
            const buffer = await readFile(filePath)
            const parsed = await parsePDF(buffer)
            const chunks = chunkText(parsed.text)

            let inserted = 0
            let skipped = 0

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i]
                const embedding = await injectedAIService.embed(chunk)

                if (!embedding || embedding.length === 0) {
                    skipped++
                    continue
                }

                const vectorLiteral = `[${embedding.join(',')}]`

                const res = await db.query(
                    `INSERT INTO knowledge_embeddings
                        (id, chunk_index, chunk_text, embedding, source_path, category, created_at)
                     VALUES
                        (gen_random_uuid(), $1, $2, $3::vector, $4, $5, NOW())
                     ON CONFLICT (source_path, chunk_index) DO NOTHING`,
                    [i, chunk, vectorLiteral, filePath, category]
                )

                // rowCount === 0 means ON CONFLICT DO NOTHING fired (duplicate)
                if (res.rowCount === 0) {
                    skipped++
                } else {
                    inserted++
                }
            }

            return { inserted, skipped }
        },
    }
}

// ── Singleton via Proxy — mismo patrón que aiService.js ──────────────────────

let _instance = null

/**
 * Crea o reutiliza la instancia singleton del RAG service.
 * Usa su propio pg.Pool con las variables de entorno PG estándar.
 *
 * Creates or reuses the singleton RAG service instance.
 * Uses its own pg.Pool with standard PG environment variables.
 *
 * @returns {ReturnType<typeof createRAGService>}
 */
function _getInstance() {
    if (!_instance) {
        const pool = new Pool({
            host: process.env.PGHOST,
            user: process.env.PGUSER,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: parseInt(process.env.PGPORT || '5432', 10),
            max: 3,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        })

        _instance = createRAGService({ db: pool, aiService })
    }
    return _instance
}

/**
 * Singleton proxy del RAG service. Permite uso directo sin instanciación manual.
 * Lazy-initializes en el primer acceso, igual que aiService.
 *
 * Singleton proxy of the RAG service. Enables direct use without manual instantiation.
 * Lazy-initializes on first access, mirroring aiService.
 */
export const ragService = new Proxy({}, { get: (_, k) => _getInstance()[k] })
