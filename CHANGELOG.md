# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-04-22

### Added (Agregado)

#### Docker & Deployment
- `bot/Dockerfile` - Bot container with Node + Chromium for WPPConnect
- `dashboard/Dockerfile` - Multi-stage build with nginx for React SPA
- `docker-compose.production.yml` - Production compose for Railway
- `scripts/build.sh` - Build & push script for Docker Hub
- `DEPLOY.md` - Railway deployment guide

#### Security
- `SECURITY.md` - Security policy document (ES/EN)
- Security vulnerabilities documented with workarounds
- pnpm overrides for known issues

---

## [1.0.0] - 2026-04-22

### Added (Agregado)

#### Dashboard (React + Vite + Tailwind CSS 4 + shadcn/ui)
- Basic Auth login (`/login`)
- Dashboard stats page (`/dashboard`)
- Appointments management (`/appointments`)
  - List all appointments
  - Create new appointment (modal)
- Patients management (`/patients`)
  - List all patients  
  - Create new patient (modal)
- Leads management (`/leads`)
  - Lead capture form public (`/capture`)
  - Lead stats (total, new, contacted, converted)
  - Create lead manual
- Public landing page (`/landing`)
- Logout functionality

#### Bot (BuilderBot + WPPConnect)
- New appointment flow with validation
- Knowledge Base flow
- Scheduling flow with conflict detection

#### Database (PostgreSQL)
- `appointments` table for scheduling
- `knowledge_base` table for PDF resources
- `leads` table for lead capture
- `campaigns` table for campaigns
- `campaign_leads` table for campaign targeting
- 14 Clinical History tables (APA/DSM-5)

#### n8n Workflows
- `api-stats.json` - GET /api/stats
- `api-patients.json` - GET /api/patients
- `api-appointments.json` - GET /api/appointments
- `api-create-patient.json` - POST /api/patients
- `api-create-appointment.json` - POST /api/appointments
- `api-leads.json` - GET/POST /api/leads
- `recordatorios.json` - Email reminders (24h, 1h before)
- `no-show.json` - Automatic no-show tracking
- `confirmacion.json` - Email confirmation handling
- `agendamiento-flow.json` - Scheduling webhook

### Fixed (Corregido)
- Appointments flow now validates availability
- Recordatorios workflow calculating hours properly
- Login button now works with navigate

---

## [0.0.0] - 2026-01-01

### Added (Agregado)

- Initial project setup
- PostgreSQL schema (psychologists, patients, clinical history)
- n8n basic workflows
- Bot basic flows (test, registration)

---

## 🔄 Coming Soon / Próximamente

- Campaign builder (full builder)
- Email/SMS campaigns scheduling
- Analytics dashboard
- Google Calendar integration
- WhatsApp connection stability fix