import pg from 'pg'

const { Pool } = pg

export function createKnowledgeService(db) {
    return {
        async getByCategory(category, lang = 'es') {
            try {
                const result = await db.query(
                    `SELECT question, answer FROM bot_faq
                     WHERE category = $1 AND lang = $2 AND is_active = true
                     ORDER BY created_at ASC
                     LIMIT 1`,
                    [category.toLowerCase(), lang]
                )
                return result.rows[0] || null
            } catch {
                return null
            }
        },

        async getCategories(lang = 'es') {
            try {
                const result = await db.query(
                    `SELECT DISTINCT category FROM bot_faq
                     WHERE lang = $1 AND is_active = true
                     ORDER BY category`,
                    [lang]
                )
                return result.rows.map(r => r.category)
            } catch {
                return []
            }
        },

        async searchByCategory(category, psychologistId = null) {
            let query = 'SELECT * FROM knowledge_base WHERE is_active = true AND category = $1'
            const params = [category.toLowerCase()]

            if (psychologistId) {
                query += ' AND (psychologist_id = $2 OR psychologist_id IS NULL)'
                params.push(psychologistId)
            }

            query += ' ORDER BY created_at DESC'
            const result = await db.query(query, params)
            return result.rows
        }
    }
}

let _pool = null

function _getPool() {
    if (!_pool) {
        if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL environment variable is required')
        _pool = new Pool({ connectionString: process.env.DATABASE_URL })
    }
    return _pool
}

export const knowledgeService = new Proxy({}, { get: (_, k) => createKnowledgeService(_getPool())[k] })
