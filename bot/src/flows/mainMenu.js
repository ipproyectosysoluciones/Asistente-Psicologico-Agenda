import { addAnswer, addKeyword } from '@builderbot/bot'

export const mainMenuFlow = [
    addKeyword(['hola', 'hello', 'ola', 'buenas'])
        .addAnswer('¡Hola! 👋 Soy tu Asistente Psicológico.\n\nEstoy aquí para ayudarte con tus citas y gestión clínica.\n\n*¿En qué puedo ayudarte?*\n\n  1️⃣ Nueva Cita — escribí *agendar*\n  2️⃣ Mi Historia Clínica — escribí *historia*\n  3️⃣ Información — escribí *info*\n  ❓ Ayuda — escribí *ayuda*'),

    addKeyword('AYUDA')
        .addAnswer('*Menú de Ayuda*\n\n📅 *Nueva Cita* - Programar una cita\n📋 *Mi Historia Clínica* - Ver mi información\n❓ *Ayuda* - Ver este menú\n\nEscribí una opción para comenzar.'),

    addKeyword('MENU')
        .addAnswer('*Menú Principal*\n\nSeleccioná una opción:', { buttons: [
            { body: '📅 Nueva Cita' },
            { body: '📋 Mi Historia Clínica' },
            { body: '❓ Ayuda' }
        ]})
]