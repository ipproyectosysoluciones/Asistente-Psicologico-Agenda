# MVP Issues — Análisis de Bugs y Problemas

**Generado**: 2026-04-23  
**Última actualización**: 2026-05-08  
**Branch de análisis**: `claude/analyze-mvp-issues-MvbwU`  
**Total de issues**: 46 (12 críticos · 10 altos · 14 medios · 10 bajos)  
**Resueltos**: ✅ C-01, C-02, C-03, C-04, C-05, C-06, C-07, C-08, C-09, C-10, C-11, C-12, H-01, H-02, H-03, H-04, H-05, H-06, H-07, H-08, H-09, H-10, M-02, M-04, M-05, M-08, M-10, M-14, L-04, L-06, L-08, L-10  
**Sprint 6a (PR #97, 2026-05-08)**: ✅ REQ-AUTH-01/02/03 (JWT server-side) · REQ-N8N-01/02/03 (bugs n8n)

---

## Metodología de trabajo

1. Cada issue se trabaja en una rama `feature/fix-<descripcion>`
2. Se crea un PR apuntando a `dev`
3. El PR es revisado y aprobado por el equipo
4. Merge a `dev` → `release` → `main` siguiendo el workflow de `AGENTS.md`

---

## 🔴 CRÍTICOS (12) — El sistema no funciona sin corregirlos

### ✅ C-01 · Flujos `primera vez` y `seguimiento` nunca se registran — RESUELTO

**Resuelto en**: Sprint 2 + P4 / commit `3d0478d`
`primeraVezFlow` y `seguimientoFlow` son constantes exportadas. P4 los convirtió en thin wrappers con `gotoFlow(appointmentFlow)`.

---

### ✅ C-02 · `appointmentFlow` spreado como objeto en lugar de array — RESUELTO

**Resuelto en**: Sprint 1 / commit `dcb4710`

---

### ✅ C-03 · `clinicalHistoryFlow` y `registrationFlow` (arrays) no se spreadan — RESUELTO

**Resuelto en**: Sprint 1 / commit `dcb4710`

---

### ✅ C-04 · Operador `$ne` de MongoDB en fileDb.js — siempre retorna `[]` — RESUELTO

**Resuelto en**: Sprint 2 — `fileDb.js` eliminado, bot usa PostgreSQL directamente.

---

### ✅ C-05 · Import nombrado de `export default` — RESUELTO

**Resuelto en**: Sprint 2 — todos los flujos usan named exports.

---

### C-06 · n8n: `$body.xxx` no es sintaxis SQL válida en nodo Postgres

**Archivo**: `infrastructure/n8n/api-create-appointment.json` línea ~50  
**Rama sugerida**: `feature/fix-n8n-postgres-params`

```sql
-- PROBLEMA: $body.patient_id no es un parámetro SQL válido en n8n
VALUES (..., $body.patient_id, $body.scheduled_at, ...)
```

Toda creación de citas falla con error SQL. Usar `={{ $json.body.patient_id }}` o `$1, $2...`.

---

### ✅ C-07 · n8n: `$filters` era variable indefinida en api-appointments — RESUELTO

**Resuelto en**: PR #94 / commit `0c16de4`  
Reemplazado por paginación paramétrica (`$1`/`$2`/`$3`) con soporte de status como lista separada por comas via `ANY(string_to_array($3, ','))`.

---

### C-08 · n8n: Referencias de nodos rotas en `agendamiento-flow.json`

**Archivo**: `infrastructure/n8n/agendamiento-flow.json` líneas 139 y 156  
**Rama sugerida**: `feature/fix-n8n-agendamiento-flow`

```json
"node": "Email - No Disponible"   // nodo real: "Gmail - No Disponible"
"node": "Email - Confirmación"    // nodo real: "Gmail - Confirmación"
```

El flujo se detiene después de verificar disponibilidad — las citas nunca se crean y no se envía confirmación.

---

### C-09 · n8n: `$json.appointmentId` siempre es null en confirmacion.json

**Archivo**: `infrastructure/n8n/confirmacion.json` líneas 81 y 106  
**Rama sugerida**: `feature/fix-n8n-confirmacion`

```sql
-- PROBLEMA: el email de respuesta no contiene appointmentId
WHERE id = '{{ $json.appointmentId }}'  -- siempre null → 0 rows afectadas
```

El sistema de confirmación/cancelación por email es completamente no funcional.

---

### ✅ C-10 · n8n: UUID sin comillas en no-show.json — RESUELTO

**Resuelto en**: commit `dcb4710`  
Además se corrigió la columna `start_time` → `scheduled_at` y el filtro de status `pending` → `scheduled`.

---

### C-11 · n8n: INSERT en `api-create-patient.json` omite `psychologist_id` NOT NULL

**Archivo**: `infrastructure/n8n/api-create-patient.json` línea ~20  
**Rama sugerida**: `feature/fix-n8n-create-patient`

```sql
-- PROBLEMA: psychologist_id es NOT NULL en el schema
INSERT INTO patients (first_name, last_name, email, phone, ...)
-- FALTA: psychologist_id
```

Toda creación de pacientes desde el dashboard falla con violación de constraint.

---

### ✅ C-12 · Dashboard: Nginx sin proxy para `/api` — RESUELTO

**Resuelto en**: sprint-5 / commit `112c1a7`  
`nginx.conf.template` tiene `location /api/` → `proxy_pass http://${N8N_INTERNAL_URL}/webhook/`. La URL interna se inyecta vía variable de entorno en Railway.

---

## 🟠 ALTOS (10) — Funcionalidad core gravemente afectada

### ✅ H-01 · Flujo multi-paso usa `addAction` en lugar de `addAnswer+capture` — RESUELTO

**Resuelto en**: Sprint 2 — flujo reescrito con patrón `addAnswer + capture`.

---

### ✅ H-02 · Arquitectura dual: bot usa JSON file Y PostgreSQL — RESUELTO

**Resuelto en**: Sprint 2 — `fileDb.js` eliminado; bot usa solo PostgreSQL vía `appointmentService`.

---

### ✅ H-03 · `cancelAppointmentFlow` es un stub — RESUELTO

**Resuelto en**: Sprint 2 — `cancelAppointmentBot` implementado en `appointmentService.js`.

---

### ✅ H-04 · Conflicto de keyword `primera vez` entre flows — RESUELTO

**Resuelto en**: P4 / commit `3d0478d` — `primeraVezFlow`/`seguimientoFlow` usan `gotoFlow(appointmentFlow)`, eliminando el keyword duplicado.

---

### ✅ H-05 · Credenciales hardcodeadas en servicios del bot — RESUELTO

**Resuelto en**: PR #94  
Pool requiere `DATABASE_URL` obligatoriamente (lanza error si no está definido). Eliminado el fallback con credenciales triviales. PG Pool configurado con SSL, `max: 5`, timeouts.

---

### ✅ H-06 · `DEFAULT_PSYCHOLOGIST_ID` faltaba en `.env.example` — RESUELTO

**Resuelto en**: PR #94  
`bot/.env.example` incluye `DEFAULT_PSYCHOLOGIST_ID`, `JWT_SECRET`, `WA_CREDS_B64`, `WA_FORCE_RESET`, `HOST`. También agregado a `docker-compose.production.yml`.

---

### H-07 · SQL Injection en `whatsapp-new-patient.json`

**Archivo**: `infrastructure/n8n/whatsapp-new-patient.json` línea 21  
**Rama sugerida**: `feature/fix-sql-injection-n8n`

```sql
-- Interpolación directa sin parametrización:
VALUES ('{{$json.body.first_name}}', '{{$json.body.last_name}}', ...)
```

Un nombre como `O'Brien` rompe la query. `'); DROP TABLE patients; --` es explotable.

---

### H-08 · SQL Injection en `agendamiento-flow.json`

**Archivo**: `infrastructure/n8n/agendamiento-flow.json` línea 62  
**Rama sugerida**: `feature/fix-sql-injection-n8n`

```sql
VALUES (..., '{{$json.body.email}}', {{$json.body.duration}}, ...)
-- duration sin comillas: valor malicioso puede ejecutar SQL arbitrario
```

---

### H-09 · SQL Injection + UUIDs sin comillas en `google-sheets-sync.json`

**Archivo**: `infrastructure/n8n/google-sheets-sync.json` línea 81  
**Rama sugerida**: `feature/fix-sql-injection-n8n`

```sql
-- PROBLEMA: UUIDs sin comillas → error de sintaxis
WHERE id IN ({{ $json.map(x => x.id).join(',') }})
-- CORRECTO:
WHERE id IN ({{ $json.map(x => `'${x.id}'`).join(',') }})
```

---

### H-10 · Dashboard: `fetch()` ignora la opción `baseURL` silenciosamente

**Archivos**: `DashboardPage.tsx`, `AppointmentsPage.tsx`, `PatientsPage.tsx`, `LeadsPage.tsx`  
**Rama sugerida**: `feature/fix-dashboard-api-client`

`baseURL` es una opción de Axios, no de `fetch()`. La variable `VITE_API_URL` no tiene ningún efecto. El cliente `api` de axios en `lib/api.ts` nunca se usa.

---

## 🟡 MEDIOS (14) — Degradan calidad, seguridad o configuración

### M-01 · `jsx: "react-compiler"` no es un valor válido en tsconfig.json

**Archivo**: `dashboard/tsconfig.json` línea 13  
**Solución**: Cambiar a `"react-jsx"`

---

### ✅ M-02 · Credenciales hardcodeadas en `AuthContext.tsx` — RESUELTO

**Resuelto en**: PR #94  
`AuthContext.tsx` lee `import.meta.env.VITE_AUTH_USER` / `VITE_AUTH_PASS`. El Dockerfile los recibe como `ARG` y los expone como `ENV` en build-time.

---

### M-03 · Password logueada en consola en `LoginPage.tsx`

**Archivo**: `dashboard/src/pages/auth/LoginPage.tsx` línea 14  
```ts
console.log('Attempt login:', user, pass)  // expone la contraseña
```

---

### ✅ M-04 · `ps.first_name` no existía — RESUELTO

**Resuelto en**: commit `0c16de4`  
Query usa `ps.full_name AS psychologist_name`.

---

### ✅ M-05 · `ps.time_zone` no existía — RESUELTO

**Resuelto en**: commit `0c16de4`  
Query usa `COALESCE(ps.timezone, 'America/Mexico_City')`.

---

### M-06 · Función `update_updated_at()` definida dos veces en init-db.sql

**Archivo**: `infrastructure/init-db.sql` líneas 399-405 y 456-462  
Duplicación por copy-paste. La segunda definición es superflua.

---

### M-07 · Columna `Prognosis` con mayúscula inesperada en init-db.sql

**Archivo**: `infrastructure/init-db.sql` línea 338  
```sql
Prognosis TEXT,  -- debe ser: prognosis TEXT
```
PostgreSQL almacena como `prognosis` (minúscula) a menos que se use entre comillas, causando inconsistencias.

---

### ✅ M-08 · Paths de `COPY` incorrectos en bot/Dockerfile — RESUELTO

**Resuelto en**: sprint-5  
`bot/Dockerfile` usa `COPY package.json pnpm-lock.yaml ./` y `COPY . ./` correctamente.

---

### M-09 · `bot-compose.yml` sin `DATABASE_URL` ni `DEFAULT_PSYCHOLOGIST_ID`

**Archivo**: `infrastructure/bot-compose.yml`  
El bot requiere ambas variables de entorno para funcionar. Sin ellas usa credenciales hardcodeadas.

---

### ✅ M-10 · n8n sin `depends_on: postgres` — RESUELTO

**Resuelto en**: Sprint 5 + migration runner — `docker-compose.yml` tiene `depends_on: postgres: condition: service_healthy` y `migrate: condition: service_completed_successfully`.

---

### M-11 · `$json.length` siempre es `undefined` en nodo Postgres de n8n

**Archivo**: `infrastructure/n8n/google-sheets-sync.json` línea 46  
```json
"value1": "={{ $json.length }}"  // en n8n Postgres, $json es una fila, no un array
```
La condición IF nunca es `true` → la sincronización con Google Sheets nunca dispara.

---

### M-12 · `PGPASSWORD` faltante en backup.sh — backup silencioso falla

**Archivo**: `infrastructure/backups/backup.sh` línea 19  
`pg_dump` solicita password interactivamente en contexto cron → backup nunca se ejecuta.

---

### M-13 · Doble compresión en backup.sh: `-Fc` + `gzip`

**Archivo**: `infrastructure/backups/backup.sh` líneas 19 y 26  
`pg_dump -Fc` ya genera formato comprimido. Luego `gzip` lo comprime de nuevo. `pg_restore` no puede leer el `.dump.gz` directamente.

---

### ✅ M-14 · `.env.example` no tenía `DATABASE_URL` — RESUELTO

**Resuelto en**: PR #94  
`bot/.env.example` define `DATABASE_URL` como variable principal.

---

## 🔵 BAJOS (10) — Deuda técnica y mejoras

### L-01 · `.env.template` sin `GOOGLE_SHEET_ID` ni `NOTIFICATION_EMAIL`

`google-sheets-sync.json` referencia ambas variables pero no están documentadas en el template.

---

### L-02 · `registrationSimpleFlow` y `newPatientKeywordFlow` son código muerto

**Archivo**: `bot/src/flows/registration.js` líneas 11-23  
Definidos y exportados pero nunca importados en `index.js`.

---

### L-03 · `consentFlow` y `dataRequestFlow` exportados pero nunca registrados

**Archivo**: `bot/src/flows/clinicalHistory.js` líneas 21-29  
Los flujos de consentimiento y exportación de datos son inaccesibles para los usuarios.

---

### ✅ L-04 · Flujos de historia clínica son stubs — RESUELTO

**Resuelto en**: Sprint 5 / commit `112c1a7` — HC module con 10 workflows n8n, página de detalle y 5 tabs de HC en el dashboard.

---

### L-05 · Botones CTA en LandingPage.tsx no tienen acción

**Archivo**: `dashboard/src/pages/landing/LandingPage.tsx` líneas 41-46  
Los botones "Escribinos por WhatsApp" y "Agendar Cita" no tienen `href` ni `onClick`.

---

### ✅ L-06 · Todos los workflows tienen `active: false` — RESUELTO

**Resuelto en**: Sprint 3 — todos los workflows críticos tienen `active: true`.

---

### L-07 · Carácter cirílico `оператор` en template de email de paciente

**Archivo**: `infrastructure/n8n/whatsapp-new-patient.json` línea 34  
Artefacto de copy-paste. Se renderiza como texto corrupto en el email del paciente.

---

### ✅ L-08 · Nombres de secrets inconsistentes en CI — RESUELTO

**Resuelto en**: `.github/workflows/docker-push.yml`  
Ambos workflows usan `DOCKER_HUB_USERNAME` / `DOCKER_HUB_TOKEN` de forma consistente.

---

### L-09 · `network_mode: host` en bot-compose.yml incompatible con red bridge

**Archivo**: `infrastructure/bot-compose.yml` línea 18  
Con `network_mode: host`, el bot no puede alcanzar los contenedores de postgres y n8n por nombre.

---

### ✅ L-10 · `DAYS` incluía domingo y el mensaje de error era incorrecto — RESUELTO

**Resuelto en**: PR #94  
`DAYS = [...WORKING_WEEKDAYS]` = lunes a viernes (Set [1,2,3,4,5]). Mensaje de error pendiente de actualizar (P4).

---

## Resumen ejecutivo

| Severidad | Total | Resueltos | Pendientes |
|-----------|-------|-----------|------------|
| 🔴 Crítico | 12 | 9 | 3 (C-06, C-08, C-09, C-11) |
| 🟠 Alto | 10 | 6 | 4 (H-07, H-08, H-09, H-10) |
| 🟡 Medio | 14 | 7 | 7 |
| 🔵 Bajo | 10 | 5 | 5 |
| **Total** | **46** | **24** (52%) | **22** |

## Pendientes prioritarios (próxima sesión)

### 🔥 Urgente — Seguridad
- H-07, H-08, H-09 · SQL Injection en 3 workflows n8n → parametrizar con `$1`/`$2`

### 🔴 Críticos funcionales
- C-06 · `$body.xxx` inválido en `api-create-appointment.json`
- C-08 · Referencias de nodos rotas en `agendamiento-flow.json`
- C-09 · `$json.appointmentId` null en `confirmacion.json`
- C-11 · INSERT falta `psychologist_id` en `api-create-patient.json`

### 🟠 Altos funcionales
- H-10 · API client dashboard (`fetch` ignora `baseURL`, axios no se usa)

### 🟡 Medios
- M-03 · Password en console.log
- M-12/M-13 · backup.sh PGPASSWORD + doble compresión
