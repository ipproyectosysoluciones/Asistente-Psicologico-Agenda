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

    async findOne(key, query) {
        const items = await this.find(key, query)
        return items[0] || null
    }
}

const jsonDb = new JsonDatabase()

export const fileDbService = {
    async findPatientByEmail(email) {
        const patients = await jsonDb.find('patients', { email: email.toLowerCase() })
        return patients[0] || null
    },

    async findPatientByPhone(phone) {
        const patients = await jsonDb.find('patients', { phone: phone.replace(/\D/g, '') })
        return patients[0] || null
    },

    async savePatient(data) {
        const fullName = data.fullName || ''
        const nameParts = fullName.trim().split(' ')
        return jsonDb.create('patients', {
            email: data.email?.toLowerCase(),
            phone: data.phone?.replace(/\D/g, ''),
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            source: data.source || 'whatsapp',
            consentStatus: 'pending',
            createdAt: new Date().toISOString()
        })
    },

    async updatePatient(id, updates) {
        return jsonDb.update('patients', id, updates)
    },

    async getAppointments(patientId) {
        const all = await jsonDb.get('appointments')
        return all.filter(a => a.patientId === patientId && a.status !== 'cancelled')
    },

    async createAppointment(data) {
        return jsonDb.create('appointments', {
            patientId: data.patientId,
            psychologistId: data.psychologistId,
            scheduledAt: data.scheduledAt,
            appointmentType: data.appointmentType,
            status: 'scheduled',
            durationMinutes: data.durationMinutes || 50,
            createdAt: new Date().toISOString()
        })
    },

    async cancelAppointment(id) {
        return jsonDb.update('appointments', id, { status: 'cancelled' })
    }
}

export default JsonDatabase