const knowledgeService = {
    async searchByCategory(category) {
        const resources = {
            depresion: [
                { title: 'Guía de Depresión', content: 'La depresión es...' },
                { title: 'Signos de alerta', content: 'Señales de...' }
            ],
            emociones: [
                { title: 'Regulación Emocional', content: 'Técnicas de...' }
            ],
            ansiedad: [
                { title: 'Manejo de Ansiedad', content: 'Estrategias para...' }
            ],
            general: [
                { title: 'Bienestar General', content: 'Consejos de...' }
            ]
        }
        return resources[category.toLowerCase()] || []
    }
}

module.exports = { knowledgeService }