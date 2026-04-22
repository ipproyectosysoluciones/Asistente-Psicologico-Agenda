# Asistente-Psicologico-Agenda

## 🇲🇽 🇨🇴 🇪🇸 🇺🇸 Multi-Therapist Psychological Appointment Management System

A comprehensive system for managing psychological appointments with AI-powered WhatsApp integration, clinical history management, and compliance with LFPDPPP (MX), Ley 1581 (CO), RGPD (ES), and HIPAA (USA).

🇬🇧 English | 🇪🇸 Español

---

## 📋 Project Status / Estado del Proyecto

**Status**: ✅ In Development  
**Version**: 1.0.0  
**Last Updated**: 2026-04-22

---

## 🏗️ Architecture / Arquitectura

```
Asistente-Psicologico-Agenda/
├── bot/                    # WhatsApp Bot (BuilderBot + WPPConnect)
│   ├── src/
│   │   ├── index.js       # Bot entry point
│   │   ├── flows/        # Conversation flows
│   │   └── services/     # Business logic
│   └── package.json
│
├── dashboard/             # Dashboard (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/   # UI components (shadcn/ui)
│   │   ├── pages/        # Dashboard pages
│   │   ├── contexts/     # React contexts
│   │   └── lib/          # Utilities
│   └── package.json
│
├── infrastructure/        # Infrastructure & DB
│   ├── init-db.sql       # PostgreSQL schema
│   ├── docker-compose.yml
│   └── n8n/             # n8n workflows (JSON)
│
├── .github/workflows/     # CI/CD
└── .husky/               # Git hooks
```

---

## 🚀 Quick Start

### Prerequisites / Requisitos Previos

- Node.js 18+
- pnpm
- Docker Desktop
- PostgreSQL (optional if using Docker)

### Installation

```bash
# Clone / Clonar
git clone https://github.com/your-org/Asistente-Psicologico-Agenda.git
cd Asistente-Psicologico-Agenda

# Install bot dependencies
cd bot && pnpm install

# Install dashboard dependencies  
cd dashboard && pnpm install

# Start infrastructure
cd infrastructure && docker-compose up -d

# Initialize database
psql -h localhost -U admin -d asistente_psicologico -f init-db.sql
```

### Running / Ejecutar

```bash
# Bot (Puerto 3000)
cd bot && pnpm dev

# Dashboard (Puerto 5173)
cd dashboard && pnpm dev

# n8n (Puerto 5678)
# Open http://localhost:5678
```

---

## 📱 WhatsApp Bot

### Available Commands / Comandos Disponibles

| Command | Description | Descripción |
|---------|-------------|-------------|
| `menu` | Main menu | Menú principal |
| `agendar` / `cita` | Schedule appointment | Agendar cita |
| `mis citas` | View appointments | Ver mis citas |
| `cancelar` | Cancel appointment | Cancelar cita |
| `📚 Biblioteca` / `kb` | Knowledge Base | Biblioteca de recursos |

### Appointment Types / Tipos de Cita

- **Primera vez**: 90 min, $60 USD
- **Seguimiento**: 50 min, $45 USD

### Schedule / Horario

- Tuesday to Sunday / Martes a Domingo
- 09:00 - 18:00
- Lunch / Almuerzo: 12:00 - 13:00

---

## 📊 Dashboard

### Pages / Páginas

| Path | Description | Descripción |
|------|-------------|-------------|
| `/login` | Basic Auth login | Login básico |
| `/dashboard` | Statistics | Estadísticas |
| `/appointments` | Appointment management | Gestión de citas |
| `/patients` | Patient management | Gestión de pacientes |
| `/leads` | Lead management | Gestión de leads |
| `/landing` | Public landing | Landing público |
| `/capture` | Public lead capture | Capture de leads |

### Default Credentials / Credenciales por Defecto

```
User: admin
Password: password
```

**⚠️ Change in production! / ⚠️ Cambiar en producción!**

---

## 🗄️ Database Schema

### Core Tables / Tablas Principales

- `psychologists` - Multi-tenant therapists
- `patients` - Patient records
- `appointments` - Scheduling
- `leads` - Lead capture
- `campaigns` - Campaigns
- `knowledge_base` - PDF resources

### Clinical History / Historia Clínica (14 sections)

1. Demographics / Datos de identificación
2. Chief Complaint / Motivo de consulta
3. Personal History / Antecedentes personales
4. Family History / Antecedentes familiares
5. Developmental History / Historia del desarrollo
6. Psychological Evaluation / Evaluación psicológica
7. Diagnosis / Diagnóstico (DSM-5)
8. Treatment Plan / Plan de tratamiento
9. Session Notes / Notas de sesión
10. Consentimientos / Consentimientos
11. Mental Status Exam / Examen mental
12. Social Profile / Perfil social
13. Personality Profile / Personalidad
14. Treatment Response / Respuesta al tratamiento

---

## 🔧 n8n Workflows

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Dashboard statistics |
| `/api/patients` | GET, POST | Patient CRUD |
| `/api/appointments` | GET, POST | Appointment CRUD |
| `/api/leads` | GET, POST | Lead CRUD |

### Scheduled Workflows

- **Recordatorios** - Email reminders (24h, 1h before appointment)
- **No-Show** - Automatic no-show tracking
- **Confirmacion** - Email confirmation handling

---

## 🔐 Compliance / Cumplimiento

| Regulation | Country | Status |
|------------|---------|---------|
| LFPDPPP | 🇲🇽 Mexico | ✅ |
| Ley 1581 | 🇨🇴 Colombia | ✅ |
| RGPD | 🇪🇸 España | ✅ |
| HIPAA | 🇺🇸 USA | ✅ |

### Data Retention / Retención de Datos

- Active patients: Unlimited
- Inactive patients: 7 years
- Leads: 2 years
- Appointments: 7 years

---

## 📝 API Reference

### Patients

```bash
GET /api/patients
POST /api/patients
```

### Appointments

```bash
GET /api/appointments
POST /api/appointments
```

### Leads

```bash
GET /api/leads
POST /api/leads
```

### Stats

```bash
GET /api/stats
```

---

## 🔧 Environment Variables

### Bot

```env
DATABASE_URL=postgresql://admin:admin@localhost:5432/asistente_psicologico
DEFAULT_PSYCHOLOGIST_ID=<uuid>
```

### Dashboard

```env
VITE_API_URL=http://localhost:5678
VITE_AUTH_USER=admin
VITE_AUTH_PASS=password
```

---

## 📄 License

MIT License

---

## 👥 Contributors / Contribuidores

- Development Team / Equipo de Desarrollo

---

## 📚 Documentation / Documentación

- [CHANGELOG](./CHANGELOG.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [n8n Workflows](./infrastructure/n8n/README.md)
- [Google Setup](./infrastructure/GOOGLE-SETUP.md)