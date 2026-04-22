import 'dotenv/config'
import { createBot, createProvider, createFlow, addKeyword, MemoryDB } from '@builderbot/bot'
import pkg from '@builderbot/provider-wppconnect'
const { WPPConnectProvider } = pkg

// Flow que responde a CUALQUIER cosa
const catchAllFlow = addKeyword(['.*'])
    .addAnswer('¡Hola! 👋 Recibí tu mensaje.')
    .addAnswer('Escribe "cita" para agendar una cita.')

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

    // Logging de TODO
    provider.parser?.on?.('message', (msg) => {
        console.log('📨 [PARSER] Mensaje:', msg.body)
    })
    
    provider.on('any.message', (msg) => {
        console.log('📨 [ANY] Mensaje:', msg.body || JSON.stringify(msg).substring(0,100))
    })

    provider.on('message', (msg) => {
        console.log('📨 [MESSAGE] Msg:', msg.body || msg.type, '| From:', msg.from)
    })

    provider.on('connection.update', (update) => {
        console.log('📡 Conexión:', update.connection)
    })

    // Flow simple con regex para capturar todo
    const flow = createFlow([catchAllFlow])

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
    console.log('💡 Envia CUALQUIER mensaje desde WhatsApp')
}

main()