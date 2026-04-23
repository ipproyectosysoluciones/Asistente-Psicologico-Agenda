import pg from 'pg'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export const knowledgeService = {
    async searchByCategory(category, psychologistId = null) {
        let query = 'SELECT * FROM knowledge_base WHERE is_active = true AND category = $1'
        const params = [category.toLowerCase()]
        
        if (psychologistId) {
            query += ' AND (psychologist_id = $2 OR psychologist_id IS NULL)'
            params.push(psychologistId)
        }
        
        query += ' ORDER BY created_at DESC'
        
        const result = await pool.query(query, params)
        return result.rows
    },

    async searchByKeyword(keyword, psychologistId = null) {
        let query = `
            SELECT * FROM knowledge_base 
            WHERE is_active = true 
            AND (
                title ILIKE $1 
                OR description ILIKE $1 
                OR $1 = ANY(tags)
            )`
        const params = [`%${keyword}%`]
        
        if (psychologistId) {
            query += ' AND (psychologist_id = $2 OR psychologist_id IS NULL)'
            params.push(psychologistId)
        }
        
        query += ' ORDER BY created_at DESC LIMIT 10'
        
        const result = await pool.query(query, params)
        return result.rows
    },

    async getAllCategories() {
        const result = await pool.query(`
            SELECT category, COUNT(*) as count 
            FROM knowledge_base 
            WHERE is_active = true 
            GROUP BY category 
            ORDER BY count DESC
        `)
        return result.rows
    },

    async getById(id) {
        const result = await pool.query('SELECT * FROM knowledge_base WHERE id = $1', [id])
        return result.rows[0]
    }
}