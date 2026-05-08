# n8n Workflows — Asistente Psicológico

## Acceso

- **Local**: http://localhost:5678 — login: `N8N_AUTH_USER` / `N8N_AUTH_PASS`
- **Producción**: expuesto vía nginx proxy en `/api/` (Railway)

## Importar workflows

1. Ir a **Workflows** → **Import from File**
2. Seleccionar el archivo `.json` de esta carpeta
3. Configurar credenciales de PostgreSQL en los nodos que las requieran

---

## API REST (activos en producción)

| Archivo | Endpoint | Método | Descripción |
|---------|----------|--------|-------------|
| `api-appointments.json` | `/api/appointments` | GET | Listado paginado con filtro de status |
| `api-create-appointment.json` | `/api/appointments` | POST | Crear cita |
| `api-patients.json` | `/api/patients` | GET | Listado paginado de pacientes |
| `api-create-patient.json` | `/api/patients` | POST | Crear paciente |
| `api-patient-detail.json` | `/api/patients/:id` | GET | Detalle de paciente |
| `api-patient-consent.json` | `/api/patients/:id/consent` | POST | Registrar consentimiento |
| `api-stats.json` | `/api/stats` | GET | Estadísticas del dashboard |
| `api-leads.json` | `/api/leads` | GET/POST | Leads |
| `api-hc-*.json` | `/api/patients/:id/hc/*` | GET/POST | Secciones de Historia Clínica |

Todos los endpoints REST requieren JWT Bearer token (`JWT_SECRET` en variables de entorno de n8n).

---

## Workflows automáticos

| Archivo | Trigger | Descripción |
|---------|---------|-------------|
| `recordatorios.json` | Schedule (cada hora) | Recordatorios 24h y 1h antes de cita |
| `no-show.json` | Schedule (diario) | Marca inasistencias automáticamente |
| `confirmacion.json` | Webhook email | Confirmación/cancelación por email |
| `google-sheets-sync.json` | Schedule (diario 6am) | Sync citas → Google Sheets |

---

## Variables de entorno de n8n

Configurar en Railway o `.env` local:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<secreto compartido con el bot>
N8N_AUTH_USER=admin
N8N_AUTH_PASS=<password seguro>
GOOGLE_SHEET_ID=<id de la hoja>
NOTIFICATION_EMAIL=<email de notificaciones>
```

---

## Notas

- El proxy nginx traduce `/api/` → `http://n8n-interno:5678/webhook/`
- Los workflows deben activarse manualmente después de importar (`active: true`)
- La columna de psicólogo es `full_name` (no `first_name`)
- La columna de fecha de cita es `scheduled_at` (no `start_time`)
