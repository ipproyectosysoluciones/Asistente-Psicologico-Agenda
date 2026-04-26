import pg from 'pg'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

// ─────────────────────────────────────────────────────────────────────────────
// Slot grid constants / Constantes de la grilla de horarios
// ─────────────────────────────────────────────────────────────────────────────

/** First bookable hour of the day / Primera hora reservable del día */
const SLOT_START_HOUR = 9

/** Last slot start hour (17:30 → ends 18:00) / Última hora de inicio de slot */
const SLOT_END_HOUR_LAST_START = 17
const SLOT_END_MINUTE_LAST_START = 30

/** Slot duration in minutes / Duración de cada slot en minutos */
const SLOT_INTERVAL_MINUTES = 30

/** Lunch window start / Inicio de la ventana de almuerzo */
const LUNCH_START_HOUR = 12

/** Lunch window end (exclusive) / Fin de la ventana de almuerzo (exclusivo) */
const LUNCH_END_HOUR = 13

/** Max slots returned per query / Máximo de slots devueltos por consulta */
const SLOT_MAX_RESULTS = 12

/** Weekday numbers (0=Sun, 1=Mon … 6=Sat) that are working days.
 *  Días de la semana (0=Dom … 6=Sáb) que son hábiles. */
const WORKING_WEEKDAYS = new Set([1, 2, 3, 4, 5]) // Mon–Fri

/** Max upcoming appointments returned for cancellation / Máximo de turnos próximos para cancelación */
const CANCEL_LOOKUP_LIMIT = 5

/**
 * Day-of-week name labels in Spanish (short).
 * Etiquetas cortas de día de la semana en español.
 * @type {string[]}
 */
const DAY_LABELS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/**
 * Month labels in Spanish (short).
 * Etiquetas cortas de mes en español.
 * @type {string[]}
 */
const MONTH_LABELS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

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

// ─────────────────────────────────────────────────────────────────────────────
// Sprint 2 — Booking / Cancellation service functions
// Sprint 2 — Funciones de servicio para reserva / cancelación
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the next N upcoming weekday dates starting from tomorrow.
 * Retorna los próximos N días hábiles comenzando desde mañana.
 *
 * @param {number} [limit=7] - Number of dates to return / Cantidad de fechas a devolver
 * @returns {Array<{label: string, value: string}>}
 *   label: human-readable "Lun 27/04" | value: ISO date "2026-04-27"
 */
export function getNextAvailableDates(limit = 7) {
    const results = []
    const cursor = new Date()
    cursor.setHours(0, 0, 0, 0)
    cursor.setDate(cursor.getDate() + 1) // start from tomorrow / empezar desde mañana

    while (results.length < limit) {
        const dow = cursor.getDay()
        if (WORKING_WEEKDAYS.has(dow)) {
            const dayLabel = DAY_LABELS_ES[dow]
            const dd = String(cursor.getDate()).padStart(2, '0')
            const mm = String(cursor.getMonth() + 1).padStart(2, '0')
            const yyyy = cursor.getFullYear()

            results.push({
                label: `${dayLabel} ${dd}/${mm}`,
                value: `${yyyy}-${mm}-${dd}`
            })
        }
        cursor.setDate(cursor.getDate() + 1)
    }

    return results
}

/**
 * Returns available 30-minute slots for a given date, excluding booked
 * (non-cancelled) slots and the lunch window (12:00–12:59).
 * Uses a single PostgreSQL generate_series query — no app-side filtering.
 *
 * Retorna los slots de 30 minutos disponibles para una fecha dada,
 * excluyendo turnos reservados (no cancelados) y el horario de almuerzo.
 * Usa una sola consulta generate_series — sin filtrado del lado del app.
 *
 * @param {string} dateISO - Date in "YYYY-MM-DD" format / Fecha en formato "YYYY-MM-DD"
 * @param {string} psychologistId - UUID of the psychologist / UUID del psicólogo
 * @returns {Promise<Array<{label: string, value: string}>>}
 *   label: "09:00" | value: ISO timestamp "2026-04-27T09:00:00"
 */
export async function getAvailableSlots(dateISO, psychologistId) {
    const client = await pool.connect()
    try {
        const result = await client.query(
            `WITH slot_grid AS (
                SELECT generate_series(
                    ($1::date + TIME '${SLOT_START_HOUR}:00'),
                    ($1::date + TIME '${SLOT_END_HOUR_LAST_START}:${String(SLOT_END_MINUTE_LAST_START).padStart(2, '0')}'),
                    INTERVAL '${SLOT_INTERVAL_MINUTES} minutes'
                ) AS slot
            ),
            booked AS (
                SELECT date_trunc('minute', start_time) AS slot
                FROM appointments
                WHERE start_time::date = $1::date
                  AND psychologist_id = $2
                  AND status <> 'cancelled'
            )
            SELECT slot
            FROM slot_grid
            WHERE slot NOT IN (SELECT slot FROM booked)
              AND EXTRACT(HOUR FROM slot) NOT BETWEEN $3 AND $4 - 1
            ORDER BY slot
            LIMIT ${SLOT_MAX_RESULTS}`,
            [dateISO, psychologistId, LUNCH_START_HOUR, LUNCH_END_HOUR]
        )

        return result.rows.map(row => {
            const dt = new Date(row.slot)
            const hh = String(dt.getUTCHours()).padStart(2, '0')
            const min = String(dt.getUTCMinutes()).padStart(2, '0')
            const isoVal = row.slot instanceof Date
                ? row.slot.toISOString().replace('Z', '')
                : String(row.slot)
            return {
                label: `${hh}:${min}`,
                value: isoVal
            }
        })
    } catch (err) {
        console.error('[appointmentService] getAvailableSlots error:', err.message)
        return []
    } finally {
        client.release()
    }
}

/**
 * Creates a new appointment in PostgreSQL with status 'pending' and
 * created_via 'whatsapp'. Returns a result object — never throws.
 *
 * Crea un nuevo turno en PostgreSQL con status 'pending' y
 * created_via 'whatsapp'. Devuelve un objeto resultado — nunca lanza.
 *
 * @param {{ patientId: string, psychologistId: string, startTime: string, endTime: string }} data
 * @returns {Promise<{ok: true, id: string} | {ok: false, reason: 'slot_taken'|'db_error'}>}
 */
export async function createAppointmentBot({ patientId, psychologistId, startTime, endTime }) {
    const client = await pool.connect()
    try {
        const result = await client.query(
            `INSERT INTO appointments
               (patient_id, psychologist_id, start_time, end_time, status, created_via, created_at)
             VALUES ($1, $2, $3, $4, 'pending', 'whatsapp', NOW())
             RETURNING id`,
            [patientId, psychologistId, startTime, endTime]
        )
        return { ok: true, id: result.rows[0].id }
    } catch (err) {
        // PostgreSQL error code 23505 = unique_violation / código 23505 = violación de unicidad
        if (err.code === '23505') {
            return { ok: false, reason: 'slot_taken' }
        }
        console.error('[appointmentService] createAppointmentBot error:', err.message)
        return { ok: false, reason: 'db_error' }
    } finally {
        client.release()
    }
}

/**
 * Returns upcoming non-cancelled appointments for a patient identified by email.
 * Max 5 results ordered by start_time ascending.
 *
 * Retorna los turnos próximos no cancelados de un paciente identificado por email.
 * Máximo 5 resultados ordenados por start_time ascendente.
 *
 * @param {string} email - Patient email / Email del paciente
 * @returns {Promise<Array<{id: string, start_time: Date, type: string, status: string}>>}
 */
export async function getUpcomingAppointmentsByEmail(email) {
    try {
        const result = await pool.query(
            `SELECT id, start_time, appointment_type AS type, status
             FROM appointments
             WHERE patient_email = $1
               AND start_time >= NOW()
               AND status <> 'cancelled'
             ORDER BY start_time ASC
             LIMIT ${CANCEL_LOOKUP_LIMIT}`,
            [email.toLowerCase().trim()]
        )
        return result.rows
    } catch (err) {
        console.error('[appointmentService] getUpcomingAppointmentsByEmail error:', err.message)
        return []
    }
}

/**
 * Soft-cancels an appointment by ID. Sets status='cancelled' and updated_at=NOW().
 * Returns a result object — never throws.
 *
 * Cancela suavemente un turno por ID. Establece status='cancelled' y updated_at=NOW().
 * Devuelve un objeto resultado — nunca lanza.
 *
 * @param {string} id - Appointment UUID / UUID del turno
 * @returns {Promise<{ok: true} | {ok: false, reason: 'already_cancelled'|'db_error'}>}
 */
export async function cancelAppointmentBot(id) {
    try {
        const result = await pool.query(
            `UPDATE appointments
             SET status = 'cancelled', updated_at = NOW()
             WHERE id = $1 AND status <> 'cancelled'
             RETURNING id`,
            [id]
        )
        if (result.rows.length === 0) {
            // No rows updated → appointment was already cancelled / Ya estaba cancelado
            return { ok: false, reason: 'already_cancelled' }
        }
        return { ok: true }
    } catch (err) {
        console.error('[appointmentService] cancelAppointmentBot error:', err.message)
        return { ok: false, reason: 'db_error' }
    }
}