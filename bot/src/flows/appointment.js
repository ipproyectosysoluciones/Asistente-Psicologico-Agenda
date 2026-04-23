import { addAnswer, addKeyword } from '@builderbot/bot'
import { appointmentService, DURATIONS } from '../services/appointmentService.js'

const appointmentFlow = addKeyword(['agendar', 'cita', 'turno', 'reservar'])
    .addAnswer('📅 *Agendar Cita*\n\nHorario de atención:\n• Martes a Domingo\n• 09:00 a 18:00\n• Lunch: 12:00 a 13:00\n\n*Duración:*\n• Primera vez: 90 min\n• Seguimiento: 50 min\n\n*¿Qué tipo de consulta necesitas?*', {
        buttons: [
            { body: '👤 Primera vez' },
            { body: '🔄 Seguimiento' }
        ]
    })

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

export const cancelAppointmentFlow = addKeyword(['cancelar cita', 'cancelar', 'reagendar'])
    .addAnswer('📅 *Cancelar Cita*\n\nEscribí tu email de registro:', { capture: true }, async (ctx, { flowDynamic }) => {
        const email = ctx.body.trim()
        const patient = await appointmentService.findPatientByEmail(email)

        if (!patient) {
            await flowDynamic('📭 No encontré un paciente con ese email.\n\nEscribí *menu*.')
            return
        }

        const appointments = await appointmentService.getPatientAppointments(patient.id)

        if (!appointments || appointments.length === 0) {
            await flowDynamic('📭 No tenés citas programadas para cancelar.\n\nEscribí *menu*.')
            return
        }

        const next = appointments[0]
        const cancelled = await appointmentService.cancelAppointment(next.id, patient.id)

        if (!cancelled) {
            await flowDynamic('❌ No se pudo cancelar la cita. Contactanos directamente.')
            return
        }

        const date = new Date(next.scheduled_at)
        const dateStr = date.toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })
        await flowDynamic(
            `✅ *Cita cancelada:*\n\n📅 ${dateStr}\n⏰ ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}\n\n⚠️ Recordá avisar con 24h de anticipación.\n\nEscribí *menu*.`
        )
    })

export { appointmentFlow }
