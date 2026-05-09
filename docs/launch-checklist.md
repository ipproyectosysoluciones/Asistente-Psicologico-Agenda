# Launch to Production — Checklist v2.0.0

**Fecha objetivo:** Por definir  
**Tarea:** 5.25 — Launch to Production  
**Sprint:** Phase 5 W20

---

## Fase 1 — Preparación (72h antes)

### Infraestructura
- [ ] Railway proyecto en plan Pro (no Hobby) — para SLAs de producción
- [ ] PostgreSQL con backup automático habilitado
- [ ] Variables de entorno de producción configuradas (ver `.env.template`)
- [ ] `JWT_SECRET` rotado (generar nuevo): `openssl rand -hex 32`
- [ ] Contraseña admin por defecto cambiada

### Código
- [ ] Tracker PR #114 mergeado a `dev` (requiere aprobación de `ipproyectosysoluciones`)
- [ ] `dev` mergeado a `release`
- [ ] `release` mergeado a `main`
- [ ] Tag `v2.0.0` creado y publicado en GitHub Releases
- [ ] GitHub Actions CI pasa en `main`
- [ ] Dependabot vulnerabilities resueltas

### Base de datos
- [ ] Migraciones aplicadas en producción:
  - [ ] `010_retention_policy.sql`
  - [ ] `011_encryption_comments.sql`
  - [ ] `012_performance_indexes.sql`
- [ ] Backup manual tomado: `pg_dump $DATABASE_URL > pre-launch-backup.sql`
- [ ] Psicólogos de producción creados con contraseñas seguras

### n8n
- [ ] Workflows desplegados y activos
- [ ] Credenciales de DB actualizadas en n8n para la DB de producción
- [ ] CRON de retención activo
- [ ] Workflows de recordatorio de citas activos

---

## Fase 2 — Go-Live (día del launch)

### Ventana de mantenimiento (recomendado: 2am-4am)

```bash
# 1. Deploy a Railway (automático desde main)
git checkout main
git tag v2.0.0
git push origin v2.0.0

# 2. Monitorear Railway logs durante el deploy
railway logs --service <service> --tail 100

# 3. Verificar que el deploy fue exitoso
curl -I https://your-app.railway.app
# Esperado: HTTP/2 200
```

### Smoke test post-deploy

```bash
# Login
TOKEN=$(curl -s -X POST https://your-n8n.railway.app/webhook/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"<prod-email>","password":"<prod-pass>"}' \
  | jq -r '.token')

# Verificar que el token funciona
curl -s https://your-n8n.railway.app/webhook/appointments \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
# Esperado: número >= 0
```

---

## Fase 3 — Post-launch (primeras 48h)

### Monitoreo activo

- [ ] Railway metrics: CPU y Memory normales
- [ ] No hay errores 5xx en Railway logs
- [ ] audit_log registra operaciones de los primeros usuarios
- [ ] CRON de retención ejecutó a las 2am sin errores

### Comunicación

- [ ] Notificar a los psicólogos que el sistema está disponible
- [ ] Compartir link de la guía de onboarding: `docs/onboarding-psychologist.md`
- [ ] Crear issue en GitHub: `gh issue create --title "🚀 v2.0.0 launched to production"`

---

## Rollback de emergencia

Si el launch falla, ejecutar dentro de los primeros 15 minutos:

```bash
# Railway dashboard → Deployments → seleccionar último deploy estable → Rollback
# Tiempo estimado: ~2 minutos
```

Si hay corrupción de datos, ver `disaster-recovery.md`.

---

## Métricas de éxito (30 días post-launch)

| Métrica | Target |
|---------|--------|
| Uptime | > 99.5% |
| p(95) response time | < 2s |
| Error rate | < 1% |
| CRON de retención sin errores | 30/30 ejecuciones |
| Psicólogos activos | ≥ 1 |
