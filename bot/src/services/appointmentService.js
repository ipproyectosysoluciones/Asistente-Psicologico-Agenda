import pg from 'pg'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export const BUSINESS_HOURS = {
    start: 9,
    end: 18,
    lunchStart: 12,
    lunchEnd: 13
}

export const DURATIONS = {
    'primera vez': 90,
    'seguimiento': 50,
    primera: 90,
    seguimiento: 50
}

export const DAYS = [2, 3, 4, 5, 6, 0]

export const appointmentService = {
    async getAvailableSlots(psychologistId, date, duration = 50) {
        const client = await pool.connect()
        try {
            const dayOfWeek = date.getDay()
            if (!DAYS.includes(dayOfWeek)) {
                return []
            }

            const existingAppointments = await client.query(`
                SELECT scheduled_at, duration_minutes 
                FROM appointments 
                WHERE psychologist_id = $1 
                AND DATE(scheduled_at) = $2 
                AND status NOT IN ('cancelled')
                AND deleted_at IS NULL
                ORDER BY scheduled_at
            `, [psychologistId, date])

            const slots = []
            const bufferMinutes = 10

            for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
                if (hour === BUSINESS_HOURS.lunchStart) continue

                const startTime = new Date(date)
                startTime.setHours(hour, 0, 0, 0)
                const endTime = new Date(startTime)
                endTime.setMinutes(endTime.getMinutes() + duration + bufferMinutes)

                if (endTime.getHours() >= BUSINESS_HOURS.end || endTime.getHours() === BUSINESS_HOURS.lunchStart) {
                    continue
                }

                let hasConflict = false
                for (const appt of existingAppointments.rows) {
                    const apptStart = new Date(appt.scheduled_at)
                    const apptEnd = new Date(apptStart)
                    apptEnd.setMinutes(apptEnd.getMinutes() + appt.duration_minutes + bufferMinutes)

                    if (startTime < apptEnd && endTime > apptStart) {
                        hasConflict = true
                        break
                    }
                }

                if (!hasConflict) {
                    slots.push({
                        time: `${String(hour).padStart(2, '0')}:00`,
                        display: `${hour}:00 hrs`
                    })
                }
            }

            return slots
        } finally {
            client.release()
        }
    },

    async isSlotAvailable(psychologistId, scheduledAt, duration) {
        const client = await pool.connect()
        try {
            const slotStart = new Date(scheduledAt)
            const slotEnd = new Date(slotStart)
            slotEnd.setMinutes(slotEnd.getMinutes() + duration)
            const bufferMinutes = 10

            const conflict = await client.query(`
                SELECT id FROM appointments 
                WHERE psychologist_id = $1 
                AND status NOT IN ('cancelled')
                AND deleted_at IS NULL
                AND (
                    (scheduled_at < $3 AND scheduled_at + (duration_minutes || ' minutes')::INTERVAL + ($4 || ' minutes')::INTERVAL > $2)
                    OR (scheduled_at >= $2 AND scheduled_at < $3)
                )
            `, [psychologistId, slotStart, slotEnd, bufferMinutes])

            return conflict.rows.length === 0
        } finally {
            client.release()
        }
    },

    async createAppointment({ psychologistId, patientId, scheduledAt, appointmentType, notes }) {
        const client = await pool.connect()
        try {
            const duration = DURATIONS[appointmentType] || 50
            const available = await this.isSlotAvailable(psychologistId, scheduledAt, duration)

            if (!available) {
                throw new Error('HORARIO_OCUPADO')
            }

            const result = await client.query(`
                INSERT INTO appointments (
                    psychologist_id, patient_id, scheduled_at, 
                    duration_minutes, appointment_type, status, session_notes
                ) VALUES ($1, $2, $3, $4, $5, 'scheduled', $6)
                RETURNING *
            `, [psychologistId, patientId, scheduledAt, duration, appointmentType, notes || null])

            return result.rows[0]
        } finally {
            client.release()
        }
    },

    async getPatientAppointments(patientId) {
        const result = await pool.query(`
            SELECT a.*, p.first_name, p.last_name, p.email
            FROM appointments a
            JOIN patients p ON p.id = a.patient_id
            WHERE a.patient_id = $1 
            AND a.deleted_at IS NULL
            AND a.scheduled_at >= NOW()
            ORDER BY a.scheduled_at
            LIMIT 10
        `, [patientId])

        return result.rows
    },

    async cancelAppointment(appointmentId, patientId) {
        const result = await pool.query(`
            UPDATE appointments 
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = $1 AND patient_id = $2 AND status = 'scheduled'
            RETURNING *
        `, [appointmentId, patientId])

        return result.rows[0]
    },

    async findPatientByEmail(email) {
        const result = await pool.query(
            `SELECT id, first_name, last_name, email
             FROM patients
             WHERE email = $1 AND deleted_at IS NULL
             LIMIT 1`,
            [email.toLowerCase()]
        )
        return result.rows[0] || null
    },

    async createPatient({ fullName, email, phone, psychologistId }) {
        const nameParts = (fullName || '').trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        const result = await pool.query(
            `INSERT INTO patients (psychologist_id, first_name, last_name, email, phone, consent_status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
             RETURNING id, first_name, last_name, email`,
            [psychologistId, firstName, lastName, email?.toLowerCase(), phone || null]
        )
        return result.rows[0]
    },

    validateTimeSlot(dateStr, hourStr) {
        const [year, month, day] = dateStr.split('-').map(Number)
        const scheduledAt = new Date(year, month - 1, day, ...hourStr.split(':').map(Number))

        const dayOfWeek = scheduledAt.getDay()
        if (!DAYS.includes(dayOfWeek)) {
            return { valid: false, error: 'No atendemos los días lunes.' }
        }

        const hour = scheduledAt.getHours()
        if (hour < BUSINESS_HOURS.start || hour >= BUSINESS_HOURS.end) {
            return { valid: false, error: 'Horario fuera de atención.' }
        }

        if (hour >= BUSINESS_HOURS.lunchStart && hour < BUSINESS_HOURS.lunchEnd) {
            return { valid: false, error: 'El horario de lunch es 12:00 a 13:00.' }
        }

        return { valid: true, scheduledAt }
    }
}