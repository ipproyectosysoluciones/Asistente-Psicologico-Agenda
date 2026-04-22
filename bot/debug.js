import 'dotenv/config'
import { createProvider } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'

const provider = createProvider(BaileysProvider, {
    name: 'AsistentePsicologico',
    path: './sessions'
})

provider.on('require_action', async (data) => {
    console.log('\n⚡⚡ ACTION REQUIRED ⚡⚡')
    console.log('Title:', data.title)
    console.log('Instructions:', data.instructions)
    if (data.payload?.qr) {
        console.log('\n📱 QR Recibido:')
        console.log(data.payload.qr)
    }
    if (data.payload?.code) {
        console.log('\n🔢 Codigo de pareado:', data.payload.code)
    }
})

provider.on('auth_failure', async (data) => {
    console.log('\n❌ AUTH FAILURE:', JSON.stringify(data))
})

provider.on('ready', async () => {
    console.log('\n✅ WhatsApp conectado!')
})

console.log('Iniciando provider solo...')

await new Promise(resolve => setTimeout(resolve, 50000))

console.log('\n=== Fin del debug ===')