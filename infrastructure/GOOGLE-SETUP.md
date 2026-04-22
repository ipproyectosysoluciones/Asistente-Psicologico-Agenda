# Google API Setup - Asistente Psicológico

## 1. Crear Proyecto en Google Cloud Console

1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto: "Asistente-Psicologico"
3. Habilita las APIs necesarias:
   - Google Calendar API
   - Google Sheets API
   - People API (opcional)

## 2. Configurar OAuth Consent Screen

1. Ve a **APIs & Services** → **OAuth consent screen**
2. Selecciona **External**
3. Completa:
   - Email: tu email
   - App name: "Asistente Psicológico"
   - Scopes necesarios:
     - `.../auth/calendar`
     - `.../auth/spreadsheets`
     - `.../auth/userinfo.email`
4. Agrega usuarios de prueba (tu email)

## 3. Crear Credenciales OAuth

1. Ve a **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Tipo: **Desktop app**
4. Descarga el JSON

## 4. Configurar en n8n

En n8n (http://localhost:5678):

1. Ve a **Settings** → **Credentials**
2. Agrega nuevas credenciales:
   - **Google OAuth2** para Calendar
   - **Google OAuth2** para Sheets
3. Pega el Client ID y Client Secret del JSON descargado

## 5. Obtener Sheet ID

1. Crea una nueva hoja en Google Sheets
2. La URL será: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3. Copia el `SPREADSHEET_ID` (parte entre `/d/` y `/edit`)

## 6. Configurar Variables

En el archivo `.env` del bot:
```
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:5678/oauth2/callback
```

## 7. Habilitar Webhooks de n8n

Para exponer webhooks públicamente (necesario para WhatsApp):
- Opción A: Usar ngrok: `ngrok http 5678`
- Opción B: Configurar proxy/reverso en tu router
- Opción C: Usar un servicio como Cloudflare Tunnel

## URLs de Webhook

| Workflow | URL |
|----------|-----|
| New Patient | `http://localhost:5678/webhook/whatsapp-new-patient` |
| Agendar | `http://localhost:5678/webhook/agendar` |
| Recordatorios | (Schedule - no necesita webhook) |

## Testing

Para probar los webhooks:
```bash
# New patient
curl -X POST http://localhost:5678/webhook/whatsapp-new-patient \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Juan","last_name":"Pérez","email":"juan@test.com","phone":"+5217712345678","country":"MX"}'
```