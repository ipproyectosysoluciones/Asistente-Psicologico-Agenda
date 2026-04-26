import 'dotenv/config'
import { mkdirSync } from 'fs'
import { createBot, createProvider, createFlow, addKeyword, MemoryDB } from '@builderbot/bot'
import pkg from '@builderbot/provider-wppconnect'
const { WPPConnectProvider } = pkg

// ── Session persistence / Persistencia de sesión ──────────────────────────
// BOT_SESSION_PATH is the directory where WPPConnect stores its session tokens.
// BOT_SESSION_PATH es el directorio donde WPPConnect guarda los tokens de sesión.
// Railway mounts a volume at /app/bot_sessions; local dev defaults to ./bot_sessions.
const AUTH_PATH = process.env.BOT_SESSION_PATH || '/app/bot_sessions'
mkdirSync(AUTH_PATH, { recursive: true })

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

const main = async () => {
    console.log('🔄 Iniciando bot con WPPConnect...')
    console.log('📍 Puerto:', PORT, '| Host:', HOST)
    console.log(`📂 Session path: ${AUTH_PATH}`)
    console.log('⚠️  NOTA: el estado de conversación (MemoryDB) es volátil — un reinicio del proceso resetea las conversaciones en curso.')

    const database = new MemoryDB()

    // folderNameToken points WPPConnect at the session directory persisted via Railway volume.
    // folderNameToken apunta WPPConnect al directorio de sesión persistido via Railway volume.
    let provider
    try {
        provider = createProvider(WPPConnectProvider, {
            name: 'AsistentePsicologico',
            qr: false,
            folderNameToken: AUTH_PATH,
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        })
    } catch (err) {
        // Auth load failure — log loudly and allow bot to regenerate QR on next connection attempt.
        // Fallo al cargar auth — loguear y permitir que el bot regenere QR en el próximo intento.
        console.error('ERROR [index] wppconnect_auth_failed — regenerating session:', err.message)
        provider = createProvider(WPPConnectProvider, {
            name: 'AsistentePsicologico',
            qr: true,
            folderNameToken: AUTH_PATH,
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        })
    }

    provider.parser?.on?.('message', (msg) => {
        console.log('📨 [PARSER]', msg.body)
    })

    provider.on('any.message', (msg) => {
        console.log('📨 [ANY]', msg.body || JSON.stringify(msg).substring(0, 80))
    })

    provider.on('message', (msg) => {
        console.log('📨 [MSG]', msg.body || msg.type, '| From:', msg.from)
    })

    provider.on('connection.update', (update) => {
        console.log('📡 Conexión:', update.connection)
        if (update.qr) {
            console.log('📱 Escaneá el QR en http://localhost:3000')
        }
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