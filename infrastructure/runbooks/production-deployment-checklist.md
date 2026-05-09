# Production Deployment Checklist

**Fecha:** 2026-05-08  
**Tarea:** 5.19 — Production Deployment Checklist  
**Sprint:** Phase 5 W19

---

## Pre-deploy (antes de mergear a main)

### Código

- [ ] Todos los tests pasan: `cd dashboard && pnpm run test:run`
- [ ] Build sin errores: `cd dashboard && pnpm run build`
- [ ] TypeScript sin errores: `cd dashboard && pnpm exec tsc --noEmit`
- [ ] Dependencias auditadas: `pnpm audit` — sin vulnerabilidades críticas
- [ ] PR aprobado por el responsable (`ipproyectosysoluciones`)
- [ ] No hay `console.log` de debug en el código mergeado

### Seguridad

- [ ] `JWT_SECRET` generado con 32+ caracteres aleatorios en Railway prod
- [ ] Contraseña de admin por defecto (`admin123`) cambiada
- [ ] `.env` no está en el repositorio: `git log --all -- .env` retorna vacío
- [ ] `DATABASE_URL` con `sslmode=require`
- [ ] Variables de entorno en Railway (no en código fuente)

### Base de datos

- [ ] Migraciones aplicadas en orden:
  - [ ] `010_retention_policy.sql`
  - [ ] `011_encryption_comments.sql`
  - [ ] `012_performance_indexes.sql`
- [ ] Backup manual tomado antes del deploy: `pg_dump $DATABASE_URL > pre-deploy-backup.sql`
- [ ] Verificar integridad de tablas:
  ```sql
  SELECT COUNT(*) FROM psychologists;
  SELECT COUNT(*) FROM patients WHERE deleted_at IS NULL;
  ```

### n8n

- [ ] Todos los workflows están activos (n8n UI → Workflows)
- [ ] CRON de retención activo: `0 2 * * *`
- [ ] Workflows de recordatorio de citas activos
- [ ] Credenciales de PostgreSQL actualizadas en n8n para la DB de producción
- [ ] `N8N_ENCRYPTION_KEY` configurado en Railway

---

## Deploy

```bash
# 1. Mergear release → main (PR aprobado)
git checkout main && git pull origin main

# 2. Crear tag de versión
git tag -a v2.0.0 -m "Phase 5 complete — Production release"
git push origin v2.0.0

# 3. Railway detecta el push a main y hace deploy automático
# Monitorear en: https://railway.app/project/<project-id>

# 4. Verificar deploy exitoso
railway logs --service <service-name> --tail 50
```

---

## Post-deploy (verificación inmediata)

### Salud del sistema

- [ ] Dashboard accesible en la URL de producción
- [ ] Login funciona con credenciales de producción
- [ ] Endpoint de salud responde: `curl https://your-app.railway.app/health`
- [ ] n8n accesible: webhook `/auth/login` responde

### Funcionalidad core

- [ ] Crear cita de prueba → aparece en el calendario
- [ ] Buscar paciente → resultados correctos
- [ ] Vista de historia clínica → carga correctamente
- [ ] Logout → redirige al login, sessionStorage limpio

### Monitoring

- [ ] Railway dashboard muestra CPU/RAM normales (< 70%)
- [ ] No hay errores en Railway logs de las últimas 5 minutos
- [ ] Primer CRON de retención programado correctamente

---

## Rollback

Si el deploy falla o la app no funciona correctamente:

```bash
# Railway dashboard → Deployments → seleccionar el deploy anterior → Rollback
# El rollback tarda ~2 minutos
```

Si hay corrupción de DB: ver `disaster-recovery.md` — sección 2.2.

---

## Comunicación

- [ ] Notificar a los psicólogos de la ventana de mantenimiento (mínimo 24h antes)
- [ ] Crear issue en GitHub marcando el launch: `gh issue create --title "🚀 Launch v2.0.0"`
- [ ] Documentar cualquier incidente durante el deploy en el issue
