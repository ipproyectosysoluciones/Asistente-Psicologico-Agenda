'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

// ── Positive cases — should return true ──────────────────────────────────────

test('detect: "ya no aguanto más" returns true', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('ya no aguanto más'), true)
})

test('detect: "quiero hacerme daño" returns true', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('quiero hacerme daño'), true)
})

test('detect: "necesito ayuda urgente" returns true', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('necesito ayuda urgente'), true)
})

test('detect: "estoy en crisis" returns true', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('estoy en crisis'), true)
})

test('detect: "no quiero vivir" returns true', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('no quiero vivir'), true)
})

test('detect: "suicidio" keyword returns true', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('estoy pensando en el suicidio'), true)
})

test('detect: "quitarme la vida" returns true', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('estoy pensando en quitarme la vida'), true)
})

test('detect: mixed-case "DESESPERADO" returns true', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('ESTOY DESESPERADO'), true)
})

// ── Negative cases — should return false ─────────────────────────────────────

test('detect: "hola" returns false', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('hola'), false)
})

test('detect: "quiero una cita" returns false', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('quiero una cita'), false)
})

test('detect: "cuánto cuesta la consulta" returns false', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('cuánto cuesta la consulta'), false)
})

test('detect: "buenos días" returns false', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('buenos días'), false)
})

test('detect: "quiero agendar para el martes" returns false', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect('quiero agendar para el martes'), false)
})

// ── Edge cases ────────────────────────────────────────────────────────────────

test('detect: empty string returns false', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect(''), false)
})

test('detect: null input returns false', async () => {
    const { detect } = await import('../../utils/distressDetector.js')
    assert.equal(detect(null), false)
})
