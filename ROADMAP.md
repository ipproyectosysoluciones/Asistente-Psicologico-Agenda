# Roadmap — Asistente Psicológico Agenda

**Última actualización**: 2026-05-08 (Sprint 6a)  
**Estado**: MVP en producción en Railway  
**Rama de desarrollo**: `dev` → `release` → `main`

---

## ✅ Completado

### Fase 0 — Setup inicial (2026-04-22)
- [x] Bot WhatsApp con BuilderBot + Baileys
- [x] Dashboard React + Vite + Tailwind CSS 4 + shadcn/ui
- [x] PostgreSQL schema (psychologists, patients, appointments, HC 14 secciones)
- [x] n8n workflows base (api-stats, api-patients, api-appointments, etc.)
- [x] Docker containers (bot, dashboard, n8n) + docker-compose.production.yml
- [x] Railway deployment
- [x] CI/CD GitHub Actions → Docker Hub (bot + dashboard)

### Fase 1 — Bugs Críticos / Sprint 1 (2026-04-25)
- [x] Exportar y registrar flujos de WhatsApp (`primeraVezFlow`, `seguimientoFlow`)
- [x] Corregir spread en `createFlow()` para flows de array
- [x] Unificar DB a PostgreSQL (eliminar `fileDb.js`)
- [x] Corrección de imports nombrados (`export default` → named exports)
- [x] Nginx proxy `/api` → n8n webhook
- [x] CI/CD secrets unificados (`DOCKER_HUB_USERNAME`, `DOCKER_HUB_TOKEN`)

### Fase 2 — Bot Booking E2E / Sprint 2 (2026-04-25)
- [x] Flujo de agendamiento completo con patrón `addAnswer + capture`
- [x] Cancelación de citas por email implementada end-to-end
- [x] Persistencia de sesión Baileys (volume Docker)
- [x] Migraciones 001–003 aplicadas
- [x] Estado de sesión con `MemoryDB`
- [x] Resolución de conflictos de keywords entre flujos

### Fase 3 — Automatizaciones n8n / Sprint 3 (2026-04-26)
- [x] Workflows activados (`active: true`)
- [x] Corrección columna `start_time` → `scheduled_at` en no-show.json
- [x] Fix correlación `appointmentId` entre bot y n8n
- [x] Guard no-show: previene marcar citas futuras como ausente
- [x] Nodos Postgres actualizados a typeVersion 2.4

### Fase 4 — Hardening Producción / Sprint 4 (2026-04-26)
- [x] JWT HS256 real (`JWT_SECRET`) reemplaza Basic Auth
- [x] Health check bot en `/health` puerto 3001
- [x] Health check dashboard nginx
- [x] Error boundaries en todas las rutas del dashboard
- [x] 3 smoke tests (`getAvailableSlots`, `createAppointmentBot`, `cancelAppointmentBot`)
- [x] `VITE_AUTH_USER`/`VITE_AUTH_PASS` como build-args en Dockerfile

### Fase 5 — Módulo Historia Clínica / Sprint 5 (2026-04-26)
- [x] Página de detalle de paciente con tabs de HC (5 secciones activas)
- [x] Consent gate: HC bloqueada hasta firma de consentimiento
- [x] 10 workflows n8n HC (GET + POST por sección)
- [x] Tabla `bot_faq` para Q&A del bot con seeds
- [x] Migraciones 004–005
- [x] Botones de pacientes cableados (Ver detalle, Contactar, Ver HC)
- [x] Paginación real en APIs (appointments, patients)
- [x] Google Sheets sync (12 columnas de tracking)

### Fase P3/P4 — Mejoras y Cierre de Issues (2026-05-07/08)
- [x] Documentación actualizada: README, AGENTS.md, n8n/README.md
- [x] VITE_JWT_SECRET en dashboard (firma JWT real con Web Crypto API)
- [x] Timezone fix: `Intl.DateTimeFormat` en `getAvailableSlots`
- [x] Session TTL de 30 minutos en flujos del bot
- [x] Unificar `primeraVezFlow`/`seguimientoFlow` con `gotoFlow(appointmentFlow)`
- [x] Migration runner custom (`infrastructure/migrate.js` + `schema_migrations`)
- [x] Fix migration 002: índice en `patients(email)` (no `appointments.patient_email`)
- [x] Servicio Docker `migrate` one-shot en ambos docker-compose
- [x] Imagen `asistente-psicologico-migrate` en CI/CD
- [x] Merge `feature/p2-config-fixes`: status filter, PG pool, `.env.example`
- [x] Fix CI: parámetro `file:` en `build-push-action` (no `dockerfile:`)
- [x] Limpieza de ramas huérfanas

### Sprint 6a — JWT Auth Fix + n8n Workflow Bug Fixes (2026-05-08) — [PR #97](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/97)
- [x] **REQ-AUTH-01** · Eliminar `VITE_JWT_SECRET` del bundle — removido de Dockerfile y CI ([#95](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/95))
- [x] **REQ-AUTH-02** · Login endpoint en n8n (`POST /webhook/auth/login`) — nuevo `api-auth-login.json` ([#95](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/95))
- [x] **REQ-AUTH-03** · `AuthContext.tsx` migrado a server-side auth + inactivity timer 60 min ([#95](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/95))
- [x] **REQ-N8N-01** · Fix título de evento Google Calendar con nombre de paciente ([#96](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/96))
- [x] **REQ-N8N-02** · Guard null en `confirmacion.json` → HTTP 404 en lugar de 500 ([#96](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/96))
- [x] **REQ-N8N-03** · Guard `DEFAULT_PSYCHOLOGIST_ID` en `api-create-patient.json` → HTTP 400 ([#96](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/96))

### Sprint 6b — Dashboard UI Polish (2026-05-08) — [PR #99](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/99)
- [x] **REQ-UI-01** · `CapturePage.tsx` migrada a shadcn/ui (Card, Input, Button, Label, Sonner) ([#98](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/98))
- [x] **REQ-UI-02** · `LoginPage.tsx` migrada a shadcn/ui + loading state + M-03 resuelto ([#98](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/98))
- [x] **REQ-CHART-01** · Gráfico de tendencias de citas (AreaChart recharts, últimas 8 semanas) ([#98](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/98))
- [x] **REQ-CHART-02** · `api-stats.json` extendido con `weekly_appointments` breakdown ([#98](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/98))

### Sprint 7a — Multi-tenant Auth + Tenant Isolation (2026-05-08) — [PR #101](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/101) [PR #102](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/102) — v1.7.0
- [x] **REQ-AUTH-01** · `api-auth-login.json` — auth DB-backed con pgcrypto `crypt()`, JWT embebe `psychologist_id` + `role` ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-AUTH-02** · Cuenta inactiva → 403; credenciales inválidas → 401 (nodo `IF - User Active` separado) ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-TENANT-01** · `api-appointments.json` + `api-create-appointment.json` — filtro `AND psychologist_id = $N::uuid` ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-TENANT-02** · `api-patients.json` + `api-patient-detail.json` + `api-create-patient.json` — filtro tenant ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-TENANT-03** · `api-stats.json` — KPIs y weekly stats filtrados por `psychologist_id` del JWT ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-MIGRATION-01** · Migración 008 — `role` + `is_active` en tabla `psychologists` (idempotente) ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-RATELIMIT-01** · nginx `limit_req_zone` — 10r/s API general, 1r/12s auth (anti-brute-force) ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))

---

## 🔴 Pendientes

### Dashboard
- [ ] **M-01** · `tsconfig.json jsx: "react-compiler"` → debe ser `"react-jsx"`
- [ ] **L-05** · Botones CTA de landing sin `href` ni `onClick`

### Infraestructura / DevOps
- [ ] **M-06** · `update_updated_at()` definida dos veces en `init-db.sql`
- [ ] **M-07** · `Prognosis` con mayúscula en `init-db.sql`
- [x] **M-09** · `bot-compose.yml` sin `DATABASE_URL` ni `DEFAULT_PSYCHOLOGIST_ID` — resuelto en hotfix
- [ ] **M-12** · `PGPASSWORD` faltante en `backup.sh` — backup silencioso falla
- [ ] **M-13** · Doble compresión en `backup.sh` (`-Fc` + gzip)
- [ ] **L-09** · `bot-compose.yml` con `network_mode: host` incompatible con bridge

### Deuda técnica
- [ ] **L-01** · `.env.template` sin `GOOGLE_SHEET_ID` ni `NOTIFICATION_EMAIL`
- [ ] **L-02** · `registrationSimpleFlow` y `newPatientKeywordFlow` son código muerto
- [ ] **L-03** · `consentFlow` y `dataRequestFlow` exportados pero nunca registrados
- [ ] **L-07** · Carácter cirílico `оператор` en template email de paciente

---

## 🚀 Features en Pipeline (próximas sesiones)

> Exploración iniciada vía `/sdd-new` — artefactos en engram.

- [ ] **Dashboard mejoras**
  - Seed con datos dummy para testing UI (pacientes, citas, HC)
  - Landing page como consultorio real con estrategia SEO
  - Mejoras UI/UX con shadcn/ui
  - Recordatorio de citas con QR (info del evento + ubicación)

---

## 📊 Estado del MVP por área

| Área | Estado | Notas |
|------|--------|-------|
| Bot WhatsApp | ✅ Funcional | Booking + cancelación + FAQ |
| n8n API | ✅ Funcional | APIs CRUD OK; tenant isolation + DB-backed auth (Sprint 7a) |
| Dashboard | ✅ Funcional | Auth server-side JWT, HC, paginación OK |
| PostgreSQL | ✅ Estable | Schema completo, migraciones trackeadas (008 aplicada) |
| CI/CD | ✅ Verde | 3 imágenes Docker Hub, Railway auto-deploy |
| Automatizaciones | ✅ Funcional | Workflows activos, bugs n8n resueltos Sprint 6a |
| Seguridad | ✅ Hardened | JWT embebe psychologist_id; tenant isolation; nginx rate limiting (Sprint 7a) |
