# Roadmap — Asistente Psicológico Agenda

**Última actualización**: 2026-05-09 (Phase 5 W18-20 — v2.0.0)  
**Estado**: Phase 5 COMPLETA — Production-ready en Railway  
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

### Sprint W21 — AI Layer: GPT-4o + RAG + Triage (2026-05-09) — PRs [#124](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/124) [#125](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/125) [#126](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/126)
- [x] **W21.1** · `aiService.js` — wrapper GPT-4o (`complete`, `completeJSON`, `embed`) con guardrails clínicos en BASE_SYSTEM_PROMPT; singleton proxy con `OPENAI_API_KEY`
- [x] **W21.2** · `ragService.js` — factory + singleton; `answer()` (embed → cosine search pgvector `<=>` threshold 0.25 → GPT-4o) + `ingest()` (PDF → chunks 375 palabras/38 overlap → embeddings); cache SHA-256 TTL 1h
- [x] **W21.3** · `knowledgeBase.js` — RAG-first con fallback a `bot_faq`; fuentes mostradas como `basename`
- [x] **W21.4** · `ingestPdfs.js` — script one-shot; **45 PDFs indexados → 2 616 chunks** en `knowledge_embeddings` (skipped=0)
- [x] **W21.5** · `distressDetector.js` — función pura `detect(text)`, 3 keyword lists + 5 regex, zero I/O
- [x] **W21.6** · `triageService.js` — factory + singleton; `nextTurn()` PHQ-9 conversacional (GPT-4o), `finalize()` (score → urgency 4 niveles), `saveAssessment()`, `hasUpcomingAppointment()`
- [x] **W21.7** · `triageFlow` + `emergencyFlow` — EVENTS.ACTION + capture loop; severe → emergencyFlow con línea de crisis
- [x] **W21.8** · `mainMenu.js` — `distressGuard()` en los 3 keywords; distress + sin cita → triage; distress + con cita → mensaje empático
- [x] **W21.9** · Migration 013 — `knowledge_embeddings` + pgvector `vector(1536)` + IVFFlat cosine index (lists=100)
- [x] **W21.10** · Migration 014 — `triage_assessments` con FK a `patients` + `psychologists`, `phq9_score CHECK(0-27)`, urgency_level CHECK
- [x] **W21.11** · CI/CD fix — Docker tags válidos en PRs (`type=ref,event=pr`; SHA tag deshabilitado en PRs)
- [x] **53 tests bot** (total acumulado: 68 tests — 15 dashboard + 53 bot); 16/16 spec compliance scenarios
- [x] **Issues cerrados**: [#122](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/122) (PR2 RAG) · [#123](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/123) (PR3 Triage)

### Phase 5 W18-20 — Production Hardening (2026-05-09) — [PR #114](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/114) — v2.0.0
- [x] **5.11b** · `CompliancePage.tsx` — LFPDPPP, Ley 1581, RGPD actualizados a `implemented` post Sprint 8b ([#111](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/111))
- [x] **5.13** · `encryption-review.md` + migración 011 — inventario PII, bcrypt status, brechas Phase 6 documentadas ([#111](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/111))
- [x] **5.14** · `disaster-recovery.md` — RTO < 2h, RPO < 24h, 5 escenarios de recuperación ([#111](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/111))
- [x] **5.15** · Migración 012 — 11 índices compuestos parciales (appointments, patients, HC, leads) ([#111](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/111))
- [x] **5.16** · `k6-load-test.js` — script 1000 usuarios concurrentes, stages ramp-up, thresholds p(95)<2s ([#112](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/112))
- [x] **5.17** · `security-audit-owasp.md` — OWASP A01-A10 con estado y acciones pendientes pre-launch ([#112](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/112))
- [x] **5.18** · `pentest-validation.md` — guía pentest: JWT, SQLi, XSS, cross-tenant, brute force ([#112](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/112))
- [x] **5.19** · `production-deployment-checklist.md` — checklist 3 fases, seguridad, DB, rollback ([#112](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/112))
- [x] **5.20** · `ops-troubleshooting.md` — 6 escenarios frecuentes, queries diagnóstico, Railway commands ([#112](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/112))
- [x] **5.21** · `CompliancePage.test.tsx` — 4 tests nuevos, **15 tests totales pasando** ([#113](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/113))
- [x] **5.22/5.24** · `docs/onboarding-psychologist.md` — guía completa para psicólogos ([#113](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/113))
- [x] **5.23** · `infrastructure/runbooks/monitoring-setup.md` — Railway metrics, alertas, logging ([#113](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/113))
- [x] **5.25** · `docs/launch-checklist.md` — checklist v2.0.0, smoke tests, métricas de éxito ([#113](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/113))

### Sprint 8b — GDPR Export Completo + Retention Policy (2026-05-08) — [PR #110](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/110) — v1.10.0
- [x] **REQ-GDPR-02** · `api-gdpr-export.json` — 13 subqueries `json_build_object`, exporta todas las secciones HC con campos completos ([#109](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/109))
- [x] **REQ-MIGRATION-02** · Migración 010 — `retention_years INTEGER NOT NULL DEFAULT 5` en `psychologists` (idempotente) ([#109](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/109))
- [x] **REQ-CRON-01** · `cron-retention.json` — Schedule Trigger `0 2 * * *`, soft-delete + PII null-out + 12 tablas HC `is_current=FALSE` + consentimientos `status='revoked'` ([#109](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/109))

### Sprint 8a — Admin Dashboard + AdminGuard + Compliance Page (2026-05-08) — [PR #108](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/108) — v1.9.0
- [x] **REQ-AUTH-03** · `AuthContext.tsx` — decode JWT client-side, expone `jwtRole: 'admin' | 'psychologist' | null` + `jwtPsychologistId: string | null` ([#107](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/107))
- [x] **REQ-ADMIN-01** · `AdminGuard.tsx` — gate fail-closed, redirige a `/dashboard` si role ≠ admin ([#107](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/107))
- [x] **REQ-ADMIN-02** · `PsychologistsPage.tsx` — CRUD admin: listar, crear, editar, desactivar con shadcn/ui + TanStack Query ([#107](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/107))
- [x] **REQ-ADMIN-03** · `CompliancePage.tsx` — checklist estático LFPDPPP/Ley1581/RGPD/HIPAA con estado honesto ([#107](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/107))
- [x] **REQ-DB-01** · `init-db.sql` — columna `role VARCHAR(20) NOT NULL DEFAULT 'psychologist'` en psychologists DDL ([#107](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/107))
- [x] **REQ-BACKEND-01** · `api-psychologists.json` — GET incluye `COALESCE(full_name, email) AS full_name` ([#107](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/107))
- [x] Vitest setup: 11 tests pasando (AuthContext + AdminGuard + PsychologistsPage)

### Sprint 7b — RBAC + Audit + GDPR + Backup + Monitoring (2026-05-08) — [PR #104](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/104) [PR #105](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/105) [PR #106](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/106) — v1.8.0
- [x] **REQ-PSYCH-01** · `api-psychologists.json` — CRUD admin-only (soft-delete, last-admin guard, 409 en email duplicado)
- [x] **REQ-AUDIT-01** · Migración 009 — `audit_log` + triggers AFTER INSERT/UPDATE/DELETE en `patients` y `appointments`
- [x] **REQ-GDPR-01** · `api-gdpr-export.json` — export JSON por paciente (admin o psicólogo propietario, 404 anti-enumeración)
- [x] **REQ-BACKUP-01** · `backup.sh` — `pg_restore --list` verify + `PGPASSWORD` + sin doble compresión
- [x] **REQ-MONITOR-01** · `infrastructure/monitoring/railway-health-check.sh` — polling cada 60s, alerta webhook en 3 fallos consecutivos

### Sprint 7a — Multi-tenant Auth + Tenant Isolation (2026-05-08) — [PR #101](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/101) [PR #102](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/pull/102) — v1.7.0
- [x] **REQ-AUTH-01** · `api-auth-login.json` — auth DB-backed con pgcrypto `crypt()`, JWT embebe `psychologist_id` + `role` ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-AUTH-02** · Cuenta inactiva → 403; credenciales inválidas → 401 (nodo `IF - User Active` separado) ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-TENANT-01** · `api-appointments.json` + `api-create-appointment.json` — filtro `AND psychologist_id = $N::uuid` ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-TENANT-02** · `api-patients.json` + `api-patient-detail.json` + `api-create-patient.json` — filtro tenant ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-TENANT-03** · `api-stats.json` — KPIs y weekly stats filtrados por `psychologist_id` del JWT ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-MIGRATION-01** · Migración 008 — `role` + `is_active` en tabla `psychologists` (idempotente) ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))
- [x] **REQ-RATELIMIT-01** · nginx `limit_req_zone` — 10r/s API general, 1r/12s auth (anti-brute-force) ([#103](https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda/issues/103))

---

## ✅ Issues cerrados (verificados como resueltos 2026-05-08)

### Dashboard
- [x] **M-01** · `tsconfig.json jsx: "react-jsx"` — ya correcto
- [x] **L-05** · Botones CTA con `href` — ya presentes en LandingPage.tsx

### Infraestructura / DevOps
- [x] **M-06** · `update_updated_at()` — solo una definición en `init-db.sql` (línea 399)
- [x] **M-07** · `prognosis` minúscula en `init-db.sql` — ya correcto
- [x] **M-09** · `bot-compose.yml` — `DATABASE_URL` y `DEFAULT_PSYCHOLOGIST_ID` presentes (hotfix)
- [x] **M-12** · `backup.sh` — `PGPASSWORD` presente (Sprint 7b)
- [x] **M-13** · `backup.sh` — solo `-Fc`, sin gzip (Sprint 7b)
- [x] **L-09** · `bot-compose.yml` — sin `network_mode: host`

### Deuda técnica
- [x] **L-02** · `registrationSimpleFlow`/`newPatientKeywordFlow` — no existen en bot/src
- [x] **L-03** · `consentFlow`/`dataRequestFlow` — no registrados (eliminados del codebase)
- [x] **L-07** · Carácter cirílico `оператор` — no presente en ningún archivo
- [x] **L-01** · `.env.template` — `GOOGLE_SHEET_ID`, `NOTIFICATION_EMAIL` y `ALERT_WEBHOOK_URL` presentes

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
| Bot WhatsApp | ✅ Funcional | Booking + cancelación + FAQ + RAG psicoeducación + PHQ-9 triage conversacional |
| AI Layer | ✅ Operativo | GPT-4o (aiService) + RAG pgvector (ragService) + Triage PHQ-9 (triageService); 45 PDFs → 2 616 chunks indexados |
| n8n API | ✅ Funcional | APIs CRUD OK; tenant isolation + DB-backed auth (Sprint 7a) |
| Dashboard | ✅ Funcional | Auth server-side JWT, HC, paginación OK |
| PostgreSQL | ✅ Estable | Schema completo, migraciones 001-014 trackeadas; pgvector + knowledge_embeddings + triage_assessments |
| CI/CD | ✅ Verde | 3 imágenes Docker Hub, Railway auto-deploy; Docker tags válidos en PRs (W21) |
| Automatizaciones | ✅ Funcional | Workflows activos, bugs n8n resueltos Sprint 6a |
| Seguridad | ✅ Production-ready | JWT + tenant isolation + rate limiting + RBAC + audit + GDPR + OWASP audit (Phase 5) |
| Compliance | ✅ Implementado | LFPDPPP/Ley1581/RGPD implementados; HIPAA parcial (Phase 6: cifrado en reposo) |
| Documentación | ✅ Completo | DR runbook, pentest guide, onboarding, monitoring, launch checklist |
| Tests | ✅ 68 tests | 15 dashboard (AuthContext + AdminGuard + PsychologistsPage + CompliancePage) + 53 bot (aiService + ragService + triageService + distressDetector + utils) |
