# Security Audit — OWASP Top 10

**Fecha:** 2026-05-08  
**Tarea:** 5.17 — Security Audit OWASP Top 10  
**Sprint:** Phase 5 W19

---

## Resumen ejecutivo

| # | Vulnerabilidad | Estado | Severidad |
|---|---------------|--------|-----------|
| A01 | Broken Access Control | ✅ Mitigado | — |
| A02 | Cryptographic Failures | ⚠️ Parcial | Media |
| A03 | Injection | ✅ Mitigado | — |
| A04 | Insecure Design | ✅ Mitigado | — |
| A05 | Security Misconfiguration | ⚠️ Parcial | Baja |
| A06 | Vulnerable Components | ⚠️ Verificar | Media |
| A07 | Auth & Session Failures | ✅ Mitigado | — |
| A08 | Software Integrity Failures | ✅ Mitigado | — |
| A09 | Logging & Monitoring Failures | ✅ Mitigado | — |
| A10 | SSRF | ✅ N/A | — |

---

## A01 — Broken Access Control ✅

**Control:** Multi-tenant isolation por `psychologist_id` en TODAS las queries n8n.  
**Verificación:** Todos los webhooks validan JWT y filtran `WHERE psychologist_id = $jwt_id`.  
**AdminGuard:** Rutas `/admin/*` protegidas en frontend + backend.

```sql
-- Patrón correcto en todos los endpoints n8n:
WHERE psychologist_id = '{{ $json.psychologist_id }}'
AND deleted_at IS NULL
```

**Hallazgo:** Sin brechas conocidas.

---

## A02 — Cryptographic Failures ⚠️

**Implementado:**
- Contraseñas con bcrypt (`gen_salt('bf')`)
- JWT HS256 con secreto de 32+ caracteres
- TLS en tránsito (Railway)

**Brecha conocida:**
- `audit_log.old_data` y `new_data` contienen PII sin cifrar → Phase 6
- Campos PII en `patients` sin cifrado en reposo → Phase 6

**Acción inmediata:** Verificar que `JWT_SECRET` tiene al menos 32 caracteres:
```bash
echo -n "$JWT_SECRET" | wc -c
# Debe retornar >= 32
```

---

## A03 — Injection ✅

**Control:** n8n usa queries parametrizadas con `$1`, `$2`, etc. para TODOS los inputs de usuario.

```json
{
  "query": "SELECT * FROM patients WHERE psychologist_id = $1 AND id = $2",
  "queryReplacement": "={{ $json.psychologist_id }},{{ $json.patient_id }}"
}
```

**Verificación:** No hay concatenación de strings en queries SQL.  
**XSS:** React escapa automáticamente en JSX. No se usa `dangerouslySetInnerHTML`.

**Hallazgo:** Sin brechas conocidas.

---

## A04 — Insecure Design ✅

**Validaciones de negocio:**
- No se pueden crear citas en horario fuera del schedule del psicólogo
- `psychologist_id` siempre viene del JWT, nunca del body de la request
- Retención configurable por psicólogo (`retention_years`), no por paciente

**Hallazgo:** Sin brechas conocidas.

---

## A05 — Security Misconfiguration ⚠️

**Implementado:**
- Variables de entorno en Railway Vault (no hardcoded en código)
- `.env.template` en git, `.env` en `.gitignore`
- Default admin password `admin123` — **DEBE CAMBIARSE en producción**

**Acción requerida antes de producción:**
```bash
# 1. Cambiar contraseña del admin por defecto
# Dashboard → Configuración → Cambiar contraseña

# 2. Verificar que .env no está en git
git log --all --full-history -- .env  # No debe retornar nada

# 3. Verificar cabeceras de seguridad HTTP
curl -I https://your-app.railway.app | grep -E 'X-Frame|X-Content|Strict|Content-Security'
```

**Cabeceras a agregar en Phase 6:** `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Content-Security-Policy`.

---

## A06 — Vulnerable Components ⚠️

**Acción:** Ejecutar auditoría de dependencias antes del launch:

```bash
# Frontend
cd dashboard && pnpm audit

# Revisar alertas de GitHub Dependabot
gh api repos/ipproyectosysoluciones/Asistente-Psicologico-Agenda/vulnerability-alerts
```

**Estado actual:** GitHub Dependabot reporta 2 vulnerabilidades en la rama main (high severity). **Resolver antes del launch.**

---

## A07 — Authentication & Session Management Failures ✅

**Implementado:**
- JWT con expiración configurada
- Inactividad timeout: 60 min en frontend (`INACTIVITY_MS`)
- `sessionStorage` (no `localStorage`) — se limpia al cerrar pestaña
- Logout invalida token del lado cliente; servidor valida expiración del JWT

**Hallazgo:** Sin brechas conocidas.

---

## A08 — Software & Data Integrity Failures ✅

**Verificación:**
- GitHub Actions CI valida builds antes de deploy a Railway
- `pnpm-lock.yaml` en git — dependencias determinísticas
- n8n workflows en JSON versionado en git

**Hallazgo:** Sin brechas conocidas.

---

## A09 — Security Logging & Monitoring Failures ✅

**Implementado:**
- `audit_log` registra TODAS las operaciones CRUD con `old_data`/`new_data`
- Logs de Railway disponibles en tiempo real
- CRON de retención genera log de ejecución en n8n

**Mejora recomendada Phase 6:** Alertas automáticas ante rate de errores elevado o logins fallidos repetidos.

---

## A10 — SSRF ✅ N/A

La aplicación no hace fetch a URLs proporcionadas por usuarios. Los webhooks n8n sólo consumen URLs internas (PostgreSQL, internal services).

---

## Acciones pendientes antes de launch

| Prioridad | Acción |
|-----------|--------|
| 🔴 Alta | Cambiar contraseña admin por defecto |
| 🔴 Alta | Resolver 2 vulnerabilidades Dependabot (A06) |
| 🟡 Media | Agregar cabeceras HTTP de seguridad (A05) |
| 🟡 Media | Rotar `JWT_SECRET` en producción |
| 🟢 Baja | Cifrado en reposo para PII (Phase 6) |
| 🟢 Baja | Purga de PII en audit_log (Phase 6) |
