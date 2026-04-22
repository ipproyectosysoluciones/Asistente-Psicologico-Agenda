import { addKeyword } from '@builderbot/bot'
import { knowledgeService } from '../services/knowledgeBase.js'

const kbCategories = {
    'depresión': 'depresion',
    'depresion': 'depresion',
    'depressive': 'depresion',
    'emociones': 'emociones',
    'emotions': 'emociones',
    'esquizofrenia': 'esquizofrenia',
    'schizophrenia': 'esquizofrenia',
    'ansiedad': 'ansiedad',
    'anxiety': 'ansiedad',
    'general': 'general'
}

const knowledgeBaseFlow = addKeyword(['📚 Biblioteca', 'kb', 'knowledge', 'biblioteca'])
    .addAnswer('📚 *Biblioteca de Recursos*\n\nTengo información sobre:\n\n• *Depresión* - Guías y manuales\n• *Emociones* - Regulación emocional\n• *Esquizofrenia* - Información clínica\n• *Ansiedad* - Manejo de ansiedad\n• *General* - Recursos varios\n\nEscribe el tema que te interesa:', { capture: true })
    .addAction(async (ctx, { flowDynamic, fallBack }) => {
        const input = ctx.body.toLowerCase().trim()
        const category = kbCategories[input]
        
        if (!category) {
            await fallBack('❌ No entendí. Escribe: Depresión, Emociones, Esquizofrenia, Ansiedad o General')
            return
        }
        
        try {
            const documents = await knowledgeService.searchByCategory(category)
            
            if (!documents || documents.length === 0) {
                await flowDynamic('📭 No encontré documentos en esa categoría.')
                return
            }
            
            let response = `📚 *Documentos sobre ${category.toUpperCase()}*\n\n`
            
            for (const doc of documents.slice(0, 5)) {
                response += `📄 *${doc.title}*\n`
                if (doc.description) {
                    response += `   ${doc.description}\n`
                }
                response += '\n'
            }
            
            response += '\n💡 Escribe otro tema para más información.'
            
            await flowDynamic(response)
            
        } catch (error) {
            console.error('KB Error:', error.message)
            await flowDynamic('⚠️ Error al buscar. Intenta más tarde.')
        }
    })

export const searchFlow = addKeyword(['buscar', 'search', 'info'])
    .addAnswer('🔍 ¿Sobre qué tema buscas información?\n\nEscribe: Depresión, Emociones, Esquizofrenia, Ansiedad', { capture: true })
    .addAction(async (ctx, { flowDynamic }) => {
        const input = ctx.body.toLowerCase().trim()
        const category = kbCategories[input]
        
        if (category) {
            const documents = await knowledgeService.searchByCategory(category)
            
            if (documents?.length > 0) {
                let response = `📚 *Resultados para ${input}*\n\n`
                for (const doc of documents.slice(0, 3)) {
                    response += `📄 ${doc.title}\n`
                }
                await flowDynamic(response)
            } else {
                await flowDynamic('📭 No encontré documentos.')
            }
        } else {
            await flowDynamic('❌ Categoría no encontrada.')
        }
    })

export default knowledgeBaseFlow