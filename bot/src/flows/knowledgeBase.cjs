const bot = require('@builderbot/bot')
const { addKeyword } = bot

const knowledgeBaseFlow = addKeyword(['📚 Biblioteca', 'kb', 'knowledge', 'biblioteca'])
    .addAnswer('📚 *Biblioteca de Recursos*\n\nTengo información sobre:\n\n• *Depresión*\n• *Emociones*\n• *Ansiedad*\n• *General*\n\nEscribe el tema que te interesa.')

const searchFlow = addKeyword(['buscar', 'search', 'info'])
    .addAnswer('🔍 Buscar información...\n\nEscribí tu consulta.')

module.exports = { knowledgeBaseFlow, searchFlow }