import { addAnswer, addKeyword } from '@builderbot/bot'

export const clinicalHistoryFlow = [
    addKeyword(['📋 Mi Historia Clínica', 'historia', 'hc', 'mi historial'])
        .addAnswer('*📋 Historia Clínica*\n\nTu información clínica está protegida según las normativas:\n\n🇲🇽 LFPDPPP (México)\n🇨🇴 Ley 1581 (Colombia)\n🇪🇸 RGPD (España)\n🇺🇸 HIPAA (USA)\n\n*Esta información solo la puede ver tu psicólogo tratante.*\n\n✅ Tus datos están seguros y protegidos.\n\n*¿Qué deseas hacer?*', { buttons: [
            { body: '📝 Completar Historia' },
            { body: '📄 Ver mi información' },
            { body: '🏠 Volver al Menú' }
        ]}),

    addKeyword('📝 Completar Historia')
        .addAnswer('*📝 Completar Historia Clínica*\n\nPara crear tu historia clínica, necesito que completes un formulario.\n\nUn enlace será enviado a tu email.\n\n*¿Confirmas tu email?* Responde *sí* para continuar.', { buttons: [
            { body: '✅ Sí, confirmar' },
            { body: '🏠 Cancelar' }
        ]}),

    addKeyword('📄 Ver mi información')
        .addAnswer('*📄 Tu Información*\n\nTu información personal está disponible en nuestra base de datos segura.\n\nPara acceder, tu psicólogo debe proporcionarte acceso.\n\n⚠️ *Por seguridad, no almacenamos datos sensibles aquí.*\n\n*¿Necesitas algo más?* Escribí *menu*.')
]

export const consentFlow = [
    addKeyword(['consentimiento', 'privacidad', 'protección de datos'])
        .addAnswer('*🔒 Consentimiento Informado*\n\nPara el tratamiento psicológico, se requiere tu consentimiento informado.\n\n*El consentimiento incluye:*\n- Uso de datos para gestión de citas\n- Almacenamiento seguro de HC\n- Derecho a eliminación (RGPD)\n- Retención según normativa local\n\n*¿Tienes preguntas sobre privacidad?* Escribí tu duda.')
]

export const dataRequestFlow = [
    addKeyword(['mis datos', 'exportar', 'descargar'])
        .addAnswer('*📥 Solicitud de Datos*\n\nPuedes solicitar una copia de tus datos en cualquier momento.\n\n*Tiempo de procesamiento*: 48-72 horas\n\n*Envía tu solicitud a*: admin@tupsicologo.com\n\n*¿Necesitas algo más?*')
]