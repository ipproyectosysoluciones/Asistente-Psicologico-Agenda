import { addAnswer, addKeyword } from '@builderbot/bot'

export const registrationFlow = [
    addKeyword('📅 Nueva Cita')
        .addAnswer('¡Perfecto! Voy a ayudarte a programar una cita. 📅\n\n*Datos requeridos:*\n1. Nombre completo\n2. Teléfono\n3. Email\n4. ¿Primera vez o seguimiento?\n\n*Escribí tu nombre completo para comenzar.*', { capture: true })
        .addAnswer('✅ ¡Perfecto! Tu información ha sido registrada.\n\nUn operador te contactará pronto para confirmar tu cita.\n\n*¿Deseas algo más?* Escribí *menu* para volver al inicio.', { buttons: [
            { body: '🏠 Volver al Menú' }
        ]})
]

export const registrationSimpleFlow = [
    addKeyword(['registro', 'registrar', 'nuevo paciente'])
        .addAnswer('*Registro de Nuevo Paciente*\n\nPara registrarte necesito:\n\n1️⃣ *Nombre completo*\n2️⃣ *Teléfono*\n3️⃣ *Email*\n4️⃣ *Tipo de consulta* (primera vez/seguimiento)\n\n*Responde cada pregunta cuando te la indique.*', 
        { buttons: [{ body: '🏠 Cancelar' }] })
]

export const newPatientKeywordFlow = [
    addKeyword(['nueva cita', 'nuevo paciente'])
        .addAnswer('*Nueva Cita - Primera Consulta*\n\nLas primera consultas tienen una duración de *90 minutos*.\n\n*Costo*: USD $60\n\n*Continuamos?* Escribí *sí* para proceder.', { buttons: [
            { body: '✅ Sí, continuar' },
            { body: '🏠 Cancelar' }
        ]})
]