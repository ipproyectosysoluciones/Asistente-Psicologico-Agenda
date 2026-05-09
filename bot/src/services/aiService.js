/**
 * Servicio de integración con la API de OpenAI (GPT-4o + embeddings).
 * Expone métodos de completado de texto, completado JSON y generación de embeddings.
 * Incluye guardrails clínicos no sobreescribibles en el system prompt base.
 *
 * OpenAI integration service (GPT-4o + embeddings).
 * Exposes text completion, JSON completion and embedding methods.
 * Includes non-overridable clinical guardrails in the base system prompt.
 */

import OpenAI from 'openai'

/**
 * Respuesta estática devuelta cuando la API de OpenAI no está disponible.
 * Static fallback returned when the OpenAI API is unavailable.
 *
 * @type {string}
 */
const FALLBACK_RESPONSE =
    'En este momento no puedo procesar tu consulta. Por favor escribí *menu* para ver las opciones disponibles.'

/**
 * System prompt base con guardrails clínicos obligatorios.
 * Nunca puede ser sobreescrito por la entrada del usuario.
 *
 * Base system prompt with mandatory clinical guardrails.
 * Cannot be overridden by user input.
 *
 * @type {string}
 */
const BASE_SYSTEM_PROMPT = `ROL
Eres el asistente administrativo de una clínica de psicología. Tu función es informar
sobre temas psicoeducativos generales y ayudar al paciente a agendar con un profesional.

LÍMITES ESTRICTOS (NUNCA romper)
- NUNCA diagnosticas. No usas frases tipo "tienes depresión", "esto es ansiedad".
- NUNCA recetas, sugieres medicación, ni dosis.
- NUNCA das tratamiento, terapia, ni "ejercicios para curar".
- NUNCA aconsejas decisiones personales (separarme, renunciar, mudarme).
- NUNCA reemplazas la consulta con un psicólogo.

PERSONALIZACIÓN → REDIRIGIR
Si el usuario dice "yo tengo X", "creo que sufro Y", "mi amigo/a tiene Z":
1. Valida brevemente con empatía (1 oración).
2. Aclara que solo un profesional puede evaluar.
3. Ofrece agendar una consulta.
NO continúes elaborando sobre el caso personal.

EMERGENCIA — IDEACIÓN SUICIDA / DAÑO
Si detectas ideación activa, plan, o riesgo inminente:
1. Responde con calidez y sin juicio.
2. Entrega número de crisis local.
3. Ofrece slot urgente con un profesional.
NO minimices, NO uses frases hechas ("todo va a estar bien").

CONTEXTO RAG
Si te pasan fragmentos de libros como contexto, cita la fuente al final
("Fuente: <título>"). Si el contexto no responde la pregunta, dilo:
"No tengo información específica sobre esto, pero puedo agendarte con un profesional".

TONO
- Español formal-amigable.
- Empático, cálido, claro sobre tus límites.
- Respuestas cortas (≤4 párrafos). Sin emojis salvo confirmación.`

/**
 * Determina si un error de OpenAI corresponde a un fallo de API recuperable
 * (rate limit o error de servidor).
 *
 * Checks whether an OpenAI error is a recoverable API failure
 * (rate limit or server error).
 *
 * @param {unknown} err - Error capturado / Caught error.
 * @returns {boolean}
 */
function isRecoverableApiError(err) {
    if (!err || typeof err !== 'object') return false
    const status = /** @type {any} */ (err).status
    return status === 429 || (status >= 500 && status < 600)
}

/**
 * Crea una instancia del servicio de IA con el cliente OpenAI inyectado.
 * Sigue el patrón factory para facilitar inyección de dependencias en tests.
 *
 * Creates an AI service instance with an injected OpenAI client.
 * Follows the factory pattern to enable dependency injection in tests.
 *
 * @param {{ openai: OpenAI }} deps - Dependencias inyectadas / Injected dependencies.
 * @returns {object} Instancia del servicio / Service instance.
 */
export function createAIService({ openai }) {
    const model = process.env.OPENAI_MODEL || 'gpt-4o'
    const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'

    return {
        /**
         * Genera una respuesta de texto usando GPT-4o con el system prompt de guardrails.
         * Acepta un system prompt adicional que se añade DESPUÉS del base (no lo reemplaza).
         *
         * Generates a text response using GPT-4o with the guardrails system prompt.
         * An additional system prompt is appended AFTER the base (does not replace it).
         *
         * @param {{ system?: string, user: string, context?: string }} options
         * @param {string} [options.system] - System prompt adicional / Additional system prompt.
         * @param {string} options.user - Mensaje del usuario / User message.
         * @param {string} [options.context] - Contexto RAG opcional / Optional RAG context.
         * @returns {Promise<string>} Respuesta del modelo o fallback estático / Model response or static fallback.
         */
        async complete({ system = '', user, context = '' }) {
            try {
                const combinedSystem = [BASE_SYSTEM_PROMPT, system, context]
                    .filter(Boolean)
                    .join('\n\n')

                const response = await openai.chat.completions.create({
                    model,
                    messages: [
                        { role: 'system', content: combinedSystem },
                        { role: 'user', content: user },
                    ],
                    max_tokens: 512,
                    temperature: 0.4,
                })

                return response.choices[0]?.message?.content?.trim() ?? FALLBACK_RESPONSE
            } catch (err) {
                if (isRecoverableApiError(err)) return FALLBACK_RESPONSE
                // Unexpected errors also return fallback — never crash the bot
                console.error('[aiService.complete] Unexpected error:', err?.message ?? err)
                return FALLBACK_RESPONSE
            }
        },

        /**
         * Genera una respuesta JSON usando GPT-4o con response_format json_object.
         * Útil para extracciones estructuradas (PHQ-9, intents, etc.).
         *
         * Generates a JSON response using GPT-4o with response_format json_object.
         * Useful for structured extractions (PHQ-9, intents, etc.).
         *
         * @param {{ system: string, user: string }} options
         * @param {string} options.system - System prompt con instrucciones de formato JSON / System prompt with JSON format instructions.
         * @param {string} options.user - Mensaje del usuario / User message.
         * @returns {Promise<object>} Objeto JSON parseado o `{}` en caso de error / Parsed JSON object or `{}` on error.
         */
        async completeJSON({ system, user }) {
            try {
                const combinedSystem = [BASE_SYSTEM_PROMPT, system]
                    .filter(Boolean)
                    .join('\n\n')

                const response = await openai.chat.completions.create({
                    model,
                    messages: [
                        { role: 'system', content: combinedSystem },
                        { role: 'user', content: user },
                    ],
                    response_format: { type: 'json_object' },
                    max_tokens: 512,
                    temperature: 0.2,
                })

                const raw = response.choices[0]?.message?.content ?? '{}'
                return JSON.parse(raw)
            } catch (err) {
                if (isRecoverableApiError(err)) return {}
                console.error('[aiService.completeJSON] Unexpected error:', err?.message ?? err)
                return {}
            }
        },

        /**
         * Genera un vector de embeddings para un texto usando text-embedding-3-small (1536 dims).
         *
         * Generates an embedding vector for a text using text-embedding-3-small (1536 dims).
         *
         * @param {string} text - Texto a embeber / Text to embed.
         * @returns {Promise<number[]>} Vector de 1536 dimensiones o array vacío en error / 1536-dim vector or empty array on error.
         */
        async embed(text) {
            try {
                const response = await openai.embeddings.create({
                    model: embeddingModel,
                    input: text,
                })
                return response.data[0]?.embedding ?? []
            } catch (err) {
                if (isRecoverableApiError(err)) return []
                console.error('[aiService.embed] Unexpected error:', err?.message ?? err)
                return []
            }
        },
    }
}

// ── Singleton via Proxy — idéntico al patrón de knowledgeBase.js ──────────────

let _instance = null

/**
 * Crea o reutiliza la instancia singleton del AI service.
 * Instancia el cliente OpenAI usando OPENAI_API_KEY del entorno.
 *
 * Creates or reuses the singleton AI service instance.
 * Instantiates the OpenAI client from the OPENAI_API_KEY environment variable.
 *
 * @returns {ReturnType<typeof createAIService>}
 */
function _getInstance() {
    if (!_instance) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required')
        }
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        _instance = createAIService({ openai })
    }
    return _instance
}

/**
 * Singleton proxy del AI service. Permite uso directo sin instanciación manual.
 * Lazy-initializes en el primer acceso, al igual que `knowledgeService`.
 *
 * Singleton proxy of the AI service. Enables direct use without manual instantiation.
 * Lazy-initializes on first access, mirroring the `knowledgeService` pattern.
 */
export const aiService = new Proxy({}, { get: (_, k) => _getInstance()[k] })
