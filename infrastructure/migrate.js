'use strict'
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  const client = await pool.connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         SERIAL PRIMARY KEY,
        name       TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    const { rows } = await client.query('SELECT name FROM schema_migrations ORDER BY name')
    const applied = new Set(rows.map(r => r.name))

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql') && !f.endsWith('_down.sql'))
      .sort()

    console.log(`Found ${files.length} migration(s), ${applied.size} already applied.\n`)

    let ran = 0
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  ✓ ${file}`)
        continue
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')

      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(`  ↑ ${file}  [applied]`)
        ran++
      } catch (err) {
        await client.query('ROLLBACK')
        console.error(`  ✗ ${file}: ${err.message}`)
        throw err
      }
    }

    console.log(`\n✅ Done: ${ran} applied, ${applied.size} skipped.`)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(err => {
  console.error('\n❌ Migration failed:', err.message)
  process.exit(1)
})
