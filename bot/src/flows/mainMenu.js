/**
 * Flujo del menú principal con detección de angustia emocional.
 * Antes de responder el saludo o menú normal, verifica si el mensaje contiene señales de crisis.
 * Si detecta angustia Y el usuario no tiene turno próximo → redirige al triage PHQ-9.
 * Si detecta angustia Y el usuario tiene turno → mensaje empático que recuerda la cita.
 *
 * Main menu flow with emotional distress detection.
 * Before responding normally to greetings or menu, checks whether the message contains crisis signals.
 * If distress detected AND no upcoming appointment → redirects to PHQ-9 triage.
 * If distress detected AND has appointment → empathic message reminding them of the appointment.
 */

import { addAnswer, addKeyword } from '@builderbot/bot'
import { detect } from '../utils/distressDetector.js'
import { triageService } from '../services/triageService.js'
import { triageFlow } from './triage.js'

/**
 * Mensaje empático cuando el usuario muestra angustia pero ya tiene una cita agendada.
 * Empathic redirect message when the user shows distress but already has a scheduled appointment.
 *
 * @type {string}
 */
const EMPATHIC_REDIRECT =
    'Escucho que estás pasando un momento difícil. Ya tenés una cita agendada. ' +
    'Si necesitás hablar, tu profesional está esperándote. Escribí *agendar* para ver los detalles.'

/**
 * Guard de angustia emocional. Se ejecuta antes de cada respuesta de menú.
 * Devuelve true si manejó la situación (y el flujo normal no debe continuar),
 * false si todo está bien y el menú puede seguir su curso normal.
 *
 * Emotional distress guard. Runs before each menu reply.
 * Returns true if it handled the situation (and the normal flow should NOT continue),
 * false if everything is fine and the normal menu can proceed.
 *
 * @param {object} ctx - Contexto del mensaje BuilderBot / BuilderBot message context.
 * @param {{ gotoFlow: Function, flowDynamic: Function }} helpers - Helpers del flow / Flow helpers.
 * @returns {Promise<boolean>}
 */
async function distressGuard(ctx, { gotoFlow, flowDynamic }) {
    if (!detect(ctx.body)) return false

    const hasAppt = await triageService.hasUpcomingAppointment(ctx.from)
    if (hasAppt) {
        await flowDynamic(EMPATHIC_REDIRECT)
        return true
    }

    await gotoFlow(triageFlow)
    return true
}

export const mainMenuFlow = [
    addKeyword(['hola', 'hello', 'ola', 'buenas'])
        .addAction(async (ctx, helpers) => { if (await distressGuard(ctx, helpers)) return })
        .addAnswer('¡Hola! 👋 Soy tu Asistente Psicológico.\n\nEstoy aquí para ayudarte con tus citas y gestión clínica.\n\n*¿En qué puedo ayudarte?*\n\n  1️⃣ Nueva Cita — escribí *agendar*\n  2️⃣ Mi Historia Clínica — escribí *historia*\n  3️⃣ Información — escribí *info*\n  ❓ Ayuda — escribí *ayuda*'),

    addKeyword('AYUDA')
        .addAction(async (ctx, helpers) => { if (await distressGuard(ctx, helpers)) return })
        .addAnswer('*Menú de Ayuda*\n\n📅 *Nueva Cita* - Programar una cita\n📋 *Mi Historia Clínica* - Ver mi información\n❓ *Ayuda* - Ver este menú\n\nEscribí una opción para comenzar.'),

    addKeyword('MENU')
        .addAction(async (ctx, helpers) => { if (await distressGuard(ctx, helpers)) return })
        .addAnswer('*Menú Principal*\n\n  1️⃣ Nueva Cita — escribí *agendar*\n  2️⃣ Historia Clínica — escribí *historia*\n  3️⃣ Información — escribí *info*\n  ❓ Ayuda — escribí *ayuda*'),
]
