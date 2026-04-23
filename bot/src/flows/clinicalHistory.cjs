const bot = require('@builderbot/bot')
const { addAnswer, addKeyword } = bot

const clinicalHistoryFlow = [
    addKeyword(['📋 Mi Historia Clínica', 'historia', 'hc', 'mi historial'])
        .addAnswer('*📋 Historia Clínica*\n\nTu información clínica está protegida.\n\n*¿Qué deseas hacer?*', { buttons: [
            { body: '📝 Completar Historia' },
            { body: '📄 Ver mi información' },
            { body: '🏠 Volver al Menú' }
        ]}),

    addKeyword('📝 Completar Historia')
        .addAnswer('*📝 Completar Historia Clínica*\n\nUn enlace será enviado a tu email.\n\n*¿Confirmas tu email?* Responde *sí* para continuar.', { buttons: [
            { body: '✅ Sí, confirmar' },
            { body: '🏠 Cancelar' }
        ]}),

    addKeyword('📄 Ver mi información')
        .addAnswer('*📄 Tu Información*\n\nTu información está disponible.\n\n*¿Necesitas algo más?* Escribí *menu*.')
]

const consentFlow = [
    addKeyword(['consentimiento', 'privacidad'])
        .addAnswer('*🔒 Consentimiento Informado*\n\nPara el tratamiento psicológico, se requiere tu consentimiento.\n\n*¿Tienes preguntas sobre privacidad?*')
]

const dataRequestFlow = [
    addKeyword(['mis datos', 'exportar'])
        .addAnswer('*📥 Solicitud de Datos*\n\nPuedes solicitar una copia de tus datos.\n\n*Envía tu solicitud a*: admin@tupsicologo.com')
]

module.exports = { clinicalHistoryFlow, consentFlow, dataRequestFlow }