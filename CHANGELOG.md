# Changelog

All notable changes to this project will be documented in this file.

---

## [Unreleased] — dev branch

### Added
- Real pagination in appointments and patients APIs (`page`, `limit`, `total_count`, `total_pages`)
- `COUNT(*) OVER()` window function for total count without extra DB query
- Pagination controls (Anterior/Siguiente) in dashboard tables
- Google Calendar integration: patient receives calendar invite with reminders on appointment creation
- Auto no-show marker: cron every 30 min marks appointments as `no_show` after 15 min grace period
- Google Sheets sync: 12-column appointment tracking (`Fecha`, `Hora`, `Paciente`, `Email`, `Teléfono`, `Tipo`, `Duración`, `Estado`, `Meet`, `Calendar ID`, `Notas`, `Creada`)
- n8n workflows: `api-patient-detail.json` (GET /patients/:id), `api-patient-consent.json` (POST /patients/:id/consent)
- `N8N_ENCRYPTION_KEY` for persistent n8n credentials across Railway redeploys

### Fixed
- `N8N_BLOCK_ENV_ACCESS_IN_NODE`: hardcoded sheet ID and notification email in non-Code nodes
- `DEFAULT_PSYCHOLOGIST_ID` moved to Code node to bypass Railway env var blocking
- `Confirmación` and `Recordatorios` workflows: removed IMAP trigger (n8n 2.17.7 bug), replaced with Schedule+Webhook CRM pattern
- Google Sheets typeVersion upgraded to 4, Gmail to 2.2, Postgres to 2.4
- n8n persistence: configured PostgreSQL as n8n storage backend to survive Railway redeploys

---

## [1.2.0] - 2026-04-26

### Added (Sprint 5 — HC Module)
- Patient detail page with Clinical History tabs (5 sections: Demographics, Chief Complaint, Personal History, Diagnosis, Treatment Plan)
- Consent gate: HC forms locked until patient signs consent
- 10 HC n8n workflows (GET + POST per section)
- Bot knowledge base refactored to Q&A format using `bot_faq` table
- Migrations 004 (HC unique indexes) and 005 (bot_faq table + seeds)

### Fixed
- Patient list ghost buttons wired: Ver detail, Contactar (mailto/WA), Ver HC navigate
- JWT env vars added to n8n service in docker-compose

---

## [1.1.1] - 2026-04-26

### Fixed (Sprint 4 — Production Hardening)
- Auth via JWT (HS256) replacing Basic Auth plain text credentials
- Baileys session persistence with named Docker volume `bot_sessions`
- Health checks: bot `/health` on port 3001, dashboard nginx `/health`
- Error boundaries on all dashboard routes (React doesn't unmount on fetch failure)
- 3 smoke tests: `getAvailableSlots`, `createAppointmentBot`, `cancelAppointmentBot`
- CI: `VITE_AUTH_USER`/`VITE_AUTH_PASS` build-args passed to dashboard Docker image
- CI: docker compose v2 plugin replacing standalone install

---

## [1.1.0] - 2026-04-26

### Fixed (Sprint 3 — Activate Automations)
- n8n automation workflows activated (`active: true`)
- AppointmentId correlation fixed between bot and n8n
- No-show guard: prevents marking future appointments as no-show
- Postgres nodes upgraded from typeVersion 1.1 to 2.4

### Fixed (Sprint 2 — Bot Booking)
- End-to-end appointment booking via WhatsApp
- Session persistence with Baileys provider
- DB migrations 001–003 applied
- Flows rewritten with `addAnswer+capture` pattern

### Fixed (Sprint 1 — Critical Bugs)
- FK constraint errors on appointment creation
- Auth env vars wired in production
- nginx proxy configuration
- CI/CD secrets unified

---

## [1.1.0] - 2026-04-22

### Added

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

### Added

#### Dashboard (React + Vite + Tailwind CSS 4 + shadcn/ui)
- Basic Auth login (`/login`)
- Dashboard stats page (`/dashboard`)
- Appointments management (`/appointments`)
- Patients management (`/patients`)
- Leads management (`/leads`) + public capture form (`/capture`)
- Public landing page (`/landing`)
- Logout functionality

#### Bot (BuilderBot + WPPConnect)
- New appointment flow with validation
- Knowledge Base flow
- Scheduling flow with conflict detection

#### Database (PostgreSQL)
- `appointments`, `knowledge_base`, `leads`, `campaigns`, `campaign_leads` tables
- 14 Clinical History tables (APA/DSM-5)

#### n8n Workflows
- `api-stats.json`, `api-patients.json`, `api-appointments.json`
- `api-create-patient.json`, `api-create-appointment.json`, `api-leads.json`
- `recordatorios.json`, `no-show.json`, `confirmacion.json`, `agendamiento-flow.json`

---

## [0.0.0] - 2026-01-01

### Added
- Initial project setup
- PostgreSQL schema (psychologists, patients, clinical history)
- n8n basic workflows
- Bot basic flows (test, registration)
