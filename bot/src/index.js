import 'dotenv/config'
import { mkdirSync } from 'fs'
import { createServer } from 'http'
import { createBot, createProvider, createFlow, addKeyword, MemoryDB } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'

const AUTH_PATH = process.env.BOT_SESSION_PATH || '/app/bot_sessions'
mkdirSync(AUTH_PATH, { recursive: true })

let wsConnected = false

import { mainMenuFlow } from './flows/mainMenu.js'
import { appointmentFlow, primeraVezFlow, seguimientoFlow, appointmentStatusFlow, cancelAppointmentFlow } from './flows/appointment.js'
import { knowledgeBaseFlow, searchFlow } from './flows/knowledgeBase.js'
import { clinicalHistoryFlow } from './flows/clinicalHistory.js'
import { registrationFlow } from './flows/registration.js'

const catchAllFlow = addKeyword(['.*'])
    .addAnswer('Recibí tu mensaje. Escribí *menu* para ver las opciones.', {
        buttons: [
            { body: '🏠 Menú' },
            { body: '📅 Agendar' }
        ]
    })

const helpFlow = addKeyword(['ayuda', 'help', '?', 'socorro'])
    .addAnswer('*Opciones disponibles:*\n\n📅 Agendar / Cita\n📋 Mi Historia Clínica\n📚 Biblioteca\n🏠 Menú\n\n*Escribí una opción.*')

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'

const HEALTH_PORT = parseInt(process.env.HEALTH_PORT || '3001', 10)

createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), wsConnected }))
    } else {
        res.writeHead(404)
        res.end()
    }
}).listen(HEALTH_PORT)

const main = async () => {
    console.log('🔄 Iniciando bot con Baileys...')
    console.log('📍 Puerto:', PORT, '| Host:', HOST)
    console.log(`📂 Session path: ${AUTH_PATH}`)

    const database = new MemoryDB()

    const provider = createProvider(BaileysProvider, {
        name: 'AsistentePsicologico',
        folderNameToken: AUTH_PATH,
    })

    provider.on('ready', () => { wsConnected = true; console.log('✅ WhatsApp conectado') })
    provider.on('auth_failure', () => { wsConnected = false; console.error('❌ Auth failure') })
    provider.on('disconnect', () => { wsConnected = false; console.log('📴 Desconectado') })

    provider.on('message', (msg) => {
        console.log('📨 [MSG]', msg.body || msg.type, '| From:', msg.from)
    })

    const flow = createFlow([
        catchAllFlow,
        helpFlow,
        ...mainMenuFlow,
        appointmentFlow,
        primeraVezFlow,
        seguimientoFlow,
        appointmentStatusFlow,
        cancelAppointmentFlow,
        knowledgeBaseFlow,
        searchFlow,
        ...clinicalHistoryFlow,
        ...registrationFlow
    ])

    console.log('🚀 Creando bot...')

    const result = await createBot({
        flow,
        provider,
        database
    })

    const { httpServer } = result
    httpServer(PORT, HOST)

    console.log(`✅ Bot listo en http://${HOST}:${PORT}`)
    console.log('📱 Esperando mensajes...')
}

main()