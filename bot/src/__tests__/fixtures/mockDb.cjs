'use strict'

function makeMockDb({ appointments = [] } = {}) {
  const inserted = []

  return {
    _inserted: inserted,
    async connect() {
      return {
        query: async (sql, params) => ({ rows: [] }),
        release() {}
      }
    },
    async query(sql, params) {
      const s = sql.toLowerCase().trim()

      if (s.startsWith('select') && s.includes('slot_grid')) {
        return { rows: appointments }
      }

      if (s.startsWith('insert into appointments')) {
        const row = { id: 'test-uuid-1234' }
        inserted.push({ sql, params })
        return { rows: [row] }
      }

      if (s.startsWith('update appointments') && s.includes("status = 'cancelled'")) {
        const id = params[0]
        const match = appointments.find(a => a.id === id && a.status !== 'cancelled')
        if (match) {
          match.status = 'cancelled'
          return { rows: [{ id }] }
        }
        return { rows: [] }
      }

      return { rows: [] }
    }
  }
}

module.exports = { makeMockDb }
