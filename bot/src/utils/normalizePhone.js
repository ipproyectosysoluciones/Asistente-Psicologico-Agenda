/**
 * Utilidades para normalizar números de teléfono al formato E.164
 * y buscar el `id` de un paciente en la base de datos a partir del teléfono.
 *
 * Utilities for normalizing phone numbers to E.164 format
 * and looking up a patient ID in the database by phone number.
 */

/**
 * Normaliza un número de teléfono al formato E.164 asegurando el prefijo de país.
 * Elimina todos los caracteres que no sean dígitos y luego garantiza el prefijo.
 *
 * Normalizes a raw phone string to E.164 format, ensuring the country prefix.
 * Strips all non-digit characters, then guarantees the country code prefix.
 *
 * @param {string} raw - Número de teléfono en cualquier formato / Phone number in any format.
 * @param {string} [defaultCountry] - Prefijo de país por defecto (ej. "+57") / Default country prefix (e.g. "+57").
 * @returns {string} Número normalizado en formato E.164 / Normalized phone number in E.164 format.
 */
export function normalizePhone(
    raw,
    defaultCountry = process.env.DEFAULT_COUNTRY_CODE || '+57'
) {
    if (!raw || typeof raw !== 'string') return ''

    // Preserve a leading '+' before stripping
    const hasPlus = raw.trimStart().startsWith('+')
    const digitsOnly = raw.replace(/\D/g, '')

    if (!digitsOnly) return ''

    // Strip the '+' from the defaultCountry prefix to get just the country code digits
    const countryDigits = defaultCountry.replace(/\D/g, '')

    // If already starts with the full country code (with or without leading +)
    if (hasPlus || digitsOnly.startsWith(countryDigits)) {
        // Make sure we don't double the code: if it starts exactly with countryDigits, keep as-is
        if (digitsOnly.startsWith(countryDigits)) {
            return `+${digitsOnly}`
        }
    }

    // Some carriers prefix with '00' + country code (e.g. 0057...)
    if (digitsOnly.startsWith(`00${countryDigits}`)) {
        return `+${digitsOnly.slice(2)}`
    }

    // Otherwise prepend the country code
    return `+${countryDigits}${digitsOnly}`
}

/**
 * Busca el `id` de un paciente en la base de datos a partir del número de teléfono normalizado.
 *
 * Looks up a patient's `id` in the database using a normalized phone number.
 *
 * @param {object} db - Instancia de conexión a la base de datos con método `query` / DB connection with a `query` method.
 * @param {string} phone - Número de teléfono ya normalizado (E.164) / Already-normalized phone number (E.164).
 * @returns {Promise<string|null>} UUID del paciente o `null` si no se encuentra / Patient UUID or `null` if not found.
 */
export async function lookupPatientId(db, phone) {
    try {
        const result = await db.query(
            'SELECT id FROM patients WHERE phone = $1 LIMIT 1',
            [phone]
        )
        return result.rows[0]?.id ?? null
    } catch {
        return null
    }
}
