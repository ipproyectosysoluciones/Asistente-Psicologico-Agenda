const fs = require('fs')
const path = require('path')

class JsonDatabase {
    constructor(filename = 'database.json') {
        this.filepath = path.join(__dirname, '..', filename)
        this.data = this.load()
    }

    load() {
        try {
            if (fs.existsSync(this.filepath)) {
                return JSON.parse(fs.readFileSync(this.filepath, 'utf8'))
            }
        } catch (e) {
            console.error('Error loading DB:', e.message)
        }
        return { patients: [], appointments: [] }
    }

    save() {
        try {
            fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2))
        } catch (e) {
            console.error('Error saving DB:', e.message)
        }
    }

    getPatients() {
        return this.data.patients || []
    }

    getAppointments() {
        return this.data.appointments || []
    }

    addPatient(patient) {
        this.data.patients = this.data.patients || []
        this.data.patients.push(patient)
        this.save()
    }

    addAppointment(appointment) {
        this.data.appointments = this.data.appointments || []
        this.data.appointments.push(appointment)
        this.save()
    }
}

const fileDbService = new JsonDatabase()

module.exports = { JsonDatabase, fileDbService }