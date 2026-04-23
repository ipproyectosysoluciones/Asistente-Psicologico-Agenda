import 'dotenv/config'
import { createBot, createProvider, createFlow, addKeyword, MemoryDB } from '@builderbot/bot'
import pkg from '@builderbot/provider-wppconnect'
const { WPPConnectProvider } = pkg

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

const main = async () => {
    console.log('🔄 Iniciando bot...')

    const database = new MemoryDB()

    const provider = createProvider(WPPConnectProvider, {
        name: 'AsistentePsicologico',
        qr: false,
        folderNameToken: 'tokens',
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    })

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
    httpServer(3000)

    console.log('✅ Bot listo en http://localhost:3000')
    console.log('📱 Esperando mensajes...')
}

main()