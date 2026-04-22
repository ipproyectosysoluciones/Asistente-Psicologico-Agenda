import 'dotenv/config'
import { createProvider } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import path from 'path'
import fs from 'fs'

console.log('=== DEBUG BUILD ===')

try {
    console.log('1. Importando BaileysProvider...')
    console.log('   BaileysProvider:', typeof BaileysProvider)
    
    console.log('2. Creando provider...')
    const provider = createProvider(BaileysProvider, {
        name: 'TestBot',
        path: './sessions-test'
    })
    console.log('   Provider created:', typeof provider)
    
    console.log('3. Configurando eventos...')
    
    provider.on('any', async (data) => {
        console.log('EVENTO:', data)
    })
    
    provider.on('message', async (ctx) => {
        console.log('MENSAJE:', ctx.body)
    })
    
    provider.on('require_action', async (data) => {
        console.log('\n⚡ ACTION REQUIRED:', data)
    })
    
    provider.on('auth_failure', async (data) => {
        console.log('\n❌ AUTH FAILURE:', data)
    })
    
    provider.on('ready', async () => {
        console.log('\n✅ READY!')
    })
    
    provider.on('close', async () => {
        console.log('\n❌ CLOSE')
    })
    
    console.log('4. Esperando 45 segundos...')
    await new Promise(resolve => setTimeout(resolve, 45000))
    
    console.log('\n=== FIN ===')
    
} catch (error) {
    console.error('ERROR:', error)
}