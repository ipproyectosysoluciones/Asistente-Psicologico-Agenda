'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { makeMockDb } = require('./fixtures/mockDb.cjs')

test('getAvailableSlots: fully-booked date returns []', async () => {
  const db = makeMockDb()
  const { createAppointmentService } = await import('../services/appointmentService.js')
  const svc = createAppointmentService(db)

  const slots = await svc.getAvailableSlots('2026-04-28', 'psych-uuid')

  assert.deepEqual(slots, [])
})

test('createAppointmentBot: happy path returns {ok:true} and inserts one row', async () => {
  const db = makeMockDb()
  const { createAppointmentService } = await import('../services/appointmentService.js')
  const svc = createAppointmentService(db)

  const result = await svc.createAppointmentBot({
    patientId: 'patient-uuid',
    psychologistId: 'psych-uuid',
    startTime: '2026-04-28T10:00:00',
    endTime: '2026-04-28T10:30:00',
  })

  assert.equal(result.ok, true)
  assert.equal(result.id, 'test-uuid-1234')
  assert.equal(db._inserted.length, 1)
})

test('cancelAppointmentBot: cancels existing appointment returns {ok:true}', async () => {
  const appointments = [{ id: 'appt-uuid-1', status: 'scheduled' }]
  const db = makeMockDb({ appointments })
  const { createAppointmentService } = await import('../services/appointmentService.js')
  const svc = createAppointmentService(db)

  const result = await svc.cancelAppointmentBot('appt-uuid-1')

  assert.equal(result.ok, true)
  assert.equal(appointments[0].status, 'cancelled')
})
