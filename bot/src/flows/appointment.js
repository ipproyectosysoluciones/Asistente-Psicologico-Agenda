import { addAnswer, addKeyword } from '@builderbot/bot'

export const appointmentFlow = [
    addKeyword(['agendar', 'cita', 'turno', 'reservar'])
        .addAnswer('*Agendar Cita*\n\nHorario de atención:\n- Martes a Domingo\n- 09:00 a 18:00\n- Lunch: 12:00 a 13:00\n\n*Duración consultas:*\n- Primera vez: 90 min + 10 min buffer\n- Seguimiento: 50 min + 10 min buffer\n\n*¿Qué tipo de consulta necesitas?*', { buttons: [
            { body: '👤 Primera vez' },
            { body: '🔄 Seguimiento' }
        ]}),

    addKeyword('primera vez')
        .addAnswer('*Primera Consulta*\n\nDuración: 90 minutos\nCosto: $60 USD\n\n*¿Cuál es tu nombre completo?*', { capture: true })
        .addAnswer('✅ Cita solicitada.\n\nUn operador te contactará para confirmar el horario.\n\n*¿Necesitas algo más?* Escribí *menu*.'),

    addKeyword('seguimiento')
        .addAnswer('*Seguimiento*\n\nDuración: 50 minutos\nCosto: $45 USD\n\n*¿Cuál es tu nombre completo?*', { capture: true })
        .addAnswer('✅ Cita solicitada.\n\nUn operador te contactará para confirmar el horario.\n\n*¿Necesitas algo más?* Escribí *menu*.')
]

export const appointmentStatusFlow = [
    addKeyword(['mis citas', 'ver cita', 'mi cita', 'citas'])
        .addAnswer('*Tus Citas*\n\nPara ver tus citas programadas, necesito tu email de registro.\n\n*Escribí tu email:*', { capture: true })
        .addAnswer('✅ He encontrado tus citas.\n\n*Próxima cita*: [Fecha]\n*Estado*: Confirmada\n\n*¿Necesitas algo más?*', { buttons: [
            { body: '🏠 Menú Principal' },
            { body: '📅 Nueva Cita' }
        ]})
]

export const cancelAppointmentFlow = [
    addKeyword(['cancelar cita', 'cancelar', 'reagendar'])
        .addAnswer('*Cancelar o Reagendar Cita*\n\nPara modificar o cancelar una cita, contactanos directamente.\n\n⚠️ *Política*: Cancelaciones con 24h de anticipación.\n\n*Escribí tu email de registro:*', { capture: true })
        .addAnswer('📧 Tu solicitud ha sido registrada. Un operador te contactará pronto.\n\n*¿Deseas algo más?* Escribí *menu*.')
]