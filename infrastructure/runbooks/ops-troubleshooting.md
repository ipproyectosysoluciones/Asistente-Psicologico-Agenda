# Ops & Troubleshooting Runbook

**Fecha:** 2026-05-08  
**Tarea:** 5.20 — Ops/Troubleshooting Runbooks  
**Sprint:** Phase 5 W19

---

## 1. Diagnóstico rápido

```bash
# Estado general del proyecto
railway status

# Logs en tiempo real
railway logs --service <service-name> --tail 100

# Variables de entorno
railway variables --service <service-name>

# Estado de la DB
psql $DATABASE_URL -c "SELECT NOW(), COUNT(*) FROM patients WHERE deleted_at IS NULL;"
```

---

## 2. Problemas frecuentes

### 2.1 "Cannot connect to database"

**Síntomas:** Dashboard retorna 500, logs n8n muestran `connection refused` o `ECONNREFUSED`.

```bash
# Verificar DATABASE_URL en Railway
railway variables --service n8n | grep DATABASE_URL

# Probar conexión directa
psql $DATABASE_URL -c "SELECT 1;"

# Si Railway PostgreSQL está caído:
# → Railway dashboard → PostgreSQL service → Restart
```

**Causa más común:** Railway PostgreSQL reiniciado por mantenimiento; esperar ~2 min y reintentar.

---

### 2.2 "Token inválido / 401 en todas las llamadas"

**Síntomas:** Todos los usuarios ven "Sesión expirada" al instante.

```bash
# El JWT_SECRET puede haber cambiado o estar vacío
railway variables --service <service> | grep JWT_SECRET
# Si está vacío o cambió → todos los tokens anteriores son inválidos (correcto)

# Verificar que JWT_SECRET tiene >= 32 caracteres
railway variables --service <service> | grep JWT_SECRET | awk '{print length($NF)}'
```

**Solución:** Los usuarios deben hacer login nuevamente. No es un error — es la expiración normal o cambio de clave.

---

### 2.3 "CRON de retención no ejecutó"

**Síntomas:** Hay pacientes que deberían estar anonimizados pero sus datos siguen visibles.

```bash
# Verificar en n8n que el workflow está activo
# n8n UI → Workflows → CRON - Retention Policy Enforcement
# Si active: false → activarlo manualmente

# Revisar logs de ejecución en n8n
# n8n UI → Executions → filtrar por "CRON - Retention"
```

**Ejecución manual:**
```
n8n UI → CRON - Retention Policy Enforcement → Test workflow
```

---

### 2.4 "Dashboard carga en blanco / assets 404"

**Síntomas:** La URL de producción muestra pantalla en blanco, consola del browser muestra 404 en JS.

```bash
# Verificar que el build fue exitoso
railway logs --service dashboard | grep -E 'error|Error|failed'

# Si el deploy falló: Railway dashboard → Deployments → Rollback
```

**Causa más común:** Error de TypeScript o import path en el build. Verificar localmente:
```bash
cd dashboard && pnpm run build
```

---

### 2.5 "Paciente duplicado — constraint violation"

**Síntomas:** Error `duplicate key value violates unique constraint "unique_patient_per_psychologist"`.

```sql
-- Verificar pacientes duplicados para el mismo psicólogo
SELECT psychologist_id, email, COUNT(*)
FROM patients
WHERE deleted_at IS NULL
GROUP BY psychologist_id, email
HAVING COUNT(*) > 1;
```

**Solución:** El duplicado ocurrió por doble click o race condition. Soft-delete el registro más nuevo:
```sql
UPDATE patients
SET deleted_at = NOW()
WHERE id = '<id del duplicado más reciente>';
```

---

### 2.6 "Recordatorios de citas no se envían"

**Síntomas:** Pacientes reportan no recibir WhatsApp/notificaciones de recordatorio.

```bash
# 1. Verificar que los workflows de recordatorio están activos en n8n
# 2. Verificar ALERT_WEBHOOK_URL en Railway
railway variables --service n8n | grep WEBHOOK

# 3. Revisar executions del workflow de recordatorio
# n8n UI → Executions → filtrar por "reminder" o "recordatorio"
```

---

## 3. Queries de diagnóstico DB

```sql
-- Citas del día sin confirmar
SELECT a.scheduled_at, p.first_name, p.last_name, a.status
FROM appointments a
JOIN patients p ON p.id = a.patient_id
WHERE a.scheduled_at::date = CURRENT_DATE
  AND a.status = 'scheduled'
  AND a.deleted_at IS NULL
ORDER BY a.scheduled_at;

-- Pacientes próximos a vencer retención (próximos 30 días)
SELECT p.first_name, p.last_name,
  COALESCE(MAX(a.scheduled_at), p.created_at) + MAKE_INTERVAL(years => ps.retention_years) AS expires_at
FROM patients p
JOIN psychologists ps ON ps.id = p.psychologist_id
LEFT JOIN appointments a ON a.patient_id = p.id AND a.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.first_name, p.last_name, ps.retention_years
HAVING COALESCE(MAX(a.scheduled_at), p.created_at) + MAKE_INTERVAL(years => ps.retention_years)
  BETWEEN NOW() AND NOW() + INTERVAL '30 days'
ORDER BY expires_at;

-- Últimas 20 entradas de auditoría
SELECT table_name, operation, created_at
FROM audit_log
ORDER BY created_at DESC
LIMIT 20;

-- Tamaño de tablas
SELECT relname AS table, pg_size_pretty(pg_total_relation_size(relid)) AS size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Índices no usados (para cleanup Phase 6)
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename;
```

---

## 4. Comandos Railway frecuentes

```bash
# Ver todos los servicios del proyecto
railway service list

# Abrir consola psql directa
railway connect postgresql

# Ver variables de un servicio
railway variables --service <service>

# Setear una variable
railway variables set KEY=VALUE --service <service>

# Reiniciar un servicio
railway service restart --service <service>

# Ver uso de recursos
railway metrics --service <service>
```

---

## 5. Escalación

Si no podés resolver el problema en 30 minutos:

1. Capturar logs: `railway logs --service <service> > incident-$(date +%Y%m%d-%H%M).log`
2. Crear issue: `gh issue create --title "Incident: <descripción>" --body "$(cat incident-*.log | head -100)"`
3. Contactar Railway support si es infraestructura: support@railway.app
