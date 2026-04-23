const pg = require('pg')
const { Pool } = pg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://admin:admin@localhost:5432/asistente_psicologico'
})

const BUSINESS_HOURS = {
    start: 9,
    end: 18,
    lunchStart: 12,
    lunchEnd: 13
}

const DURATIONS = {
    'primera vez': 90,
    'seguimiento': 50,
    primera: 90,
    seguimiento: 50
}

const appointmentService = {
    async getAll() {
        const result = await pool.query('SELECT * FROM appointments ORDER BY date, time')
        return result.rows
    },

    async getByEmail(email) {
        const result = await pool.query('SELECT * FROM appointments WHERE email = $1 ORDER BY date DESC', [email])
        return result.rows
    },

    async create(data) {
        const { fullName, email, date, time, type } = data
        const result = await pool.query(
            'INSERT INTO appointments (full_name, email, date, time, type, confirmed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [fullName, email, date, time, type, false]
        )
        return result.rows[0]
    },

    async confirm(id) {
        await pool.query('UPDATE appointments SET confirmed = true WHERE id = $1', [id])
    },

    async cancel(id) {
        await pool.query('UPDATE appointments SET status = $1, cancelled_at = NOW() WHERE id = $2', ['cancelled', id])
    }
}

module.exports = {
    appointmentService,
    BUSINESS_HOURS,
    DURATIONS
}