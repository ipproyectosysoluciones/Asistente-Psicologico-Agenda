# Disaster Recovery Runbook — Asistente Psicológico

**Fecha:** 2026-05-08  
**Tarea:** 5.14 — Runbook de Disaster Recovery  
**Sprint:** Phase 5 W18

---

## 1. RTO / RPO

| Métrica | Target | Justificación |
|---------|--------|---------------|
| RTO (Recovery Time Objective) | < 2 horas | Sistema de un solo tenente; impacto limitado |
| RPO (Recovery Point Objective) | < 24 horas | Railway PostgreSQL backups diarios automáticos |

---

## 2. Escenarios y procedimientos

### 2.1 Caída de la aplicación (Railway service down)

**Síntomas:** Dashboard inaccesible, webhooks n8n no responden.

```bash
# 1. Verificar estado en Railway dashboard
# https://railway.app/project/<project-id>

# 2. Reiniciar el servicio si está en estado "Failed"
railway service restart --service <service-name>

# 3. Ver logs en tiempo real
railway logs --service <service-name> --tail 100

# 4. Si el servicio no levanta, verificar variables de entorno
railway variables --service <service-name>
```

**Rollback:** Si el deploy reciente causó la caída, hacer rollback desde Railway dashboard → Deployments → Rollback.

---

### 2.2 Corrupción / pérdida de datos en PostgreSQL

**Síntomas:** Errores de constraint, datos faltantes, queries retornando valores inesperados.

#### Paso 1 — Identificar el alcance

```sql
-- Verificar integridad de tablas críticas
SELECT COUNT(*) FROM patients WHERE deleted_at IS NULL;
SELECT COUNT(*) FROM appointments WHERE scheduled_at > NOW();
SELECT COUNT(*) FROM psychologists WHERE is_active = TRUE;
```

#### Paso 2 — Restaurar desde backup Railway

```bash
# Railway crea backups automáticos diarios de PostgreSQL
# Ir a Railway dashboard → PostgreSQL service → Backups
# Seleccionar el backup más reciente antes del incidente
# Click "Restore" → confirmar

# El proceso tarda ~15-30 min según tamaño de la DB
```

#### Paso 3 — Aplicar migraciones pendientes

```bash
# Desde el directorio del proyecto
cd infrastructure/

# Las migraciones son idempotentes (IF NOT EXISTS / IF EXISTS)
# Aplicar en orden numérico
psql $DATABASE_URL -f migrations/010_retention_policy.sql
psql $DATABASE_URL -f migrations/011_encryption_comments.sql
psql $DATABASE_URL -f migrations/012_performance_indexes.sql
```

#### Paso 4 — Verificar integridad post-restauración

```sql
-- Verificar que los índices estén activos
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verificar constraints
SELECT conname, contype, conrelid::regclass
FROM pg_constraint
WHERE contype IN ('p', 'u', 'f')
ORDER BY conrelid::regclass;
```

---

### 2.3 Brecha de seguridad — acceso no autorizado

**Síntomas:** Actividad anómala en audit_log, logins de IPs desconocidas.

```bash
# 1. INMEDIATO: rotar JWT_SECRET en Railway
railway variables set JWT_SECRET=$(openssl rand -hex 32) --service <service>

# Esto invalida TODOS los tokens activos — todos los usuarios deben volver a iniciar sesión

# 2. Revisar audit_log para la actividad sospechosa
```

```sql
SELECT al.*, ps.email as psychologist_email
FROM audit_log al
LEFT JOIN psychologists ps ON ps.id = al.psychologist_id
WHERE al.created_at > NOW() - INTERVAL '24 hours'
ORDER BY al.created_at DESC
LIMIT 100;
```

```bash
# 3. Si se confirma compromiso de la DB, cambiar DATABASE_URL
railway variables set DATABASE_URL="<new-connection-string>" --service <service>

# 4. Notificar a los psicólogos afectados
# 5. Documentar el incidente en el issue tracker
```

---

### 2.4 Falla de n8n (workflows detenidos)

**Síntomas:** Recordatorios de citas no enviados, CRON de retención no ejecutado.

```bash
# 1. Verificar estado del servicio n8n en Railway
railway logs --service n8n --tail 50

# 2. Reiniciar n8n
railway service restart --service n8n

# 3. Verificar que los workflows estén activos después del reinicio
# Ir a n8n UI → Workflows → verificar que "active: true" se muestra

# 4. Para el CRON de retención: ejecutar manualmente si hubo gap
# n8n UI → cron-retention workflow → Test workflow
```

---

### 2.5 Desastre total (pérdida de Railway project)

**Síntomas:** Project eliminado accidentalmente.

#### Recuperación desde git

```bash
git clone https://github.com/ipproyectosysoluciones/Asistente-Psicologico-Agenda.git
cd Asistente-Psicologico-Agenda

# Crear nuevo proyecto en Railway
railway login
railway init

# Restaurar variables de entorno desde .env.template y valores guardados
cp infrastructure/.env.template .env
# Editar .env con los valores reales

# Deploy
railway up
```

#### Restaurar DB

```bash
# Si hay backup externo disponible:
psql $NEW_DATABASE_URL < backup.sql

# Aplicar migraciones encima del schema base
psql $NEW_DATABASE_URL -f infrastructure/init-db.sql
# (init-db.sql incluye IF NOT EXISTS — idempotente)
```

---

## 3. Contactos de escalación

| Rol | Contacto | Canal |
|-----|---------|-------|
| Administrador del sistema | bladyparra@gmail.com | Email / WhatsApp |
| Soporte Railway | support@railway.app | https://railway.app/support |

---

## 4. Checklist post-recovery

- [ ] Aplicación accesible y respondiendo (< 200ms en `/health`)
- [ ] Login de psicólogo funciona correctamente
- [ ] Dashboard muestra citas correctas
- [ ] n8n workflows activos
- [ ] CRON de retención activo (`0 2 * * *`)
- [ ] audit_log registra operaciones post-recovery
- [ ] Notificar a psicólogos si hubo pérdida de datos
- [ ] Documentar incidente en GitHub Issues

---

## 5. Backup manual de emergencia

```bash
# Exportar toda la DB antes de una operación de riesgo
pg_dump $DATABASE_URL \
  --no-owner \
  --no-acl \
  -f backup_$(date +%Y%m%d_%H%M%S).sql

# Comprimir
gzip backup_*.sql
```
