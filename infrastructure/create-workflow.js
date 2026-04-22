const axios = require('axios');

async function createWorkflow() {
    const baseURL = 'http://localhost:5678';
    
    // Login first
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${baseURL}/rest/login`, {
        email: 'admin@asistente.com',
        password: 'Admin123'
    });
    const cookie = loginRes.headers['set-cookie'];
    console.log('✅ Logged in');
    
    // Create workflow
    console.log('2. Creating workflow...');
    const wf = {
        name: 'WhatsApp - New Patient',
        active: true,
        nodes: [
            {
                id: 'webhook-trigger',
                name: 'Webhook',
                type: 'n8n-nodes-base.webhook',
                typeVersion: 1,
                position: [250, 300],
                parameters: {
                    httpMethod: 'POST',
                    path: 'whatsapp-new-patient'
                }
            },
            {
                id: 'respond',
                name: 'Respond to Webhook',
                type: 'n8n-nodes-base.respondToWebhook',
                typeVersion: 1,
                position: [500, 300],
                parameters: {
                    respondWith: 'json',
                    responseBody: '{"status": "ok", "message": "Patient registered"}'
                }
            }
        ],
        connections: {
            'Webhook Trigger': {
                main: [[{ node: 'Respond to Webhook', type: 'main' }]]
            }
        }
    };
    
    const createRes = await axios.post(`${baseURL}/rest/workflows`, wf, {
        headers: { Cookie: cookie }
    });
    console.log('✅ Workflow created:', createRes.data.id);
    
    // Activate
    console.log('3. Activating...');
    await axios.post(`${baseURL}/rest/workflows/${createRes.data.id}/activate`, {}, {
        headers: { Cookie: cookie }
    });
    console.log('✅ Workflow activated');
    
    console.log('\n🎉 Listo! Puedes probar el webhook.');
}

createWorkflow().catch(e => console.error('Error:', e.message));