import 'dotenv/config'
import { createBot, createProvider, createFlow, addKeyword, MemoryDB } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import pino from 'pino'

const logger = pino({ level: 'debug' })

const menuFlow = addKeyword(['hola'])
    .addAnswer('Hola!')

const main = async () => {
    console.log('1. Creating DB...')
    const database = new MemoryDB()
    
    console.log('2. Creating flow...')
    const flow = createFlow([menuFlow])
    
    console.log('3. Creating provider con verbose...')
    const provider = createProvider(BaileysProvider, {
        name: 'AsistentePsicologico',
        path: './sessions'
    })
    
    console.log('4. Creating bot...')
    const result = await createBot({
        flow,
        provider,
        database
    })
    
    console.log('✅ Bot creado!', Object.keys(result))
    console.log('Esperando eventos...')
    
    provider.on('connection.update', (update) => {
        console.log('📡 Connection update:', update)
    })
    
    provider.on('messsage', (ctx) => {
        console.log('💬 Message:', ctx.body)
    })
    
    await new Promise(resolve => setTimeout(resolve, 60000))
}

main().catch(console.error)