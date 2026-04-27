import { addAnswer, addKeyword } from '@builderbot/bot'

export const registrationFlow = [
    addKeyword('📅 Nueva Cita')
        .addAnswer('¡Perfecto! Voy a ayudarte a programar una cita. 📅\n\n*Datos requeridos:*\n1. Nombre completo\n2. Teléfono\n3. Email\n4. ¿Primera vez o seguimiento?\n\n*Escribí tu nombre completo para comenzar.*', { capture: true })
        .addAnswer('✅ ¡Perfecto! Tu información ha sido registrada.\n\nUn operador te contactará pronto para confirmar tu cita.\n\n*¿Deseas algo más?* Escribí *menu* para volver al inicio.', { buttons: [
            { body: '🏠 Volver al Menú' }
        ]})
]

