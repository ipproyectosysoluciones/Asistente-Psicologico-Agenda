'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

// ── normalizePhone — format variations ───────────────────────────────────────

test('normalizePhone: "+57 310 123 4567" stays E.164', async () => {
    const { normalizePhone } = await import('../../utils/normalizePhone.js')
    assert.equal(normalizePhone('+57 310 123 4567'), '+573101234567')
})

test('normalizePhone: "0057310..." converts to +57...', async () => {
    const { normalizePhone } = await import('../../utils/normalizePhone.js')
    assert.equal(normalizePhone('00573101234567'), '+573101234567')
})

test('normalizePhone: "310-123-4567" gets country prefix appended', async () => {
    const { normalizePhone } = await import('../../utils/normalizePhone.js')
    assert.equal(normalizePhone('310-123-4567'), '+573101234567')
})

test('normalizePhone: "57310..." already has code digits, formats correctly', async () => {
    const { normalizePhone } = await import('../../utils/normalizePhone.js')
    assert.equal(normalizePhone('573101234567'), '+573101234567')
})

test('normalizePhone: number without prefix gets +57 prepended', async () => {
    const { normalizePhone } = await import('../../utils/normalizePhone.js')
    assert.equal(normalizePhone('3101234567'), '+573101234567')
})

test('normalizePhone: spaces and dashes stripped', async () => {
    const { normalizePhone } = await import('../../utils/normalizePhone.js')
    assert.equal(normalizePhone('310 123-4567'), '+573101234567')
})

test('normalizePhone: explicit defaultCountry overrides env', async () => {
    const { normalizePhone } = await import('../../utils/normalizePhone.js')
    // +52 5512345678 (Mexico City full E.164 with country code already present)
    assert.equal(normalizePhone('+52 55 1234 5678', '+52'), '+525512345678')
})

test('normalizePhone: empty string returns empty string', async () => {
    const { normalizePhone } = await import('../../utils/normalizePhone.js')
    assert.equal(normalizePhone(''), '')
})

// ── lookupPatientId — pg stub ─────────────────────────────────────────────────

test('lookupPatientId: returns UUID when patient found', async () => {
    const { lookupPatientId } = await import('../../utils/normalizePhone.js')
    const mockDb = {
        async query(sql, params) {
            assert.ok(sql.includes('SELECT id FROM patients'))
            assert.equal(params[0], '+573101234567')
            return { rows: [{ id: 'patient-uuid-1234' }] }
        }
    }
    const id = await lookupPatientId(mockDb, '+573101234567')
    assert.equal(id, 'patient-uuid-1234')
})

test('lookupPatientId: returns null when patient not found', async () => {
    const { lookupPatientId } = await import('../../utils/normalizePhone.js')
    const mockDb = {
        async query() { return { rows: [] } }
    }
    const id = await lookupPatientId(mockDb, '+573100000000')
    assert.equal(id, null)
})

test('lookupPatientId: returns null on db error (no throw)', async () => {
    const { lookupPatientId } = await import('../../utils/normalizePhone.js')
    const mockDb = {
        async query() { throw new Error('connection refused') }
    }
    const id = await lookupPatientId(mockDb, '+573100000000')
    assert.equal(id, null)
})
