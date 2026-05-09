/**
 * Detector puro de señales de angustia y crisis en mensajes de texto.
 * Utiliza listas de palabras clave y expresiones regulares en español.
 * No realiza ninguna llamada a servicios externos ni a la base de datos.
 *
 * Pure distress-signal detector for Spanish-language text messages.
 * Uses keyword lists and regular expressions. Zero I/O.
 */

/** @type {string[]} Palabras y frases de señal de crisis explícita */
const CRISIS_KEYWORDS = [
    'suicidio',
    'suicidarme',
    'quitarme la vida',
    'hacerme daño',
    'hacerme lastimar',
    'no quiero vivir',
    'no quiero seguir viviendo',
    'ideación',
    'ideacion',
    'quiero morirme',
    'mejor muerto',
    'mejor muerta',
]

/** @type {string[]} Frases de urgencia inmediata */
const URGENCY_KEYWORDS = [
    'urgente',
    'emergencia',
    'ayuda ya',
    'ya no puedo',
    'no aguanto más',
    'no aguanto mas',
    'desesperado',
    'desesperada',
    'al límite',
    'al limite',
    'necesito ayuda ahora',
    'necesito hablar ya',
]

/** @type {string[]} Frases de angustia y colapso emocional */
const DISTRESS_KEYWORDS = [
    'crisis',
    'pánico',
    'panico',
    'ataque de ansiedad',
    'colapso',
    'descontrol',
    'no puedo más',
    'no puedo mas',
    'estoy muy mal',
]

/** @type {RegExp[]} Patrones de expresiones que no siempre coinciden literalmente */
const DISTRESS_PATTERNS = [
    /no\s+(aguanto|soporto|puedo)\s+m[aá]s/i,
    /ya\s+no\s+(quiero|puedo)\s+(vivir|seguir)/i,
    /me\s+quiero\s+(hacer\s+da[ñn]o|matar|morir)/i,
    /necesito\s+(ayuda|hablar)\s+(ya|ahora|urgente)/i,
    /estoy\s+(al\s+l[ií]mite|desesperado|desesperada|muy\s+mal)/i,
]

/**
 * Detecta si un mensaje contiene señales de angustia o crisis psicológica.
 * Función pura: sin efectos secundarios, sin I/O.
 *
 * Detects whether a message contains distress or psychological-crisis signals.
 * Pure function: no side effects, no I/O.
 *
 * @param {string} text - Mensaje de texto recibido del usuario / User message text.
 * @returns {boolean} `true` si se detecta angustia o crisis / if distress or crisis is detected.
 */
export function detect(text) {
    if (!text || typeof text !== 'string') return false

    const normalized = text.toLowerCase().trim()

    for (const kw of CRISIS_KEYWORDS) {
        if (normalized.includes(kw)) return true
    }

    for (const kw of URGENCY_KEYWORDS) {
        if (normalized.includes(kw)) return true
    }

    for (const kw of DISTRESS_KEYWORDS) {
        if (normalized.includes(kw)) return true
    }

    for (const pattern of DISTRESS_PATTERNS) {
        if (pattern.test(normalized)) return true
    }

    return false
}
