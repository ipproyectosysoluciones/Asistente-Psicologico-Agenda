import { addAnswer, addKeyword } from '@builderbot/bot'
import {
    appointmentService,
    DURATIONS,
    getNextAvailableDates,
    getAvailableSlots,
    createAppointmentBot,
    getUpcomingAppointmentsByEmail,
    cancelAppointmentBot
} from '../services/appointmentService.js'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers / Funciones auxiliares
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses a DD/MM/YYYY string and validates that it is a future weekday.
 * Analiza un string DD/MM/YYYY y valida que sea un día hábil futuro.
 *
 * @param {string} raw - Raw user input / Texto ingresado por el usuario
 * @returns {{ ok: true, isoDate: string } | { ok: false, reason: string }}
 */
function parseDDMMYYYY(raw) {
    const trimmed = (raw || '').trim()
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
        return { ok: false, reason: 'formato' }
    }
    const [dd, mm, yyyy] = trimmed.split('/').map(Number)
    const date = new Date(yyyy, mm - 1, dd)
    // Validate calendar (e.g. 31/02 would shift) / Validar calendario
    if (date.getFullYear() !== yyyy || date.getMonth() + 1 !== mm || date.getDate() !== dd) {
        return { ok: false, reason: 'formato' }
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date <= today) {
        return { ok: false, reason: 'pasado' }
    }
    const dow = date.getDay()
    if (dow === 0 || dow === 6) {
        return { ok: false, reason: 'finde' }
    }
    const mmStr = String(mm).padStart(2, '0')
    const ddStr = String(dd).padStart(2, '0')
    return { ok: true, isoDate: `${yyyy}-${mmStr}-${ddStr}` }
}

/**
 * Formats a Date (or ISO string from DB) as "DD/MM/YYYY HH:MM".
 * Formatea una Date (o ISO string de DB) como "DD/MM/YYYY HH:MM".
 *
 * @param {Date|string} dt
 * @returns {string}
 */
function formatDateTime(dt) {
    const d = dt instanceof Date ? dt : new Date(dt)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

/**
 * Formats a Date (or ISO string) as "DD/MM/YYYY".
 * Formatea una Date (o ISO string) como "DD/MM/YYYY".
 *
 * @param {Date|string} dt
 * @returns {string}
 */
function formatDate(dt) {
    const d = dt instanceof Date ? dt : new Date(dt)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}/${d.getFullYear()}`
}

/**
 * Builds a human-readable numbered slot list split into Morning / Afternoon.
 * Construye una lista numerada de slots legible dividida en Mañana / Tarde.
 *
 * @param {Array<{label: string, value: string}>} slots
 * @returns {string}
 */
function buildSlotListText(slots) {
    const morning = slots.filter(s => {
        const h = parseInt(s.label.split(':')[0], 10)
        return h < 12
    })
    const afternoon = slots.filter(s => {
        const h = parseInt(s.label.split(':')[0], 10)
        return h >= 13
    })

    let text = ''
    if (morning.length > 0) {
        text += '*Mañana:*\n'
        morning.forEach((s, i) => { text += `  ${i + 1}. ${s.label}\n` })
    }
    if (afternoon.length > 0) {
        const offset = morning.length
        text += '*Tarde:*\n'
        afternoon.forEach((s, i) => { text += `  ${offset + i + 1}. ${s.label}\n` })
    }
    return text.trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2: Appointment Booking Flow / Flujo de reserva de turno
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main booking flow — triggered by booking keywords.
 * Flujo principal de reserva — disparado por palabras clave de reserva.
 *
 * Steps:
 *   1. Show 7 weekday date buttons + "Otra fecha"
 *   2. Show available slots for selected date
 *   2b. "Otra fecha" branch: capture + validate DD/MM/YYYY
 *   3. Confirmation summary (no DB write)
 *   4. Confirm → createAppointmentBot() | Cancel → exit
 */
export const appointmentFlow = addKeyword(['agendar', 'cita', 'turno', 'reservar'])
    .addAnswer(
        '📅 *Reservar Turno*\n\n¿Cuál es tu email?',
        { capture: true },
        async (ctx, { state }) => {
            await state.update({ email: ctx.body.trim(), step: 'email' })
            console.log(`[appointmentFlow] step=email_captured phone=${ctx.from?.slice(-4)}`)
        }
    )
    .addAnswer(
        '¿Cuál es tu nombre completo?',
        { capture: true },
        async (ctx, { state }) => {
            await state.update({ fullName: ctx.body.trim() })
        }
    )
    .addAnswer(
        '*¿Qué fecha preferís?*\n\nElegí un número o escribí *otra* para ingresar una fecha manualmente:',
        { capture: true },
        async (ctx, { state, flowDynamic }) => {
            // Build and show date list / Mostrar lista de fechas
            const dates = getNextAvailableDates(7)
            let dateMenu = ''
            dates.forEach((d, i) => { dateMenu += `  ${i + 1}. ${d.label}\n` })
            dateMenu += `  8. Otra fecha (DD/MM/YYYY)`

            await flowDynamic(dateMenu)
            await state.update({ _availableDates: dates, step: 'date_menu' })
            console.log(`[appointmentFlow] step=date_menu_shown phone=${ctx.from?.slice(-4)}`)
        }
    )
    .addAnswer(
        'Seleccioná el número de la fecha o escribí la fecha en formato *DD/MM/YYYY*:',
        { capture: true },
        async (ctx, { state, flowDynamic }) => {
            const input = ctx.body.trim()
            const stateData = await state.getAll()
            const dates = stateData._availableDates || []

            let chosenISO = null
            let chosenLabel = null

            // Numeric choice from the menu / Elección numérica del menú
            const num = parseInt(input, 10)
            if (!isNaN(num) && num >= 1 && num <= dates.length) {
                const picked = dates[num - 1]
                chosenISO = picked.value
                chosenLabel = picked.label
            } else if (!isNaN(num) && num === dates.length + 1) {
                // "Otra fecha" option / Opción "Otra fecha"
                await state.update({ step: 'custom_date' })
                await flowDynamic('Ingresá la fecha en formato *DD/MM/YYYY* (ej: 15/05/2026):')
                return
            } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
                // Direct DD/MM/YYYY entry / Ingreso directo DD/MM/YYYY
                const parsed = parseDDMMYYYY(input)
                if (!parsed.ok) {
                    const msgs = {
                        pasado: '❌ Esa fecha ya pasó. Ingresá una fecha futura.',
                        finde: '❌ Los fines de semana no hay atención. Ingresá un día de semana.',
                        formato: '❌ Formato inválido. Usá *DD/MM/YYYY* (ej: 15/05/2026).'
                    }
                    await flowDynamic(msgs[parsed.reason] || msgs.formato)
                    await state.update({ _error: true })
                    return
                }
                chosenISO = parsed.isoDate
                const [yyyy, mm, dd] = chosenISO.split('-')
                chosenLabel = `${dd}/${mm}/${yyyy}`
            } else {
                await flowDynamic('❌ Opción inválida. Ingresá un número de la lista o una fecha en formato *DD/MM/YYYY*.')
                await state.update({ _error: true })
                return
            }

            // Fetch slots / Obtener slots
            const psychologistId = process.env.DEFAULT_PSYCHOLOGIST_ID
            const slots = await getAvailableSlots(chosenISO, psychologistId)
            console.log(`[appointmentFlow] step=date_selected phone=${ctx.from?.slice(-4)} date=${chosenISO} slots=${slots.length}`)

            if (slots.length === 0) {
                await flowDynamic(`No hay horarios disponibles para el ${chosenLabel}. Probá con otro día.\n\nEscribí *agendar* para volver a empezar.`)
                await state.clear()
                return
            }

            const slotText = buildSlotListText(slots)
            await flowDynamic(`*Horarios disponibles para ${chosenLabel}:*\n\n${slotText}\n\nElegí el número del horario:`)
            await state.update({
                chosenDate: chosenISO,
                chosenDateLabel: chosenLabel,
                _slots: slots,
                step: 'slot_menu'
            })
        }
    )
    .addAnswer(
        'Número de horario:',
        { capture: true },
        async (ctx, { state, flowDynamic }) => {
            const stateData = await state.getAll()

            if (stateData._error) {
                await state.clear()
                return
            }

            // Handle custom date branch / Manejar rama de fecha personalizada
            if (stateData.step === 'custom_date') {
                const parsed = parseDDMMYYYY(ctx.body.trim())
                if (!parsed.ok) {
                    const msgs = {
                        pasado: '❌ Esa fecha ya pasó. Ingresá una fecha futura.',
                        finde: '❌ Los fines de semana no hay atención. Ingresá un día de semana.',
                        formato: '❌ Formato inválido. Usá *DD/MM/YYYY* (ej: 15/05/2026).'
                    }
                    await flowDynamic(msgs[parsed.reason] || msgs.formato)
                    await flowDynamic('Escribí *agendar* para reiniciar.')
                    await state.clear()
                    return
                }

                const psychologistId = process.env.DEFAULT_PSYCHOLOGIST_ID
                const slots = await getAvailableSlots(parsed.isoDate, psychologistId)
                const [yyyy, mm, dd] = parsed.isoDate.split('-')
                const label = `${dd}/${mm}/${yyyy}`

                console.log(`[appointmentFlow] step=custom_date_resolved phone=${ctx.from?.slice(-4)} date=${parsed.isoDate} slots=${slots.length}`)

                if (slots.length === 0) {
                    await flowDynamic(`No hay horarios disponibles para el ${label}. Probá con otro día.\n\nEscribí *agendar* para volver a empezar.`)
                    await state.clear()
                    return
                }

                const slotText = buildSlotListText(slots)
                await flowDynamic(`*Horarios disponibles para ${label}:*\n\n${slotText}\n\nElegí el número del horario:`)
                await state.update({
                    chosenDate: parsed.isoDate,
                    chosenDateLabel: label,
                    _slots: slots,
                    step: 'slot_menu'
                })
                return
            }

            // Slot selection / Selección de slot
            const slots = stateData._slots || []
            const num = parseInt(ctx.body.trim(), 10)
            if (isNaN(num) || num < 1 || num > slots.length) {
                await flowDynamic(`❌ Elegí un número entre 1 y ${slots.length}.`)
                await state.update({ _error: true })
                return
            }

            const chosenSlot = slots[num - 1]
            console.log(`[appointmentFlow] step=slot_selected phone=${ctx.from?.slice(-4)} slot=${chosenSlot.label}`)

            await state.update({ chosenSlot, step: 'confirm' })
            await flowDynamic(
                `📋 *Resumen del turno:*\n\n` +
                `• Fecha: ${stateData.chosenDateLabel}\n` +
                `• Hora: ${chosenSlot.label}\n` +
                `• Nombre: ${stateData.fullName}\n` +
                `• Email: ${stateData.email}\n\n` +
                `Respondé *1* para Confirmar o *2* para Cancelar.`
            )
        }
    )
    .addAnswer(
        '¿Confirmás? (1 = Confirmar / 2 = Cancelar):',
        { capture: true },
        async (ctx, { state, flowDynamic }) => {
            const stateData = await state.getAll()

            if (stateData._error || stateData.step !== 'confirm') {
                await state.clear()
                return
            }

            const answer = ctx.body.trim()

            if (answer === '2' || answer.toLowerCase().includes('cancel')) {
                console.log(`[appointmentFlow] step=user_cancelled phone=${ctx.from?.slice(-4)}`)
                await flowDynamic('Está bien, no se realizó ningún cambio. Escribí *menu* para volver al inicio.')
                await state.clear()
                return
            }

            if (answer !== '1' && !answer.toLowerCase().includes('confirm')) {
                await flowDynamic('Respondé *1* para Confirmar o *2* para Cancelar.')
                return
            }

            // ── DB write / Escritura en DB ────────────────────────────────────
            const psychologistId = process.env.DEFAULT_PSYCHOLOGIST_ID
            const slot = stateData.chosenSlot

            // Calculate end time (30 min slot) / Calcular hora de fin (slot de 30 min)
            const startDt = new Date(slot.value)
            const endDt = new Date(startDt.getTime() + 30 * 60 * 1000)

            // Find or create patient / Buscar o crear paciente
            let patientId = null
            try {
                let patient = await appointmentService.findPatientByEmail(stateData.email)
                if (!patient) {
                    patient = await appointmentService.createPatient({
                        fullName: stateData.fullName,
                        email: stateData.email,
                        phone: ctx.from,
                        psychologistId
                    })
                }
                patientId = patient.id
            } catch (err) {
                console.error('[appointmentFlow] patient lookup/create error:', err.message)
                await flowDynamic('❌ Hubo un error. Por favor intentá de nuevo o contactanos.')
                await state.clear()
                return
            }

            console.log(`[appointmentFlow] step=insert_attempt phone=${ctx.from?.slice(-4)} date=${stateData.chosenDate} slot=${slot.label}`)

            const result = await createAppointmentBot({
                patientId,
                psychologistId,
                startTime: startDt.toISOString(),
                endTime: endDt.toISOString()
            })

            if (result.ok) {
                console.log(`[appointmentFlow] step=insert_ok id=${result.id} phone=${ctx.from?.slice(-4)}`)
                await flowDynamic(
                    `✅ Turno confirmado para el ${stateData.chosenDateLabel} a las ${slot.label}.\n` +
                    `Te enviaremos un recordatorio.\n\nEscribí *menu* para volver al inicio.`
                )
                await state.clear()
                return
            }

            if (result.reason === 'slot_taken') {
                console.warn(`[appointmentFlow] step=insert_conflict phone=${ctx.from?.slice(-4)} reason=slot_taken`)
                // Re-query and re-present slots / Re-consultar y re-mostrar slots
                const freshSlots = await getAvailableSlots(stateData.chosenDate, psychologistId)
                if (freshSlots.length === 0) {
                    await flowDynamic(`⚠️ Ese horario se ocupó y ya no hay más disponibles para el ${stateData.chosenDateLabel}.\n\nEscribí *agendar* para elegir otro día.`)
                    await state.clear()
                    return
                }
                const slotText = buildSlotListText(freshSlots)
                await flowDynamic(`⚠️ Ese horario se ocupó. Elegí otro:\n\n${slotText}`)
                await state.update({ _slots: freshSlots, step: 'slot_menu' })
                return
            }

            // db_error / error de base de datos
            console.error(`[appointmentFlow] step=db_error phone=${ctx.from?.slice(-4)}`)
            await flowDynamic('❌ Hubo un error. Por favor intentá de nuevo o contactanos.')
            await state.clear()
        }
    )

// ─────────────────────────────────────────────────────────────────────────────
// Existing flows (unchanged — regression boundary)
// Flows existentes (sin cambios — límite de regresión)
// ─────────────────────────────────────────────────────────────────────────────

export const primeraVezFlow = addKeyword(['primera vez', '👤 Primera vez'])
    .addAnswer(
        '👤 *Primera Consulta*\n\n• Duración: 90 min\n• Costo: $60 USD\n\n*¿Cuál es tu nombre completo?*',
        { capture: true },
        async (ctx, { state }) => {
            await state.update({ appointmentType: 'primera vez', fullName: ctx.body.trim() })
        }
    )
    .addAnswer('*¿Cuál es tu email?*', { capture: true }, async (ctx, { state }) => {
        await state.update({ email: ctx.body.trim() })
    })
    .addAnswer('*¿Qué fecha?*\n\n_Formato: YYYY-MM-DD — Ej: 2025-05-15_', { capture: true }, async (ctx, { state }) => {
        await state.update({ dateStr: ctx.body.trim() })
    })
    .addAnswer('*¿Qué hora?*\n\n_Formato: HH:MM — Ej: 14:00_', { capture: true }, async (ctx, { state, flowDynamic }) => {
        const hourStr = ctx.body.trim()
        const stateData = await state.getAll()

        if (!stateData.email?.includes('@')) {
            await flowDynamic('❌ Email inválido.\n\nEscribí *primera vez* para reiniciar.')
            await state.update({ _error: true })
            return
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(stateData.dateStr)) {
            await flowDynamic('❌ Fecha inválida (YYYY-MM-DD).\n\nEscribí *primera vez* para reiniciar.')
            await state.update({ _error: true })
            return
        }
        if (!/^\d{2}:\d{2}$/.test(hourStr)) {
            await flowDynamic('❌ Hora inválida (HH:MM).\n\nEscribí *primera vez* para reiniciar.')
            await state.update({ _error: true })
            return
        }

        const validation = appointmentService.validateTimeSlot(stateData.dateStr, hourStr)
        if (!validation.valid) {
            await flowDynamic(`❌ ${validation.error}\n\nEscribí *primera vez* para reiniciar.`)
            await state.update({ _error: true })
            return
        }

        const psychologistId = process.env.DEFAULT_PSYCHOLOGIST_ID
        const available = await appointmentService.isSlotAvailable(
            psychologistId, validation.scheduledAt, DURATIONS['primera vez']
        )
        if (!available) {
            await flowDynamic('⚠️ Ese horario ya está ocupado.\n\nEscribí *primera vez* para elegir otro horario.')
            await state.update({ _error: true })
            return
        }

        await state.update({ hourStr, scheduledAt: validation.scheduledAt })
        await flowDynamic(
            `📋 *Resumen de Cita*\n\n• Tipo: Primera vez\n• Nombre: ${stateData.fullName}\n• Fecha: ${stateData.dateStr}\n• Hora: ${hourStr}\n• Duración: ${DURATIONS['primera vez']} min`
        )
    })
    .addAnswer('*¿Confirmás la cita?*', {
        capture: true,
        buttons: [{ body: '✅ Confirmar' }, { body: '❌ Cancelar' }]
    }, async (ctx, { state, flowDynamic }) => {
        const stateData = await state.getAll()

        if (stateData._error) {
            await state.clear()
            return
        }

        if (ctx.body.toLowerCase().includes('cancel')) {
            await flowDynamic('❌ Cita cancelada. Escribí *menu*.')
            await state.clear()
            return
        }

        try {
            const psychologistId = process.env.DEFAULT_PSYCHOLOGIST_ID
            let patient = await appointmentService.findPatientByEmail(stateData.email)
            if (!patient) {
                patient = await appointmentService.createPatient({
                    fullName: stateData.fullName,
                    email: stateData.email,
                    psychologistId
                })
            }

            await appointmentService.createAppointment({
                psychologistId,
                patientId: patient.id,
                scheduledAt: stateData.scheduledAt,
                appointmentType: 'primera vez'
            })

            await flowDynamic(
                `✅ *¡Cita Agendada!*\n\n📅 ${stateData.dateStr} a las ${stateData.hourStr}\n• Primera vez — ${DURATIONS['primera vez']} min\n\nTe contactaremos para confirmar.\n\nEscribí *menu*.`
            )
        } catch (error) {
            if (error.message === 'HORARIO_OCUPADO') {
                await flowDynamic('⚠️ Horario ocupado. Escribí *primera vez* para elegir otro.')
            } else {
                console.error('Appointment error:', error)
                await flowDynamic('⚠️ Error al agendar. Contactanos directamente.')
            }
        }

        await state.clear()
    })

export const seguimientoFlow = addKeyword(['seguimiento', '🔄 Seguimiento'])
    .addAnswer(
        '🔄 *Seguimiento*\n\n• Duración: 50 min\n• Costo: $45 USD\n\n*¿Cuál es tu email de registro?*',
        { capture: true },
        async (ctx, { state }) => {
            await state.update({ appointmentType: 'seguimiento', email: ctx.body.trim() })
        }
    )
    .addAnswer('*¿Qué fecha?*\n\n_Formato: YYYY-MM-DD — Ej: 2025-05-15_', { capture: true }, async (ctx, { state }) => {
        await state.update({ dateStr: ctx.body.trim() })
    })
    .addAnswer('*¿Qué hora?*\n\n_Formato: HH:MM — Ej: 14:00_', { capture: true }, async (ctx, { state, flowDynamic }) => {
        const hourStr = ctx.body.trim()
        const stateData = await state.getAll()

        if (!/^\d{4}-\d{2}-\d{2}$/.test(stateData.dateStr)) {
            await flowDynamic('❌ Fecha inválida. Escribí *seguimiento* para reiniciar.')
            await state.update({ _error: true })
            return
        }
        if (!/^\d{2}:\d{2}$/.test(hourStr)) {
            await flowDynamic('❌ Hora inválida. Escribí *seguimiento* para reiniciar.')
            await state.update({ _error: true })
            return
        }

        const validation = appointmentService.validateTimeSlot(stateData.dateStr, hourStr)
        if (!validation.valid) {
            await flowDynamic(`❌ ${validation.error}\n\nEscribí *seguimiento* para reiniciar.`)
            await state.update({ _error: true })
            return
        }

        const psychologistId = process.env.DEFAULT_PSYCHOLOGIST_ID
        const available = await appointmentService.isSlotAvailable(
            psychologistId, validation.scheduledAt, DURATIONS['seguimiento']
        )
        if (!available) {
            await flowDynamic('⚠️ Horario ocupado. Escribí *seguimiento* para elegir otro.')
            await state.update({ _error: true })
            return
        }

        await state.update({ hourStr, scheduledAt: validation.scheduledAt })
        await flowDynamic(
            `📋 *Resumen:*\n\n• Tipo: Seguimiento\n• Fecha: ${stateData.dateStr}\n• Hora: ${hourStr}\n• Duración: ${DURATIONS['seguimiento']} min`
        )
    })
    .addAnswer('*¿Confirmás?*', {
        capture: true,
        buttons: [{ body: '✅ Confirmar' }, { body: '❌ Cancelar' }]
    }, async (ctx, { state, flowDynamic }) => {
        const stateData = await state.getAll()

        if (stateData._error) {
            await state.clear()
            return
        }

        if (ctx.body.toLowerCase().includes('cancel')) {
            await flowDynamic('❌ Cita cancelada. Escribí *menu*.')
            await state.clear()
            return
        }

        try {
            const patient = await appointmentService.findPatientByEmail(stateData.email)

            await appointmentService.createAppointment({
                psychologistId: process.env.DEFAULT_PSYCHOLOGIST_ID,
                patientId: patient?.id || null,
                scheduledAt: stateData.scheduledAt,
                appointmentType: 'seguimiento'
            })

            await flowDynamic(
                `✅ *¡Cita Agendada!*\n\n📅 ${stateData.dateStr} a las ${stateData.hourStr}\n• Seguimiento — ${DURATIONS['seguimiento']} min\n\nTe contactaremos para confirmar.\n\nEscribí *menu*.`
            )
        } catch (error) {
            if (error.message === 'HORARIO_OCUPADO') {
                await flowDynamic('⚠️ Horario ocupado. Escribí *seguimiento* para elegir otro.')
            } else {
                console.error('Appointment error:', error)
                await flowDynamic('⚠️ Error al agendar. Contactanos directamente.')
            }
        }

        await state.clear()
    })

// appointmentStatusFlow is a regression boundary — DO NOT MODIFY.
// appointmentStatusFlow es un límite de regresión — NO MODIFICAR.
export const appointmentStatusFlow = addKeyword(['mis citas', 'ver cita', 'mi cita', 'citas'])
    .addAnswer('📅 *Tus Citas*\n\n*Escribí tu email:*', { capture: true }, async (ctx, { flowDynamic }) => {
        const email = ctx.body.trim()
        const patient = await appointmentService.findPatientByEmail(email)

        if (!patient) {
            await flowDynamic('📭 No encontré citas para ese email.\n\nEscribí *menu*.')
            return
        }

        const appointments = await appointmentService.getPatientAppointments(patient.id)

        if (!appointments || appointments.length === 0) {
            await flowDynamic('📭 No tenés citas programadas.\n\nEscribí *agendar* para solicitar una.')
            return
        }

        let response = '*📅 Tus Citas:*\n\n'
        for (const appt of appointments) {
            const date = new Date(appt.scheduled_at)
            const dateStr = date.toLocaleDateString('es-MX', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })
            response += `📌 *${dateStr}*\n`
            response += `   ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} — ${appt.appointment_type}\n`
            response += `   Estado: ${appt.status}\n\n`
        }

        await flowDynamic(response, {
            buttons: [
                { body: '🏠 Menú Principal' },
                { body: '📅 Nueva Cita' }
            ]
        })
    })

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3: Cancellation Flow / Flujo de cancelación de turno
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cancellation flow — triggered by "cancelar" keywords.
 * Flujo de cancelación — disparado por palabras clave de cancelar.
 *
 * Steps:
 *   1. Ask for email
 *   2. Query upcoming appointments (0→exit, 1→direct confirm, 2-5→numbered list)
 *   3. 2-hour cutoff check
 *   4. Confirm → cancelAppointmentBot() | Decline → exit
 */
export const cancelAppointmentFlow = addKeyword(['cancelar cita', 'cancelar', 'reagendar'])
    .addAnswer(
        '📅 *Cancelar Turno*\n\nEscribí tu email de registro:',
        { capture: true },
        async (ctx, { state }) => {
            await state.update({ email: ctx.body.trim().toLowerCase() })
            console.log(`[cancelFlow] step=email_captured phone=${ctx.from?.slice(-4)}`)
        }
    )
    .addAnswer(
        'Buscando tus turnos...',
        { capture: false },
        async (ctx, { state, flowDynamic }) => {
            const stateData = await state.getAll()
            const email = stateData.email

            const appointments = await getUpcomingAppointmentsByEmail(email)
            console.log(`[cancelFlow] step=lookup_done phone=${ctx.from?.slice(-4)} email_local=${email.split('@')[0]} count=${appointments.length}`)

            if (appointments.length === 0) {
                await flowDynamic('No tenés turnos próximos pendientes.\n\nEscribí *menu* para volver al inicio.')
                await state.clear()
                return
            }

            await state.update({ _appointments: appointments })

            if (appointments.length === 1) {
                // Single appointment — show details and ask directly
                // Un solo turno — mostrar detalles y preguntar directamente
                const appt = appointments[0]
                const dtStr = formatDateTime(appt.start_time)
                await flowDynamic(
                    `Tenés este turno próximo:\n\n` +
                    `📅 ${dtStr} — ${appt.type || 'Consulta'}\n\n` +
                    `¿Querés cancelarlo? Respondé *1* para Sí o *2* para No.`
                )
                await state.update({ selectedApptId: appt.id, selectedApptStart: appt.start_time, step: 'confirm_cancel' })
            } else {
                // Multiple appointments — show numbered list
                // Múltiples turnos — mostrar lista numerada
                let listText = 'Tus próximos turnos:\n\n'
                appointments.forEach((appt, i) => {
                    listText += `  ${i + 1}. ${formatDateTime(appt.start_time)} — ${appt.type || 'Consulta'}\n`
                })
                listText += '\nElegí el número del turno que querés cancelar:'
                await flowDynamic(listText)
                await state.update({ step: 'select_appt' })
            }
        }
    )
    .addAnswer(
        'Tu elección:',
        { capture: true },
        async (ctx, { state, flowDynamic }) => {
            const stateData = await state.getAll()

            if (!stateData.step) {
                await state.clear()
                return
            }

            // ── Selection step (multiple appointments) ────────────────────────
            if (stateData.step === 'select_appt') {
                const appointments = stateData._appointments || []
                const num = parseInt(ctx.body.trim(), 10)
                if (isNaN(num) || num < 1 || num > appointments.length) {
                    await flowDynamic(`❌ Elegí un número entre 1 y ${appointments.length}.`)
                    await state.update({ _error: true })
                    return
                }
                const picked = appointments[num - 1]
                await state.update({
                    selectedApptId: picked.id,
                    selectedApptStart: picked.start_time,
                    step: 'confirm_cancel'
                })
                const dtStr = formatDateTime(picked.start_time)
                await flowDynamic(
                    `Vas a cancelar el turno del *${dtStr}*.\n\n` +
                    `Respondé *1* para Confirmar o *2* para No cancelar.`
                )
                return
            }

            // ── Confirmation step ─────────────────────────────────────────────
            if (stateData.step === 'confirm_cancel') {
                const answer = ctx.body.trim()

                if (answer === '2' || answer.toLowerCase().includes('no')) {
                    console.log(`[cancelFlow] step=user_declined phone=${ctx.from?.slice(-4)}`)
                    await flowDynamic('Está bien, el turno no fue cancelado.\n\nEscribí *menu* para volver al inicio.')
                    await state.clear()
                    return
                }

                if (answer !== '1' && !answer.toLowerCase().includes('si') && !answer.toLowerCase().includes('sí')) {
                    await flowDynamic('Respondé *1* para Confirmar o *2* para No cancelar.')
                    return
                }

                // 2-hour cutoff check / Verificación de corte de 2 horas
                const startTime = new Date(stateData.selectedApptStart)
                const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000)
                if (startTime <= twoHoursFromNow) {
                    console.warn(`[cancelFlow] step=cutoff_blocked phone=${ctx.from?.slice(-4)}`)
                    await flowDynamic('No podés cancelar con menos de 2 horas de anticipación.\n\nSi necesitás ayuda, contactanos directamente.\n\nEscribí *menu* para volver al inicio.')
                    await state.clear()
                    return
                }

                // Proceed with cancellation / Proceder con la cancelación
                console.log(`[cancelFlow] step=cancel_attempt phone=${ctx.from?.slice(-4)} id=${stateData.selectedApptId}`)
                const result = await cancelAppointmentBot(stateData.selectedApptId)

                if (result.ok) {
                    const dtStr = formatDateTime(stateData.selectedApptStart)
                    console.log(`[cancelFlow] step=cancel_ok phone=${ctx.from?.slice(-4)} id=${stateData.selectedApptId}`)
                    await flowDynamic(`✅ Tu turno del *${dtStr}* fue cancelado exitosamente.\n\nEscribí *menu* para volver al inicio.`)
                    await state.clear()
                    return
                }

                if (result.reason === 'already_cancelled') {
                    console.warn(`[cancelFlow] step=already_cancelled phone=${ctx.from?.slice(-4)}`)
                    await flowDynamic('Ese turno ya estaba cancelado.\n\nEscribí *menu* para volver al inicio.')
                    await state.clear()
                    return
                }

                // db_error
                console.error(`[cancelFlow] step=db_error phone=${ctx.from?.slice(-4)}`)
                await flowDynamic('❌ Hubo un error al cancelar. Por favor intentá de nuevo o contactanos.\n\nEscribí *menu* para volver al inicio.')
                await state.clear()
                return
            }

            // Unknown state — reset / Estado desconocido — reiniciar
            await state.clear()
        }
    )
