# MVP Issues — Análisis de Bugs y Problemas

**Generado**: 2026-04-23  
**Branch de análisis**: `claude/analyze-mvp-issues-MvbwU`  
**Total de issues**: 46 (12 críticos · 10 altos · 14 medios · 10 bajos)

---

## Metodología de trabajo

1. Cada issue se trabaja en una rama `feature/fix-<descripcion>`
2. Se crea un PR apuntando a `dev`
3. El PR es revisado y aprobado por el equipo
4. Merge a `dev` → `release` → `main` siguiendo el workflow de `AGENTS.md`

---

## 🔴 CRÍTICOS (12) — El sistema no funciona sin corregirlos

### C-01 · Flujos `primera vez` y `seguimiento` nunca se registran

**Archivo**: `bot/src/flows/appointment.js` líneas 15 y 132  
**Rama sugerida**: `feature/fix-appointment-flow-registration`

```js
// PROBLEMA: resultado descartado, nunca exportado
addKeyword('primera vez').addAction(...)
addKeyword('seguimiento').addAction(...)
```

Todo el wizard de agendamiento multi-paso es **código muerto**. Los usuarios que presionen esos botones no reciben respuesta.

**Solución**: Asignar a constantes exportadas e incluirlas en `createFlow()`.

```js
export const primeraVezFlow = addKeyword('primera vez').addAction(...)
export const seguimientoFlow = addKeyword('seguimiento').addAction(...)
```

---

### C-02 · `appointmentFlow` spreado como objeto en lugar de array

**Archivo**: `bot/src/index.js` línea 64  
**Rama sugerida**: `feature/fix-createflow-spread`

```js
// PROBLEMA: appointmentFlow es un objeto único, no un array
...appointmentFlow,
```

Hacer spread de un objeto plano en un array literal itera las claves del objeto, no los pasos del flujo.

**Solución**: `appointmentFlow,` (sin spread) o convertirlo en array.

---

### C-03 · `clinicalHistoryFlow` y `registrationFlow` (arrays) no se spreadan

**Archivo**: `bot/src/index.js` líneas 69-70  
**Rama sugerida**: `feature/fix-createflow-spread`

```js
// PROBLEMA: son arrays pero se pasan sin spread
clinicalHistoryFlow,
registrationFlow
```

`createFlow()` recibe arrays anidados → flujos de historia clínica y registro no funcionan.

**Solución**: `...clinicalHistoryFlow, ...registrationFlow`

---

### C-04 · Operador `$ne` de MongoDB en fileDb.js — siempre retorna `[]`

**Archivo**: `bot/src/services/fileDb.js` líneas 113-118  
**Rama sugerida**: `feature/fix-filedb-query`

```js
// PROBLEMA: find() hace item[k] === v, entonces $ne nunca matchea
const appointments = await jsonDb.find('appointments', {
    patientId,
    status: { $ne: 'cancelled' }  // siempre false
})
```

`getAppointments()` siempre retorna `[]`.

**Solución**:
```js
const all = await jsonDb.findAll('appointments')
return all.filter(a => a.patientId === patientId && a.status !== 'cancelled')
```

---

### C-05 · Import nombrado de `export default` — `appointmentFlow` es `undefined`

**Archivos**: `bot/src/flows/appointment.js` línea 257 · `bot/src/index.js` línea 7  
**Rama sugerida**: `feature/fix-appointment-exports`

```js
// appointment.js — solo export default:
export default appointmentFlow

// index.js — import nombrado (retorna undefined en ES Modules):
import { appointmentFlow } from './flows/appointment.js'
```

**Solución**: Cambiar a exports nombrados en `appointment.js` o ajustar el import.

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

### C-07 · n8n: `$filters` es una variable indefinida en api-appointments

**Archivo**: `infrastructure/n8n/api-appointments.json` línea ~20  
**Rama sugerida**: `feature/fix-n8n-postgres-params`

```sql
-- PROBLEMA: $filters no existe en n8n
AND ($filters.status IS NULL OR a.status = $filters.status)
```

El listado de citas del dashboard falla en runtime.  
**Solución**: Usar `{{ $json.query.status }}`.

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

### C-10 · n8n: UUID sin comillas en no-show.json — error SQL garantizado

**Archivo**: `infrastructure/n8n/no-show.json` línea 36  
**Rama sugerida**: `feature/fix-n8n-noshow`

```sql
-- PROBLEMA: UUID sin comillas → error de sintaxis SQL
WHERE id = {{ $json.id }}
-- CORRECTO:
WHERE id = '{{ $json.id }}'
```

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

### C-12 · Dashboard: Nginx en producción no tiene proxy para `/api`

**Archivo**: `dashboard/Dockerfile` líneas 22-42  
**Rama sugerida**: `feature/fix-dashboard-nginx-proxy`

El config de nginx solo sirve archivos estáticos. No hay `location /api { proxy_pass http://n8n:5678; }`.  
En producción, todas las llamadas API retornan 404. El proxy de Vite solo funciona en desarrollo.

---

## 🟠 ALTOS (10) — Funcionalidad core gravemente afectada

### H-01 · Flujo multi-paso usa `addAction` en lugar de `addAnswer+capture`

**Archivo**: `bot/src/flows/appointment.js` líneas 15-130  
**Rama sugerida**: `feature/fix-appointment-capture-flow`

En BuilderBot, los pasos `addAction` encadenados se ejecutan todos en el mismo mensaje trigger, no secuencialmente. Se requiere `.addAnswer(..., { capture: true }).addAction(...)` para captura paso a paso.

---

### H-02 · Arquitectura dual: bot usa JSON file Y PostgreSQL para pacientes

**Archivo**: `bot/src/flows/appointment.js` líneas 100-116  
**Rama sugerida**: `feature/fix-single-database-source`

El bot busca pacientes en `fileDb` (JSON) pero guarda citas en PostgreSQL. Si el paciente existe en PG pero no en el JSON, `patient?.id` es `undefined` → violación de NOT NULL en `appointments.patient_id`.

---

### H-03 · `cancelAppointmentFlow` es un stub — no cancela nada

**Archivo**: `bot/src/flows/appointment.js` líneas 251-255  
**Rama sugerida**: `feature/implement-cancel-appointment`

Captura el email pero no hace ninguna query. Envía mensaje de éxito falso al usuario.

---

### H-04 · Conflicto de keyword `primera vez` entre registration.js y appointment.js

**Archivos**: `bot/src/flows/registration.js` línea 18 · `bot/src/flows/appointment.js` línea 15  
**Rama sugerida**: `feature/fix-keyword-conflicts`

Dos flujos registran el mismo keyword. Comportamiento indefinido (generalmente gana el primero registrado). También hay conflicto con `'cancelar'` que puede activarse durante la confirmación.

---

### H-05 · Credenciales hardcodeadas `admin:admin` en servicios del bot

**Archivos**: `bot/src/services/appointmentService.js` línea 6 · `bot/src/services/knowledgeBase.js` línea 6  
**Rama sugerida**: `feature/fix-env-config`

```js
connectionString: process.env.DATABASE_URL || 'postgresql://admin:admin@localhost:5432/...'
```

Si `DATABASE_URL` no está definido, el bot se conecta con credenciales triviales. `.env.example` define variables individuales (`DB_HOST`, etc.) pero el código espera `DATABASE_URL`.

---

### H-06 · `DEFAULT_PSYCHOLOGIST_ID` no está en `.env.example`

**Archivo**: `bot/.env.example`  
**Rama sugerida**: `feature/fix-env-config`

El bot usa `process.env.DEFAULT_PSYCHOLOGIST_ID` en 3 lugares de `appointment.js` (líneas 65, 110, 191). Si no está definido, `psychologistId` es `undefined` → todas las queries fallan.

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

### M-02 · Credenciales hardcodeadas en `AuthContext.tsx`

**Archivo**: `dashboard/src/contexts/AuthContext.tsx` líneas 11-12  
```ts
const AUTH_USER = 'admin'
const AUTH_PASS = 'password'
```
Las variables de entorno `VITE_AUTH_USER`/`VITE_AUTH_PASS` de `docker-compose.production.yml` nunca se leen.

---

### M-03 · Password logueada en consola en `LoginPage.tsx`

**Archivo**: `dashboard/src/pages/auth/LoginPage.tsx` línea 14  
```ts
console.log('Attempt login:', user, pass)  // expone la contraseña
```

---

### M-04 · `ps.first_name` no existe — la columna es `full_name`

**Archivo**: `infrastructure/n8n/api-appointments.json` línea ~20  
```sql
ps.first_name AS psychologist_name  -- columna no existe
```
Schema `init-db.sql` línea 17 define `full_name VARCHAR(255)`.

---

### M-05 · `ps.time_zone` no existe — la columna es `timezone`

**Archivos**: `n8n/api-appointments.json`, `n8n/recordatorios.json`  
```sql
COALESCE(ps.time_zone, 'America/Mexico_City')  -- debe ser ps.timezone
```

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

### M-08 · Paths de `COPY` incorrectos en bot/Dockerfile

**Archivo**: `bot/Dockerfile` líneas 18 y 21  
```dockerfile
COPY bot/package.json bot/pnpm-lock.yaml ./  -- incorrecto con context: ../bot
COPY bot/ ./                                   -- incorrecto
```
Con `context: ../bot`, el contexto ya ES el directorio `bot/`. Debe ser `COPY package.json pnpm-lock.yaml ./`.

---

### M-09 · `bot-compose.yml` sin `DATABASE_URL` ni `DEFAULT_PSYCHOLOGIST_ID`

**Archivo**: `infrastructure/bot-compose.yml`  
El bot requiere ambas variables de entorno para funcionar. Sin ellas usa credenciales hardcodeadas.

---

### M-10 · n8n sin `depends_on: postgres` y webhook URL hardcodeado a `localhost`

**Archivo**: `infrastructure/docker-compose.yml` líneas 25-47  
n8n puede arrancar antes que postgres. `WEBHOOK_URL=http://localhost:5678` no es alcanzable desde servicios externos.

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

### M-14 · `.env.example` define vars individuales de DB pero el código lee `DATABASE_URL`

**Archivo**: `bot/.env.example`  
El developer que siga `.env.example` tendrá un bot no funcional porque el código solo lee `DATABASE_URL`.

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

### L-04 · Flujos de historia clínica son stubs sin lógica real

**Archivo**: `bot/src/flows/clinicalHistory.js` líneas 11-18  
"Completar Historia" dice que enviará un enlace por email (nunca sucede). "Ver mi información" no recupera datos reales.

---

### L-05 · Botones CTA en LandingPage.tsx no tienen acción

**Archivo**: `dashboard/src/pages/landing/LandingPage.tsx` líneas 41-46  
Los botones "Escribinos por WhatsApp" y "Agendar Cita" no tienen `href` ni `onClick`.

---

### L-06 · Todos los workflows de automatización tienen `active: false`

**Archivos**: `recordatorios.json`, `confirmacion.json`, `no-show.json`, `agendamiento-flow.json`, etc.  
Al importar en n8n, ningún workflow de automatización se activa automáticamente.

---

### L-07 · Carácter cirílico `оператор` en template de email de paciente

**Archivo**: `infrastructure/n8n/whatsapp-new-patient.json` línea 34  
Artefacto de copy-paste. Se renderiza como texto corrupto en el email del paciente.

---

### L-08 · Nombres de secrets de Docker Hub inconsistentes entre workflows CI

**Archivos**: `.github/workflows/bot-ci.yml` (`DOCKER_HUB_USERNAME`) vs `docker-push.yml` (`DOCKERHUB_USERNAME`)  
Un workflow fallará en autenticación con Docker Hub.

---

### L-09 · `network_mode: host` en bot-compose.yml incompatible con red bridge

**Archivo**: `infrastructure/bot-compose.yml` línea 18  
Con `network_mode: host`, el bot no puede alcanzar los contenedores de postgres y n8n por nombre.

---

### L-10 · Domingo incluido en horario pero el mensaje dice "no atendemos los lunes"

**Archivo**: `bot/src/services/appointmentService.js` líneas 23 y 166  
```js
export const DAYS = [1, 2, 3, 4, 5, 6, 0]  // 0 = domingo habilitado, 1 = lunes excluido
// Mensaje de error incorrecto:
return { valid: false, error: 'No atendemos los días lunes.' }
```

---

## Resumen ejecutivo

| Severidad | Cantidad | Área principal afectada |
|-----------|----------|------------------------|
| 🔴 Crítico | 12 | Bot flows, n8n queries, dashboard producción |
| 🟠 Alto | 10 | BuilderBot patterns, seguridad SQL, env config |
| 🟡 Medio | 14 | TypeScript, auth, Docker, backup, n8n |
| 🔵 Bajo | 10 | Stubs, código muerto, CI/CD, UX |
| **Total** | **46** | |

## Próximos pasos

1. Crear issue en GitHub por cada ítem de este documento
2. Asignar labels: `critical`, `high`, `medium`, `low` + `bug` / `security`
3. Priorizar los C-01 a C-05 (bot completamente no funcional) para Sprint 1
4. C-06 a C-12 (n8n y dashboard) para Sprint 2
5. H-07, H-08, H-09 (seguridad SQL injection) como hotfix urgente
