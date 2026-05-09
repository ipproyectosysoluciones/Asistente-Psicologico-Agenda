/**
 * Flujo de triage conversacional basado en PHQ-9.
 * Conduce la entrevista de salud mental, evalúa la urgencia y redirige al flujo apropiado.
 *
 * Conversational PHQ-9-based triage flow.
 * Conducts the mental health interview, evaluates urgency and redirects to the appropriate flow.
 */

import { addKeyword, EVENTS } from '@builderbot/bot'
import { triageService } from '../services/triageService.js'
import { appointmentFlow } from './appointment.js'

/**
 * Mensaje de crisis que se envía cuando la urgencia es "severe".
 * Crisis message sent when urgency is "severe".
 *
 * @type {string}
 */
const CRISIS_MESSAGE = `Lo que me contás es importante y quiero que sepas que no estás solo/a.

Podés llamar ahora: ${process.env.CRISIS_HOTLINE || '106 (Bogotá) / 192 (Línea Nacional Colombia)'}

También puedo ayudarte a reservar un turno urgente con un profesional. Escribí *agendar* cuando estés listo/a.`

/**
 * Flujo de emergencia: se activa cuando el triage detecta urgencia "severe".
 * Entrega el mensaje de crisis con la línea de ayuda y ofrece un turno urgente.
 *
 * Emergency flow: activated when triage detects "severe" urgency.
 * Delivers the crisis message with the helpline and offers an urgent slot.
 *
 * @type {import('@builderbot/bot').TFlow}
 */
export const emergencyFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic }) => {
        await flowDynamic(CRISIS_MESSAGE)
    })

/**
 * Flujo principal de triage PHQ-9.
 * - Primer turno: envía mensaje introductorio y captura la primera respuesta.
 * - Turnos siguientes: procesa la respuesta, actualiza el estado y continúa o finaliza.
 * - Al terminar: calcula urgencia, persiste en DB y redirige a emergencyFlow o appointmentFlow.
 *
 * Main PHQ-9 triage flow.
 * - First turn: sends an intro message and captures the first response.
 * - Subsequent turns: processes the answer, updates state and continues or finalises.
 * - On completion: calculates urgency, persists to DB and redirects to emergencyFlow or appointmentFlow.
 *
 * @type {import('@builderbot/bot').TFlow}
 */
export const triageFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(
        '',
        { capture: true },
        async (ctx, { flowDynamic, state, gotoFlow }) => {
            const triageState = (await state.getMyState())?._triage ?? null

            // First turn: introduce the interview before processing
            // Primer turno: presentar la entrevista antes de procesar
            if (!triageState || triageState.step === 0) {
                await flowDynamic(
                    'Antes de continuar, quiero hacerte unas preguntas breves para entender mejor cómo estás. ' +
                    'Es confidencial y no tardará mucho.\n\n' +
                    '¿Cómo te has sentido durante las últimas dos semanas?'
                )
            }

            const { nextQuestion, done, newState } = await triageService.nextTurn({
                phone: ctx.from,
                userText: ctx.body,
                currentState: triageState,
            })

            await state.update({ _triage: newState })

            if (!done) {
                // Still more questions — show next and loop back
                // Aún quedan preguntas — mostrar la siguiente y volver a capturar
                await flowDynamic(nextQuestion)
                return gotoFlow(triageFlow)
            }

            // --- Triage complete ---
            const { score, urgency, recommendedAction } = triageService.finalize({
                scores: newState.scores,
            })

            await triageService.saveAssessment({
                phone: ctx.from,
                scores: newState.scores,
                urgency,
                recommendedAction,
            })

            // Clear triage state after completion
            // Limpiar estado del triage al terminar
            await state.update({ _triage: null })

            if (urgency === 'severe') {
                return gotoFlow(emergencyFlow)
            }

            await flowDynamic(recommendedAction)
            return gotoFlow(appointmentFlow)
        }
    )
