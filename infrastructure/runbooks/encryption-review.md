# Encryption Review — Asistente Psicológico

**Fecha:** 2026-05-08  
**Tarea:** 5.13 — Revisión de cifrado en campos sensibles  
**Sprint:** Phase 5 W18

---

## 1. Cifrado en tránsito

| Capa | Estado | Implementación |
|------|--------|----------------|
| HTTPS | ✅ Activo | Railway fuerza TLS 1.2+ en todos los dominios de producción |
| n8n webhooks | ✅ Activo | Servicio Railway; mismo TLS |
| DB connection | ✅ Activo | `DATABASE_URL` con `sslmode=require` en Railway PostgreSQL |
| JWT | ✅ Activo | HS256, token en `sessionStorage` (no `localStorage`), expiración configurable |

## 2. Cifrado en reposo

### 2.1 Contraseñas

```sql
-- psychologists.password_hash usa bcrypt via pgcrypto
password_hash = crypt(plain_password, gen_salt('bf'))
-- Verificación:
crypt(input, password_hash) = password_hash
```

**Estado:** ✅ Implementado correctamente — `gen_salt('bf')` genera sal única por contraseña.

### 2.2 Campos PII en `patients`

| Campo | Cifrado en DB | Notas |
|-------|--------------|-------|
| `first_name` | ❌ Plaintext | Sensible — candidato a cifrado de columna (Phase 6) |
| `last_name` | ❌ Plaintext | Sensible |
| `email` | ❌ Plaintext | Sensible; UNIQUE constraint impide cifrado directo |
| `phone` | ❌ Plaintext | Sensible |
| `date_of_birth` | ❌ Plaintext | Sensible |
| `consent_status` | ❌ Plaintext | No sensible |

**Mitigación actual:** Soft-delete + anonimización en CRON de retención (`first_name/last_name = 'REDACTED'`, `email/phone = NULL`).

### 2.3 Historia Clínica (HC)

Los 12 tablas de HC contienen texto clínico sensible (`complaint_text`, `medical_conditions`, etc.) almacenados como `TEXT` plaintext.

**Estado:** ❌ Sin cifrado a nivel de columna.  
**Mitigación:** Acceso restringido a nivel de aplicación (JWT + multi-tenant isolation por `psychologist_id`).

### 2.4 `audit_log`

```sql
-- audit_log.old_data y new_data son JSONB — contienen PII completo
old_data JSONB,
new_data JSONB
```

**Brecha conocida:** PII de pacientes anonimizados persiste en `audit_log` indefinidamente. Documentado para Phase 6.

---

## 3. Recomendaciones Phase 6

### 3.1 Cifrado a nivel de columna (pgcrypto)

```sql
-- Opción: cifrar columnas PII con clave derivada del psychologist_id
-- Requiere clave maestra en Railway secrets
UPDATE patients
SET email = encode(encrypt(email::bytea, $master_key, 'aes'), 'base64')
WHERE ...;
```

**Consideración:** El constraint `UNIQUE(psychologist_id, email)` es incompatible con cifrado determinístico. Requiere hash de búsqueda separado.

### 3.2 Rotación de audit_log PII

Migración Phase 6: purgar `old_data`/`new_data` de filas cuyo `record_id` corresponda a pacientes con `deleted_at IS NOT NULL`.

### 3.3 Vault para secretos

Migrar `JWT_SECRET` y `DATABASE_URL` a Railway Vault o HashiCorp Vault cuando el proyecto escale a equipo.

---

## 4. Inventario de secretos actuales

| Variable | Almacén | Rotación |
|----------|---------|----------|
| `JWT_SECRET` | Railway env vars | Manual; rotar cada 90 días |
| `DATABASE_URL` | Railway env vars | Automático al recrear DB |
| `N8N_ENCRYPTION_KEY` | Railway env vars | Manual |
| `ALERT_WEBHOOK_URL` | Railway env vars | Por proveedor |
