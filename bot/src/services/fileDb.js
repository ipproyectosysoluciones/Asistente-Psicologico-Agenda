import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class JsonDatabase {
    constructor(filename = 'database.json') {
        this.filepath = path.join(__dirname, '..', filename)
        this.data = this.load()
    }

    load() {
        try {
            if (fs.existsSync(this.filepath)) {
                return JSON.parse(fs.readFileSync(this.filepath, 'utf-8'))
            }
        } catch (e) {
            console.error('Error loading DB:', e.message)
        }
        return { patients: [], appointments: [], flows: [] }
    }

    save() {
        try {
            fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2))
        } catch (e) {
            console.error('Error saving DB:', e.message)
        }
    }

    async get(key) {
        return this.data[key] || []
    }

    async getById(key, id) {
        const items = this.data[key] || []
        return items.find(item => item.id === id)
    }

    async create(key, item) {
        if (!this.data[key]) this.data[key] = []
        const newItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
        this.data[key].push(newItem)
        this.save()
        return newItem
    }

    async update(key, id, updates) {
        const items = this.data[key] || []
        const index = items.findIndex(item => item.id === id)
        if (index !== -1) {
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() }
            this.data[key] = items
            this.save()
            return items[index]
        }
        return null
    }

    async delete(key, id) {
        const items = this.data[key] || []
        this.data[key] = items.filter(item => item.id !== id)
        this.save()
    }

    async find(key, query) {
        const items = this.data[key] || []
        return items.filter(item => {
            return Object.entries(query).every(([k, v]) => item[k] === v)
        })
    }
}

export default JsonDatabase