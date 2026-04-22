const { Pool } = require('pg')

async function testPostgres() {
    const pool = new Pool({
        host: 'asistente-psicologico-db',
        port: 5432,
        database: 'asistente_psicologico',
        user: 'admin',
        password: 'changeme123'
    })

    try {
        const res = await pool.query('SELECT * FROM psychologists LIMIT 1')
        console.log('✅ PostgreSQL Connected!')
        console.log(' psychologists:', res.rows)
    } catch (err) {
        console.error('❌ Error:', err.message)
    } finally {
        await pool.end()
    }
}

testPostgres()