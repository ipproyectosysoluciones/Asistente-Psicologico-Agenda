import { addAnswer, addKeyword, addAction } from '@builderbot/bot'
import { appointmentService, DURATIONS } from '../services/appointmentService.js'
import { fileDbService } from '../services/fileDb.js'

let appointmentContext = {}

const appointmentFlow = addKeyword(['agendar', 'cita', 'turno', 'reservar'])
    .addAnswer('📅 *Agendar Cita*\n\nHorario de atención:\n• Martes a Domingo\n• 09:00 a 18:00\n• Lunch: 12:00 a 13:00\n\n*Duración:*\n• Primera vez: 90 min\n• Seguimiento: 50 min\n\n*¿Qué tipo de consulta necesitas?*', {
        buttons: [
            { body: '👤 Primera vez' },
            { body: '🔄 Seguimiento' }
        ]
    })

export const primeraVezFlow = addKeyword(['primera vez', '👤 Primera vez'])
    .addAction(async (ctx, { flowDynamic, state }) => {
        await state.update({ appointmentType: 'primera vez' })
        await flowDynamic('👤 *Primera Consulta*\n\n• Duración: 90 minutos\n• Costo: $60 USD\n\n*¿Cuál es tu nombre completo?*', { capture: true })
    })
    .addAction(async (ctx, { state, flowDynamic }) => {
        await state.update({ fullName: ctx.body.trim() })
        await flowDynamic('*¿Cuál es tu email?*', { capture: true })
    })
    .addAction(async (ctx, { state, flowDynamic }) => {
        const email = ctx.body.trim()
        if (!email.includes('@')) {
            await flowDynamic('❌ Email inválido. Escribí tu email:', { capture: true })
            return
        }
        await state.update({ email })
        await flowDynamic('*¿Qué fecha te conviene?*\n\n*Formato*: YYYY-MM-DD\n*Ejemplo*: 2025-05-15', { capture: true })
    })
    .addAction(async (ctx, { state, flowDynamic }) => {
        const dateStr = ctx.body.trim()
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            await flowDynamic('❌ Formato inválido. Usá *YYYY-MM-DD*\n*Ejemplo*: 2025-05-15', { capture: true })
            return
        }
        const [year, month, day] = dateStr.split('-').map(Number)
        const date = new Date(year, month - 1, day)

        if (date <= new Date()) {
            await flowDynamic('❌ La fecha debe ser futura. Escribí otra fecha (YYYY-MM-DD):', { capture: true })
            return
        }

        await state.update({ dateStr })
        await flowDynamic('*¿Qué hora te conviene?*\n\n*Formato*: HH:MM\n*Ejemplo*: 14:00', { capture: true })
    })
    .addAction(async (ctx, { state, flowDynamic }) => {
        const hourStr = ctx.body.trim()
        if (!/^\d{2}:\d{2}$/.test(hourStr)) {
            await flowDynamic('❌ Formato inválido. Usá *HH:MM*\n*Ejemplo*: 14:00', { capture: true })
            return
        }

        const stateData = await state.getAll()
        const validation = appointmentService.validateTimeSlot(stateData.dateStr, hourStr)

        if (!validation.valid) {
            await flowDynamic(`❌ ${validation.error}\n*Elegí otro horario (HH:MM)*:`, { capture: true })
            return
        }

        const psychologistId = process.env.DEFAULT_PSYCHOLOGIST_ID
        const duration = DURATIONS[stateData.appointmentType]
        const available = await appointmentService.isSlotAvailable(psychologistId, validation.scheduledAt, duration)

        if (!available) {
            await flowDynamic('⚠️ Ese horario ya está ocupado.\n*Elegí otro (HH:MM)*:', { capture: true })
            return
        }

        await state.update({
            scheduledAt: validation.scheduledAt,
            hourStr
        })

        const summary = `📋 *Resumen de Cita*\n\n• Tipo: ${stateData.appointmentType}\n• Fecha: ${stateData.dateStr}\n• Hora: ${hourStr}\n• Duración: ${duration} min\n\n*¿Confirmás la cita?*`

        await flowDynamic(summary, {
            buttons: [
                { body: '✅ Confirmar' },
                { body: '❌ Cancelar' }
            ]
        })
    })
    .addAction(async (ctx, { state, flowDynamic }) => {
        const response = ctx.body.toLowerCase().trim()

        if (response.includes('cancel')) {
            await flowDynamic('❌ Cita cancelada.\n\n*Escribí *menu* para volver al inicio.')
            await state.clear()
            return
        }

        const stateData = await state.getAll()

        try {
            let patient = await fileDbService.findPatientByEmail(stateData.email)

            if (!patient) {
                await fileDbService.savePatient({
                    fullName: stateData.fullName,
                    email: stateData.email,
                    source: 'whatsapp'
                })
            }

            const psychologistId = process.env.DEFAULT_PSYCHOLOGIST_ID
            const appointment = await appointmentService.createAppointment({
                psychologistId,
                patientId: patient?.id,
                scheduledAt: stateData.scheduledAt,
                appointmentType: stateData.appointmentType
            })

            await flowDynamic(`✅ *¡Cita Agendada!*\n\n📅 *Detalles:*\n• Fecha: ${stateData.dateStr}\n• Hora: ${stateData.hourStr}\n• Tipo: ${stateData.appointmentType}\n\nTe contactaremos para confirmar.\n\n*Escribí *menu*.`)

        } catch (error) {
            if (error.message === 'HORARIO_OCUPADO') {
                await flowDynamic('⚠️ Ese horario acaba de ser ocupado.\n*Intentá con otro horario (HH:MM)*:', { capture: true })
                return
            }
            console.error('Appointment error:', error)
            await flowDynamic('⚠️ Error al agendar. Contactanos directamente.')
        }

        await state.clear()
    })

export const seguimientoFlow = addKeyword(['seguimiento', '🔄 Seguimiento'])
    .addAction(async (ctx, { flowDynamic, state }) => {
        await state.update({ appointmentType: 'seguimiento' })
        await flowDynamic('🔄 *Seguimiento*\n\n• Duración: 50 minutos\n• Costo: $45 USD\n\n*¿Cuál es tu email de registro?*', { capture: true })
    })
    .addAction(async (ctx, { flowDynamic, state }) => {
        const email = ctx.body.trim()
        if (!email.includes('@')) {
            await flowDynamic('❌ Email inválido. Escribí tu email:', { capture: true })
            return
        }
        await state.update({ email })
        await flowDynamic('*¿Qué fecha te conviene?* (YYYY-MM-DD)', { capture: true })
    })
    .addAction(async (ctx, { state, flowDynamic }) => {
        const dateStr = ctx.body.trim()
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            await flowDynamic('❌ Formato inválido. Usá *YYYY-MM-DD*', { capture: true })
            return
        }
        await state.update({ dateStr })
        await flowDynamic('*¿Qué hora?* (HH:MM)', { capture: true })
    })
    .addAction(async (ctx, { state, flowDynamic }) => {
        const hourStr = ctx.body.trim()
        if (!/^\d{2}:\d{2}$/.test(hourStr)) {
            await flowDynamic('❌ Formato inválido. Usá *HH:MM*', { capture: true })
            return
        }

        const stateData = await state.getAll()
        const validation = appointmentService.validateTimeSlot(stateData.dateStr, hourStr)

        if (!validation.valid) {
            await flowDynamic(`❌ ${validation.error}`, { capture: true })
            return
        }

        await state.update({ scheduledAt: validation.scheduledAt, hourStr })

        await flowDynamic(`📋 *Resumen*\n• Fecha: ${stateData.dateStr}\n• Hora: ${hourStr}\n\n*¿Confirmás?*`, {
            buttons: [
                { body: '✅ Confirmar' },
                { body: '❌ Cancelar' }
            ]
        })
    })
    .addAction(async (ctx, { state, flowDynamic }) => {
        const response = ctx.body.toLowerCase().trim()

        if (response.includes('cancel')) {
            await flowDynamic('❌ Cita cancelada.\n*Escribí *menu*.')
            await state.clear()
            return
        }

        const stateData = await state.getAll()

        try {
            const psychologistId = process.env.DEFAULT_PSYCHOLOGIST_ID
            const appointment = await appointmentService.createAppointment({
                psychologistId,
                patientId: null,
                scheduledAt: stateData.scheduledAt,
                appointmentType: 'seguimiento'
            })

            await flowDynamic(`✅ *¡Cita Agendada!*\n\n📅 ${stateData.dateStr} ${stateData.hourStr}\n\n*Escribí *menu*.`)

        } catch (error) {
            if (error.message === 'HORARIO_OCUPADO') {
                await flowDynamic('⚠️ Horario ocupado. Elegí otro.')
                return
            }
            console.error('Appointment error:', error)
            await flowDynamic('⚠️ Error al agendar.')
        }

        await state.clear()
    })

export const appointmentStatusFlow = addKeyword(['mis citas', 'ver cita', 'mi cita', 'citas'])
    .addAnswer('📅 *Tus Citas*\n\n*Escribí tu email:*', { capture: true })
    .addAction(async (ctx, { flowDynamic }) => {
        const email = ctx.body.trim()
        const patient = await fileDbService.findPatientByEmail(email)

        if (!patient) {
            await flowDynamic('📭 No encontré citas para ese email.\n\n*Escribí *menu*.')
            return
        }

        const appointments = await appointmentService.getPatientAppointments(patient.id)

        if (!appointments || appointments.length === 0) {
            await flowDynamic('📭 No tenés citas programadas.\n\n*Escribí *agendar* para solicitar una.')
            return
        }

        let response = '*📅 Tus Citas:*\n\n'

        for (const appt of appointments) {
            const date = new Date(appt.scheduled_at)
            const dateStr = date.toLocaleDateString('es-MX', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })
            response += `📌 *${dateStr}*\n`
            response += `   ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} - ${appt.appointment_type}\n`
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
    .addAnswer('📅 *Cancelar o Reagendar*\n\n*Escribí tu email:*', { capture: true })
    .addAction(async (ctx, { flowDynamic }) => {
        await flowDynamic('⚠️ *Política*: Cancelaciones con 24h de anticipación.\n\n📧 Tu solicitud ha sido registrada.\n\n*Escribí *menu*.')
    })

export { appointmentFlow }