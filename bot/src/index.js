import 'dotenv/config'
import { mkdirSync } from 'fs'
import { createServer } from 'http'
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot'
import { PostgreSQLAdapter } from '@builderbot/database-postgres'
import { BaileysProvider } from '@builderbot/provider-baileys'

async function fetchWaVersion() {
    try {
        const r = await fetch('https://web.whatsapp.com/sw.js', {
            headers: {
                'sec-fetch-site': 'none',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            }
        })
        const text = await r.text()
        const match = text.match(/"client_revision":\s*(\d+)/)
        if (match?.[1]) return [2, 3000, parseInt(match[1])]
    } catch (e) {
        console.warn('⚠️ No se pudo obtener versión WA, usando fallback:', e.message)
    }
    return [2, 3000, 1038797494]
}

const AUTH_PATH = process.env.BOT_SESSION_PATH || '/app/bot_sessions'
mkdirSync(AUTH_PATH, { recursive: true })

let wsConnected = false

import { mainMenuFlow } from './flows/mainMenu.js'
import { appointmentFlow, primeraVezFlow, seguimientoFlow, appointmentStatusFlow, cancelAppointmentFlow } from './flows/appointment.js'
import { knowledgeBaseFlow, searchFlow } from './flows/knowledgeBase.js'
import { clinicalHistoryFlow } from './flows/clinicalHistory.js'
import { registrationFlow } from './flows/registration.js'

const helpFlow = addKeyword(['ayuda', 'help', 'socorro'])
    .addAnswer('*Opciones disponibles:*\n\n📅 Agendar / Cita\n📋 Mi Historia Clínica\n📚 Biblioteca\n🏠 Menú\n\n*Escribí una opción.*')

// Railway injects PORT for health/proxy; BuilderBot API runs on a fixed internal port
const HEALTH_PORT = parseInt(process.env.PORT || process.env.HEALTH_PORT || '3001', 10)
const BOT_API_PORT = parseInt(process.env.BOT_API_PORT || '3000', 10)
const HOST = process.env.HOST || '0.0.0.0'

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
    console.log('📍 Health:', HEALTH_PORT, '| API:', BOT_API_PORT, '| Host:', HOST)
    console.log(`📂 Session path: ${AUTH_PATH}`)

    const database = new PostgreSQLAdapter({
        host: process.env.PGHOST || 'localhost',
        user: process.env.PGUSER || 'postgres',
        database: process.env.PGDATABASE || 'railway',
        password: process.env.PGPASSWORD || '',
        port: parseInt(process.env.PGPORT || '5432', 10),
    })

    const waPhone = process.env.WA_PHONE_NUMBER
    if (waPhone) {
        console.log(`📱 Pairing mode: ${waPhone}`)
    }

    const waVersion = await fetchWaVersion()
    console.log(`📡 WA version: ${waVersion.join('.')}`)

    const provider = createProvider(BaileysProvider, {
        name: 'AsistentePsicologico',
        folderNameToken: AUTH_PATH,
        usePairingCode: !!waPhone,
        phoneNumber: waPhone || null,
        version: waVersion,
    })

    provider.on('ready', () => { wsConnected = true; console.log('✅ WhatsApp conectado') })
    provider.on('auth_failure', () => { wsConnected = false; console.error('❌ Auth failure') })
    provider.on('disconnect', () => { wsConnected = false; console.log('📴 Desconectado') })

    provider.on('message', (msg) => {
        console.log('📨 [MSG]', msg.body || msg.type, '| From:', msg.from)
    })

    const flow = createFlow([
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
        ...registrationFlow,
    ])

    console.log('🚀 Creando bot...')

    const result = await createBot({
        flow,
        provider,
        database
    })

    const { httpServer } = result
    httpServer(BOT_API_PORT, HOST)

    console.log(`✅ Bot listo — API: http://${HOST}:${BOT_API_PORT} | Health: http://${HOST}:${HEALTH_PORT}`)
    console.log('📱 Esperando mensajes...')
}

main()