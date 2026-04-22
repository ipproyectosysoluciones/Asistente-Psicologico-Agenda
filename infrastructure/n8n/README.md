# n8n Workflows - Asistente Psicológico

## Importar a n8n

Para importar los workflows:
1. Ir a http://localhost:5678
2. Login con: admin / admin123
3. Ir a **Workflows** → **Import from File**

## Workflows Disponibles

### 1. WhatsApp New Patient (whatsapp-new-patient.json)
Recibe pacientes nuevos desde WhatsApp y los registra en PostgreSQL.

**Trigger**: Webhook  
**URL**: `http://localhost:5678/webhook/whatsapp-new-patient`

**Nodos**:
- Webhook (entrada)
- PostgreSQL - Insert patient
- Slack/Email - Notificación

### 2. Agendamiento (agendamiento-flow.json)
Gestion de citas: verificar disponibilidad, crear evento en Google Calendar.

**Trigger**: Webhook  
**Nodos**:
- Webhook
- PostgreSQL - Get availability
- Google Calendar - Check events
- PostgreSQL - Create appointment
- Google Calendar - Create event
- Slack - Confirmación

### 3. Recordatorios (recordatorios.json)
Envía recordatorios automáticos 24h y 1h antes de cada cita.

**Trigger**: Schedule (cada hora)  
**Nodos**:
- Schedule (Every hour)
- PostgreSQL - Get appointments tomorrow
- Switch (24h / 1h)
- Email - Send reminder
- WhatsApp via n8n - Send message

### 4. Google Sheets Sync (google-sheets-sync.json)
Sincroniza datos de PostgreSQL a Google Sheets para reporting.

**Trigger**: Schedule (diario)  
**Nodos**:
- Schedule (Daily at 6am)
- PostgreSQL - Get all appointments
- Google Sheets - Append row
- PostgreSQL - Mark as synced

## Variables de Entorno

Configurar en n8n:
```
DB_HOST=asistente-psicologico-db
DB_PORT=5432
DB_NAME=asistente_psicologico
DB_USER=admin
DB_PASSWORD=changeme123

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...

SLACK_WEBHOOK_URL=...
```

## Webhook Externo para WhatsApp

Para conectar con BuilderBot:
- Webhook URL exponer con ngrok o配置的 proxy
- El bot envía mensajes a n8n vía HTTP POST