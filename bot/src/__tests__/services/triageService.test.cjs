'use strict'

const { test, describe, before } = require('node:test')
const assert = require('node:assert/strict')

// ── Mock factories ────────────────────────────────────────────────────────────

/**
 * Builds a mock AI service with a controlled completeJSON response.
 *
 * @param {object} [jsonResponse={}] - Response returned by completeJSON.
 * @returns {object} Mock AI service compatible with createTriageService DI.
 */
function makeMockAIService(jsonResponse = {}) {
    return {
        async completeJSON(opts) { return jsonResponse },
        async complete(opts) { return 'respuesta' },
        async embed(text) { return [] },
    }
}

/**
 * Builds a mock DB that returns a fixed set of rows for any query.
 *
 * @param {Array<object>} [rows=[]] - Rows returned by SELECT queries.
 * @returns {object} Mock DB with a query() method.
 */
function makeMockDB(rows = []) {
    return {
        async query(sql, params) {
            if (sql.trim().toUpperCase().startsWith('INSERT')) return { rows: [], rowCount: 1 }
            return { rows, rowCount: rows.length }
        },
    }
}

// ── nextTurn tests ────────────────────────────────────────────────────────────

describe('triageService.nextTurn', () => {
    test('first turn (null state) → returns nextQuestion, step=1, done=false', async () => {
        const { createTriageService } = await import('../../services/triageService.js')

        const aiResponse = {
            next_question: '¿Con qué frecuencia te has sentido sin energía?',
            extracted_score: 1,
            step: 2,
            done: false,
        }
        const svc = createTriageService({ db: makeMockDB(), aiService: makeMockAIService(aiResponse) })

        const result = await svc.nextTurn({ phone: '+57123', userText: 'Varios días', currentState: null })

        assert.equal(typeof result.nextQuestion, 'string', 'nextQuestion must be a string')
        assert.ok(result.nextQuestion.length > 0, 'nextQuestion must be non-empty')
        assert.equal(result.newState.step, 1, 'step must be 1 after first turn')
        assert.equal(result.done, false, 'done must be false on first turn')
        assert.deepEqual(result.newState.responses, ['Varios días'])
        assert.deepEqual(result.newState.scores, [1])
    })

    test('last turn (step=8 → AI returns done:true) → done=true', async () => {
        const { createTriageService } = await import('../../services/triageService.js')

        const aiResponse = {
            next_question: 'Gracias por compartir todo esto. Ha sido muy valioso.',
            extracted_score: 2,
            step: 9,
            done: true,
        }
        const svc = createTriageService({ db: makeMockDB(), aiService: makeMockAIService(aiResponse) })

        // State with 8 answers already = step 8
        const currentState = {
            step: 8,
            responses: Array(8).fill('algunos días'),
            scores: Array(8).fill(1),
        }

        const result = await svc.nextTurn({ phone: '+57123', userText: 'No, nunca', currentState })

        assert.equal(result.done, true, 'done must be true when AI signals done')
        assert.equal(result.newState.step, 9, 'step must advance to 9')
    })

    test('completeJSON returns {} (error) → returns safe fallback question, does NOT throw', async () => {
        const { createTriageService } = await import('../../services/triageService.js')

        const svc = createTriageService({ db: makeMockDB(), aiService: makeMockAIService({}) })

        let result
        await assert.doesNotReject(async () => {
            result = await svc.nextTurn({ phone: '+57123', userText: 'hola', currentState: null })
        })

        assert.equal(typeof result.nextQuestion, 'string', 'nextQuestion must be a string even on AI error')
        assert.ok(result.nextQuestion.length > 0, 'fallback question must be non-empty')
        assert.equal(result.newState.scores[0], 0, 'score must default to 0 on error')
    })
})

// ── finalize tests ────────────────────────────────────────────────────────────

describe('triageService.finalize', () => {
    test('score 0-4 → urgency minimal, hotline null', async () => {
        const { createTriageService } = await import('../../services/triageService.js')
        const svc = createTriageService({ db: makeMockDB(), aiService: makeMockAIService() })

        const result = svc.finalize({ scores: [1, 0, 1, 0, 1, 0, 0, 0, 1] }) // sum=4

        assert.equal(result.urgency, 'minimal')
        assert.equal(result.hotline, null)
        assert.equal(result.score, 4)
    })

    test('score 5-9 → urgency mild, hotline null', async () => {
        const { createTriageService } = await import('../../services/triageService.js')
        const svc = createTriageService({ db: makeMockDB(), aiService: makeMockAIService() })

        const result = svc.finalize({ scores: [1, 1, 1, 1, 1, 0, 0, 0, 0] }) // sum=5

        assert.equal(result.urgency, 'mild')
        assert.equal(result.hotline, null)
        assert.equal(result.score, 5)
    })

    test('score 10-14 → urgency moderate, hotline null', async () => {
        const { createTriageService } = await import('../../services/triageService.js')
        const svc = createTriageService({ db: makeMockDB(), aiService: makeMockAIService() })

        const result = svc.finalize({ scores: [2, 2, 2, 2, 2, 0, 0, 0, 0] }) // sum=10

        assert.equal(result.urgency, 'moderate')
        assert.equal(result.hotline, null)
        assert.equal(result.score, 10)
    })

    test('score 15-27 → urgency severe, hotline non-null', async () => {
        process.env.CRISIS_HOTLINE = 'TestLine123'
        const { createTriageService } = await import('../../services/triageService.js')
        const svc = createTriageService({ db: makeMockDB(), aiService: makeMockAIService() })

        const result = svc.finalize({ scores: [2, 2, 2, 2, 2, 2, 2, 1, 0] }) // sum=15

        assert.equal(result.urgency, 'severe')
        assert.ok(result.hotline !== null, 'hotline must be non-null for severe')
        assert.ok(result.hotline.includes('TestLine123'), 'hotline must reflect env var')
        assert.equal(result.score, 15)
    })

    test('boundary score 27 → urgency severe', async () => {
        const { createTriageService } = await import('../../services/triageService.js')
        const svc = createTriageService({ db: makeMockDB(), aiService: makeMockAIService() })

        const result = svc.finalize({ scores: [3, 3, 3, 3, 3, 3, 3, 3, 3] }) // sum=27

        assert.equal(result.urgency, 'severe')
        assert.equal(result.score, 27)
        assert.ok(result.hotline !== null)
    })
})

// ── saveAssessment tests ──────────────────────────────────────────────────────

describe('triageService.saveAssessment', () => {
    test('calls db INSERT without throwing on success', async () => {
        const { createTriageService } = await import('../../services/triageService.js')

        let insertCalled = false
        const mockDB = {
            async query(sql, params) {
                if (sql.trim().toUpperCase().startsWith('INSERT')) {
                    insertCalled = true
                    return { rows: [], rowCount: 1 }
                }
                // lookupPatientId SELECT
                return { rows: [], rowCount: 0 }
            },
        }

        const svc = createTriageService({ db: mockDB, aiService: makeMockAIService() })

        await assert.doesNotReject(async () => {
            await svc.saveAssessment({
                phone: '+57123456789',
                scores: [1, 1, 1, 1, 1, 0, 0, 0, 0],
                urgency: 'mild',
                recommendedAction: 'Se recomienda hablar con un profesional.',
            })
        })

        assert.ok(insertCalled, 'db INSERT must be called')
    })
})

// ── hasUpcomingAppointment tests ──────────────────────────────────────────────

describe('triageService.hasUpcomingAppointment', () => {
    test('returns true when DB returns rows (appointment found)', async () => {
        const { createTriageService } = await import('../../services/triageService.js')
        const svc = createTriageService({ db: makeMockDB([{ '?column?': 1 }]), aiService: makeMockAIService() })

        const result = await svc.hasUpcomingAppointment('+57123456789')

        assert.equal(result, true)
    })

    test('returns false when DB returns empty rows (no appointment)', async () => {
        const { createTriageService } = await import('../../services/triageService.js')
        const svc = createTriageService({ db: makeMockDB([]), aiService: makeMockAIService() })

        const result = await svc.hasUpcomingAppointment('+57123456789')

        assert.equal(result, false)
    })

    test('returns false when DB throws (error is silenced)', async () => {
        const { createTriageService } = await import('../../services/triageService.js')
        const errorDB = {
            async query() { throw new Error('connection refused') },
        }
        const svc = createTriageService({ db: errorDB, aiService: makeMockAIService() })

        const result = await svc.hasUpcomingAppointment('+57123456789')

        assert.equal(result, false)
    })
})
