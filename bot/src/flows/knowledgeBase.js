import { addKeyword } from '@builderbot/bot'
import { knowledgeService } from '../services/knowledgeBase.js'

const CATEGORY_LABELS = {
    horarios: 'Horarios',
    ubicacion: 'Ubicación',
    precios: 'Precios',
    modalidad: 'Modalidad',
    contacto: 'Contacto'
}

const STATIC_FALLBACK = {
    horarios:  'Atendemos de lunes a viernes de 9:00 a 18:00 h.',
    ubicacion: 'Ofrecemos sesiones presenciales y en línea. Contactanos para más info.',
    precios:   'Primera consulta: $60 USD (90 min). Seguimiento: $45 USD (50 min).',
    modalidad: 'Trabajamos con terapia cognitivo-conductual. Sesiones presenciales y en línea.',
    contacto:  'Escribí *agendar* para reservar una cita o contactanos directamente.'
}

function buildMenu(categories) {
    const cats = categories.length > 0
        ? categories
        : Object.keys(CATEGORY_LABELS)

    let text = '*¿Sobre qué querés información?*\n\n'
    cats.forEach((cat, i) => {
        const label = CATEGORY_LABELS[cat] || cat
        text += `  ${i + 1}. ${label}\n`
    })
    text += '\nEscribí el número de tu elección.'
    return { text, cats }
}

export const knowledgeBaseFlow = addKeyword(['📋 Info', 'info', 'información', 'preguntas', 'faq', 'ayuda'])
    .addAnswer(
        'Un momento, consultando la información disponible...',
        { capture: false },
        async (ctx, { flowDynamic, state }) => {
            const categories = await knowledgeService.getCategories('es')
            const { text, cats } = buildMenu(categories)
            await state.update({ _kbCats: cats })
            await flowDynamic(text)
        }
    )
    .addAnswer(
        'Tu elección:',
        { capture: true },
        async (ctx, { flowDynamic, state }) => {
            const stateData = await state.getAll()
            const cats = stateData._kbCats || Object.keys(CATEGORY_LABELS)
            const num = parseInt(ctx.body.trim(), 10)

            if (isNaN(num) || num < 1 || num > cats.length) {
                await flowDynamic(`❌ Elegí un número entre 1 y ${cats.length}.\n\nEscribí *info* para volver al menú.`)
                await state.clear()
                return
            }

            const category = cats[num - 1]
            const label = CATEGORY_LABELS[category] || category

            const faq = await knowledgeService.getByCategory(category, 'es')
            const answer = faq?.answer || STATIC_FALLBACK[category] || 'Contactanos para más información.'

            await flowDynamic(`📋 *${label}*\n\n${answer}\n\nEscribí *info* para otra consulta o *menu* para volver al inicio.`)
            await state.clear()
        }
    )

export const searchFlow = addKeyword(['buscar', 'search'])
    .addAnswer(
        '🔍 ¿Sobre qué tema buscás? (ej: horarios, precios, ubicación)',
        { capture: true },
        async (ctx, { flowDynamic }) => {
            const input = ctx.body.toLowerCase().trim()
            const matched = Object.keys(CATEGORY_LABELS).find(cat => input.includes(cat))

            if (!matched) {
                await flowDynamic('No encontré esa categoría. Escribí *info* para ver las opciones disponibles.')
                return
            }

            const faq = await knowledgeService.getByCategory(matched, 'es')
            const answer = faq?.answer || STATIC_FALLBACK[matched]
            const label = CATEGORY_LABELS[matched]

            await flowDynamic(`📋 *${label}*\n\n${answer}`)
        }
    )

