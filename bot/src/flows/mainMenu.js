import { addAnswer, addKeyword } from '@builderbot/bot'

export const mainMenuFlow = [
    addKeyword(['hola', 'hello', 'ola', 'buenas'])
        .addAnswer('¡Hola! 👋 Soy tu Asistente Psicológico.\n\nSoy un asistente administrativo especializado en gestionar citas y ayudarte con el proceso de agendamiento.\n\n*¿En qué puedo ayudarte hoy?*', { buttons: [
            { body: '📅 Nueva Cita' },
            { body: '📋 Mi Historia Clínica' },
            { body: '❓ Ayuda' }
        ]}),

    addKeyword('AYUDA')
        .addAnswer('*Menú de Ayuda*\n\n📅 *Nueva Cita* - Programar una cita\n📋 *Mi Historia Clínica* - Ver mi información\n❓ *Ayuda* - Ver este menú\n\nEscribí una opción para comenzar.'),

    addKeyword('MENU')
        .addAnswer('*Menú Principal*\n\nSeleccioná una opción:', { buttons: [
            { body: '📅 Nueva Cita' },
            { body: '📋 Mi Historia Clínica' },
            { body: '❓ Ayuda' }
        ]})
]