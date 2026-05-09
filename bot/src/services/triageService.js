/**
 * Servicio de triage conversacional basado en el cuestionario PHQ-9.
 * Conduce una entrevista empática de 9 turnos, calcula puntaje e inserta el resultado en la DB.
 *
 * Conversational triage service based on the PHQ-9 questionnaire.
 * Conducts an empathic 9-turn interview, calculates the score and persists the result to the DB.
 */

import pg from 'pg'
import { aiService } from './aiService.js'
import { normalizePhone, lookupPatientId } from '../utils/normalizePhone.js'

const { Pool } = pg

/**
 * Las 9 preguntas del PHQ-9 en español, numeradas.
 * The 9 PHQ-9 questions in Spanish, numbered.
 *
 * @type {string}
 */
const PHQ9_QUESTIONS = `
1. Poco interés o placer en hacer las cosas (0=Nunca, 1=Varios días, 2=Más de la mitad de los días, 3=Casi todos los días)
2. Sentirse decaído/a, deprimido/a o sin esperanza
3. Dificultad para dormir, quedarse dormido/a o dormir demasiado
4. Sentirse cansado/a o con poca energía
5. Falta de apetito o comer en exceso
6. Sentirse mal consigo mismo/a, sentirse un fracaso o sentir que se ha fallado a sí mismo/a o a su familia
7. Dificultad para concentrarse en actividades como leer el periódico o ver televisión
8. Moverse o hablar tan lento que otras personas lo han notado, o lo contrario: estar tan inquieto/a que se mueve más de lo habitual
9. Pensamiento de que estaría mejor muerto/a o de hacerse algún daño
`.trim()

/**
 * System prompt del PHQ-9 para completeJSON.
 * PHQ-9 system prompt for completeJSON.
 *
 * @type {string}
 */
const PHQ9_SYSTEM_PROMPT = `Sos un asistente que realiza el PHQ-9 de manera conversacional y empática.
Las 9 preguntas del PHQ-9 son:
${PHQ9_QUESTIONS}

Para cada turno del usuario devolvé ÚNICAMENTE este JSON:
{ "next_question": string, "extracted_score": number (0-3), "step": number (1-9), "done": boolean }

Reglas:
- "extracted_score" es el puntaje (0-3) que inferís de la respuesta del usuario para la pregunta actual.
- "step" es el número de la SIGUIENTE pregunta a hacer (avanza de 1 en 1).
- Si el usuario ya respondió la pregunta 9, poné "done": true y "step": 9. "next_question" debe ser un cierre empático.
- NUNCA diagnosticás. NUNCA das tratamiento. Conducís la entrevista con calidez y sin prisa.
- Si la respuesta del usuario es ambigua, elegí el score más conservador (menor).`

/**
 * Línea de crisis por defecto cuando no está configurada en entorno.
 * Default crisis hotline when not configured in environment.
 *
 * @type {string}
 */
const DEFAULT_HOTLINE = '106 (Bogotá) / 192 (Línea Nacional Colombia)'

/**
 * Mapea un puntaje PHQ-9 a un nivel de urgencia.
 * Maps a PHQ-9 score to an urgency level.
 *
 * @param {number} score - Puntaje total (0–27) / Total score (0–27).
 * @returns {'minimal'|'mild'|'moderate'|'severe'}
 */
function mapUrgency(score) {
    if (score <= 4) return 'minimal'
    if (score <= 9) return 'mild'
    if (score <= 14) return 'moderate'
    return 'severe'
}

/**
 * Crea una instancia del servicio de triage con dependencias inyectadas.
 * Sigue el patrón factory para facilitar testing con mocks.
 *
 * Creates a triage service instance with injected dependencies.
 * Follows the factory pattern to enable testing with mocks.
 *
 * @param {{ db: object, aiService: object }} deps
 * @param {object} deps.db - Instancia de pg.Pool con método `query` / pg.Pool instance with `query` method.
 * @param {object} deps.aiService - Instancia del AI service / AI service instance.
 * @returns {object} Instancia del servicio de triage / Triage service instance.
 */
export function createTriageService({ db, aiService: injectedAIService }) {
    return {
        /**
         * Avanza un turno de la entrevista PHQ-9 basándose en el estado actual.
         * Llama a aiService.completeJSON para extraer el score y la siguiente pregunta.
         *
         * Advances one turn of the PHQ-9 interview based on current state.
         * Calls aiService.completeJSON to extract the score and next question.
         *
         * @param {{ phone: string, userText: string, currentState: object|null }} params
         * @param {string} params.phone - Número de teléfono del usuario / User phone number.
         * @param {string} params.userText - Respuesta del usuario en este turno / User's answer this turn.
         * @param {object|null} params.currentState - Estado PHQ-9 actual o null para iniciar / Current PHQ-9 state or null to start.
         * @param {number} [params.currentState.step] - Número de la pregunta actual (0-based) / Current question number (0-based).
         * @param {string[]} [params.currentState.responses] - Respuestas del usuario / User responses.
         * @param {number[]} [params.currentState.scores] - Puntajes extraídos / Extracted scores.
         * @returns {Promise<{nextQuestion: string, done: boolean, newState: {step: number, responses: string[], scores: number[]}}>}
         */
        async nextTurn({ phone, userText, currentState }) {
            const state = currentState && typeof currentState.step === 'number'
                ? currentState
                : { step: 0, responses: [], scores: [] }

            const currentStep = state.step // number of questions answered so far

            let aiResult
            try {
                aiResult = await injectedAIService.completeJSON({
                    system: PHQ9_SYSTEM_PROMPT,
                    user: `Pregunta actual: ${currentStep + 1}. Respuesta del usuario: "${userText}"`,
                })
            } catch {
                aiResult = {}
            }

            // Fallback: if completeJSON returns {} or malformed, keep moving forward safely
            const isMalformed = !aiResult || typeof aiResult !== 'object' || typeof aiResult.next_question !== 'string'

            const extractedScore = isMalformed
                ? 0
                : Math.max(0, Math.min(3, Number(aiResult.extracted_score) || 0))

            const newStep = currentStep + 1

            // Determine if triage is done
            const doneFlagFromAI = !isMalformed && aiResult.done === true
            const done = doneFlagFromAI || newStep >= 9

            const safeNextQuestion = isMalformed
                ? 'Gracias por compartir. ¿Podés contarme un poco más sobre cómo te has sentido?'
                : aiResult.next_question

            const newState = {
                step: newStep,
                responses: [...state.responses, userText],
                scores: [...state.scores, extractedScore],
            }

            return { nextQuestion: safeNextQuestion, done, newState }
        },

        /**
         * Calcula el puntaje final del PHQ-9 y determina la urgencia y acción recomendada.
         * Recibe los scores directamente para evitar una lectura extra de DB.
         *
         * Calculates the final PHQ-9 score and determines urgency and recommended action.
         * Accepts scores directly to avoid an extra DB read.
         *
         * @param {{ scores: number[] }} params
         * @param {number[]} params.scores - Array de puntajes extraídos (0-3 cada uno) / Array of extracted scores (0-3 each).
         * @returns {{ score: number, urgency: string, recommendedAction: string, hotline: string|null }}
         */
        finalize({ scores }) {
            const score = scores.reduce((a, b) => a + b, 0)
            const urgency = mapUrgency(score)
            const hotline = process.env.CRISIS_HOTLINE || DEFAULT_HOTLINE

            let recommendedAction
            if (urgency === 'minimal' || urgency === 'mild') {
                recommendedAction = 'Se recomienda hablar con un profesional para mayor orientación.'
            } else if (urgency === 'moderate') {
                recommendedAction = 'Es importante que agendés una consulta pronto. Escribí *agendar*.'
            } else {
                // severe
                recommendedAction = `Necesitás atención urgente. ${hotline} | Escribí *agendar* para un turno de urgencia.`
            }

            return {
                score,
                urgency,
                recommendedAction,
                hotline: urgency === 'severe' ? hotline : null,
            }
        },

        /**
         * Persiste el resultado del triage en la tabla `triage_assessments`.
         * Silencia errores: el flujo no debe romperse si el INSERT falla.
         *
         * Persists the triage result to the `triage_assessments` table.
         * Errors are silenced: the flow must not break if the INSERT fails.
         *
         * @param {{ phone: string, scores: number[], urgency: string, recommendedAction: string }} params
         * @param {string} params.phone - Número de teléfono / Phone number.
         * @param {number[]} params.scores - Array de puntajes (0-3) / Array of scores (0-3).
         * @param {string} params.urgency - Nivel de urgencia / Urgency level.
         * @param {string} params.recommendedAction - Texto de acción recomendada / Recommended action text.
         * @returns {Promise<void>}
         */
        async saveAssessment({ phone, scores, urgency, recommendedAction }) {
            try {
                const normalizedPhone = normalizePhone(phone)
                const patientId = await lookupPatientId(db, normalizedPhone)
                const totalScore = scores.reduce((a, b) => a + b, 0)

                await db.query(
                    `INSERT INTO triage_assessments
                        (phone, phq9_responses, phq9_score, urgency_level, recommended_action, patient_id)
                     VALUES ($1, $2::jsonb, $3, $4, $5, $6)`,
                    [
                        normalizedPhone,
                        JSON.stringify(scores),
                        totalScore,
                        urgency,
                        recommendedAction,
                        patientId,
                    ]
                )
            } catch (err) {
                console.error('[triageService.saveAssessment] error:', err?.message ?? err)
            }
        },

        /**
         * Verifica si el usuario tiene una cita programada en las próximas N horas.
         * Consulta directamente la tabla `appointments` sin depender de appointmentService.
         *
         * Checks whether the user has a scheduled appointment in the next N hours.
         * Queries the `appointments` table directly, without depending on appointmentService.
         *
         * @param {string} phone - Número de teléfono del usuario / User phone number.
         * @param {number} [hoursAhead=48] - Ventana de tiempo en horas / Time window in hours.
         * @returns {Promise<boolean>} true si tiene cita, false en caso contrario o error / true if has appointment, false otherwise or on error.
         */
        async hasUpcomingAppointment(phone, hoursAhead = 48) {
            try {
                const normalizedPhone = normalizePhone(phone)
                const result = await db.query(
                    `SELECT 1 FROM appointments a
                     JOIN patients p ON a.patient_id = p.id
                     WHERE p.phone = $1
                       AND a.status = 'scheduled'
                       AND a.scheduled_at BETWEEN NOW() AND NOW() + ($2 || ' hours')::interval
                     LIMIT 1`,
                    [normalizedPhone, String(hoursAhead)]
                )
                return result.rows.length > 0
            } catch (err) {
                console.error('[triageService.hasUpcomingAppointment] error:', err?.message ?? err)
                return false
            }
        },
    }
}

// ── Singleton via Proxy — mismo patrón que ragService.js ─────────────────────

let _instance = null

/**
 * Crea o reutiliza la instancia singleton del triage service.
 * Usa su propio pg.Pool con las variables de entorno PG estándar.
 *
 * Creates or reuses the singleton triage service instance.
 * Uses its own pg.Pool with standard PG environment variables.
 *
 * @returns {ReturnType<typeof createTriageService>}
 */
function _getInstance() {
    if (!_instance) {
        // Prefer DATABASE_URL (Railway) over individual vars
        const poolConfig = process.env.DATABASE_URL
            ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
            : {
                host: process.env.PGHOST,
                user: process.env.PGUSER,
                database: process.env.PGDATABASE,
                password: process.env.PGPASSWORD,
                port: parseInt(process.env.PGPORT || '5432', 10),
            }

        const pool = new Pool({ ...poolConfig, max: 3, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 })
        _instance = createTriageService({ db: pool, aiService })
    }
    return _instance
}

/**
 * Singleton proxy del triage service. Permite uso directo sin instanciación manual.
 * Lazy-initializes en el primer acceso, igual que ragService.
 *
 * Singleton proxy of the triage service. Enables direct use without manual instantiation.
 * Lazy-initializes on first access, mirroring ragService.
 */
export const triageService = new Proxy({}, { get: (_, k) => _getInstance()[k] })
