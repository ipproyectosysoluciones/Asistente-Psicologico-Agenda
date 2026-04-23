const bot = require('@builderbot/bot')
const { addAnswer, addKeyword, addAction } = bot
const { appointmentService, DURATIONS } = require('../services/appointmentService.cjs')
const { fileDbService } = require('../services/fileDb.cjs')

let appointmentContext = {}

const appointmentFlow = addKeyword(['agendar', 'cita', 'turno', 'reservar'])
    .addAnswer('📅 *Agendar Cita*\n\nHorario de atención:\n• Martes a Domingo\n• 09:00 a 18:00\n• Lunch: 12:00 a 13:00\n\n*Duración:*\n• Primera vez: 90 min\n• Seguimiento: 50 min\n\n*¿Qué tipo de consulta necesitas?*', {
        buttons: [
            { body: '👤 Primera vez' },
            { body: '🔄 Seguimiento' }
        ]
    })

const appointmentStatusFlow = addKeyword(['estado', 'mis citas', 'ver cita'])
    .addAnswer('🔍 *Consultar Estado de Cita*\n\nIngresá tu email para buscar tu cita:', { capture: true })
    .addAction(async (ctx, { flowDynamic }) => {
        const email = ctx.body.trim()
        const appointments = await appointmentService.getByEmail(email)
        
        if (!appointments.length) {
            return flowDynamic('❌ No encontramos citas para ese email.')
        }
        
        const lines = appointments.map(a => {
            const status = a.confirmed ? '✅ Confirmada' : '⏳ Pendiente'
            return `📅 ${a.date} ${a.time}\n${status}\n${a.type}`
        }).join('\n\n')
        
        await flowDynamic(`*Tus citas:*\n\n${lines}`)
    })

const cancelAppointmentFlow = addKeyword(['cancelar', 'cancelar cita', 'eliminar cita'])
    .addAnswer('🗑️ *Cancelar Cita*\n\nIngresá tu email:', { capture: true })
    .addAction(async (ctx, { flowDynamic }) => {
        const email = ctx.body.trim()
        await flowDynamic('¿Cuál era la fecha de la cita? (YYYY-MM-DD)', { capture: true })
    })
    .addAction(async (ctx, { flowDynamic }) => {
        await flowDynamic('Cita cancelada exitosamente.')
    })

module.exports = {
    appointmentFlow,
    appointmentStatusFlow,
    cancelAppointmentFlow
}