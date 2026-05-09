'use strict'

const { test, describe } = require('node:test')
const assert = require('node:assert/strict')

// ── Mock factories ────────────────────────────────────────────────────────────

/**
 * Builds a mock AI service with controlled embed/complete responses.
 *
 * @param {{ embedResponse?: number[], chatResponse?: string }} opts
 * @returns {object} Mock AI service compatible with createRAGService DI.
 */
function makeMockAIService({ embedResponse, chatResponse } = {}) {
    return {
        embedCallCount: 0,
        async embed(text) {
            this.embedCallCount++
            return embedResponse ?? new Array(1536).fill(0.1)
        },
        async complete(opts) {
            return chatResponse ?? 'Respuesta informativa de prueba.'
        },
        async completeJSON(opts) {
            return {}
        },
    }
}

/**
 * Builds a mock DB that returns a fixed set of rows for any query.
 *
 * @param {Array<{chunk_text: string, source_path: string, distance: number}>} rows
 * @returns {object} Mock DB with a query() method.
 */
function makeMockDB(rows = []) {
    return {
        queryCallCount: 0,
        async query(sql, params) {
            this.queryCallCount++
            // Simulate rowCount for INSERT statements
            if (sql.trim().toUpperCase().startsWith('INSERT')) {
                return { rows: [], rowCount: 1 }
            }
            return { rows, rowCount: rows.length }
        },
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ragService.answer', () => {
    test('personalisation query returns redirect message — never calls embed', async () => {
        const { createRAGService } = await import('../../services/ragService.js')
        const mockAI = makeMockAIService()
        const mockDB = makeMockDB()
        const svc = createRAGService({ db: mockDB, aiService: mockAI })

        const result = await svc.answer('creo que sufro de ansiedad')

        assert.ok(result !== null, 'Should return an object, not null')
        assert.ok(typeof result.answer === 'string', 'answer must be a string')
        assert.ok(result.answer.includes('profesional'), 'Should contain redirect to professional')
        assert.deepEqual(result.sources, [], 'sources should be empty array')
        assert.equal(mockAI.embedCallCount, 0, 'embed must NOT be called for personalisation queries')
    })

    test('general query with matching chunks returns {answer, sources}', async () => {
        const { createRAGService } = await import('../../services/ragService.js')
        const mockAI = makeMockAIService({ chatResponse: 'La ansiedad es una respuesta normal al estrés.' })
        const mockDB = makeMockDB([
            { chunk_text: 'La ansiedad es una respuesta adaptativa.', source_path: '/Libros/Ansiedad/libro.pdf', distance: 0.10 },
            { chunk_text: 'El estrés crónico puede intensificar la ansiedad.', source_path: '/Libros/Ansiedad/libro.pdf', distance: 0.18 },
        ])
        const svc = createRAGService({ db: mockDB, aiService: mockAI })

        const result = await svc.answer('qué es la ansiedad')

        assert.ok(result !== null, 'Should return a result when chunks match')
        assert.equal(typeof result.answer, 'string')
        assert.ok(result.answer.length > 0)
        assert.ok(Array.isArray(result.sources))
        assert.ok(result.sources.length > 0, 'sources should contain distinct paths')
        assert.equal(result.sources[0], '/Libros/Ansiedad/libro.pdf')
    })

    test('embed returns [] (API error) → returns null', async () => {
        const { createRAGService } = await import('../../services/ragService.js')
        const mockAI = makeMockAIService({ embedResponse: [] })
        const mockDB = makeMockDB()
        const svc = createRAGService({ db: mockDB, aiService: mockAI })

        const result = await svc.answer('qué es la depresión')

        assert.equal(result, null, 'Must return null when embed fails')
        assert.equal(mockDB.queryCallCount, 0, 'DB must NOT be queried when embed fails')
    })

    test('no rows above similarity threshold → returns null', async () => {
        const { createRAGService } = await import('../../services/ragService.js')
        const mockAI = makeMockAIService()
        // distance >= 0.25 means similarity <= 0.75 (below threshold)
        const mockDB = makeMockDB([
            { chunk_text: 'Texto poco relevante.', source_path: '/Libros/otro.pdf', distance: 0.30 },
            { chunk_text: 'Más texto irrelevante.', source_path: '/Libros/otro.pdf', distance: 0.45 },
        ])
        const svc = createRAGService({ db: mockDB, aiService: mockAI })

        const result = await svc.answer('información específica muy técnica')

        assert.equal(result, null, 'Must return null when no chunks meet the threshold')
    })

    test('cache hit — second call with same query does NOT call embed again', async () => {
        const { createRAGService } = await import('../../services/ragService.js')
        const mockAI = makeMockAIService({ chatResponse: 'Respuesta en caché.' })
        const mockDB = makeMockDB([
            { chunk_text: 'Contenido relevante sobre mindfulness.', source_path: '/Libros/mindfulness.pdf', distance: 0.08 },
        ])
        // Shared cache across calls to simulate the same service instance
        const sharedCache = new Map()
        const svc = createRAGService({ db: mockDB, aiService: mockAI, cache: sharedCache })

        const first = await svc.answer('qué es mindfulness')
        const embedCountAfterFirst = mockAI.embedCallCount

        const second = await svc.answer('qué es mindfulness')

        assert.ok(first !== null)
        assert.deepEqual(first, second, 'Cached result must equal first result')
        assert.equal(mockAI.embedCallCount, embedCountAfterFirst, 'embed must NOT be called again on cache hit')
    })
})

describe('ragService.ingest', () => {
    test('processes text content, calls embed per chunk, returns {inserted, skipped}', async () => {
        const { createRAGService } = await import('../../services/ragService.js')

        const mockAI = makeMockAIService()
        const dbRows = []
        const mockDB = {
            queryCallCount: 0,
            async query(sql, params) {
                this.queryCallCount++
                if (sql.trim().toUpperCase().startsWith('INSERT')) {
                    return { rows: [], rowCount: 1 }
                }
                return { rows: dbRows, rowCount: 0 }
            },
        }

        // Build a fake text with enough words to produce at least 1 chunk
        const fakeText = Array(400).fill('palabra').join(' ')

        // Inject mock readFile and pdfParse to avoid real file I/O
        const mockReadFile = async () => Buffer.from('dummy')
        const mockPdfParse = async () => ({ text: fakeText })

        const svc = createRAGService({
            db: mockDB,
            aiService: mockAI,
            _readFile: mockReadFile,
            _pdfParse: mockPdfParse,
        })

        const result = await svc.ingest({ filePath: '/fake/libro.pdf', category: 'psicoeducacion' })

        assert.ok(typeof result === 'object', 'ingest must return an object')
        assert.ok(typeof result.inserted === 'number', 'inserted must be a number')
        assert.ok(typeof result.skipped === 'number', 'skipped must be a number')
        assert.ok(result.inserted + result.skipped > 0, 'At least one chunk must be processed')
        assert.ok(mockAI.embedCallCount > 0, 'embed must be called for each chunk')
        assert.ok(mockDB.queryCallCount > 0, 'DB must be queried for each embedded chunk')
    })
})
