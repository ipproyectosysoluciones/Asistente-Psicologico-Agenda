# Production Monitoring & Logging Setup

**Fecha:** 2026-05-08  
**Tarea:** 5.23 — Production Monitoring & Logging  
**Sprint:** Phase 5 W20

---

## 1. Métricas actuales (Railway built-in)

Railway provee monitoreo básico sin configuración adicional:

| Métrica | Dónde verla | Threshold de alerta |
|---------|------------|---------------------|
| CPU usage | Railway dashboard → Metrics | > 80% sostenido |
| Memory usage | Railway dashboard → Metrics | > 85% del límite |
| HTTP errors | Railway dashboard → Logs | Rate > 1% |
| DB connections | PostgreSQL service → Metrics | > 80% del pool |

---

## 2. Logging estructurado

### 2.1 n8n execution logs

Todos los workflows de n8n registran ejecuciones automáticamente:

```
n8n UI → Executions → filtrar por workflow
```

Retención de logs en n8n: configurable en `N8N_EXECUTIONS_DATA_PRUNE_MAX_COUNT`.

### 2.2 Application audit log

La tabla `audit_log` actúa como log de negocio:

```sql
-- Ver actividad de las últimas 24h
SELECT table_name, operation, COUNT(*) as ops
FROM audit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY table_name, operation
ORDER BY ops DESC;
```

---

## 3. Alertas — configuración recomendada

### 3.1 Webhook de alertas (ALERT_WEBHOOK_URL)

El sistema usa `ALERT_WEBHOOK_URL` para notificaciones críticas. Configurar con:

**Opción A — Slack incoming webhook:**
```bash
railway variables set ALERT_WEBHOOK_URL=https://hooks.slack.com/services/... --service n8n
```

**Opción B — WhatsApp Business / Twilio:**
```bash
railway variables set ALERT_WEBHOOK_URL=https://api.twilio.com/... --service n8n
```

### 3.2 Alertas manuales desde Railway

Railway permite configurar alertas por email en:
`Dashboard → Project Settings → Notifications`

Habilitar alertas para:
- [ ] Deploy failed
- [ ] Service crashed
- [ ] CPU > 80%
- [ ] Memory > 85%

---

## 4. Health check endpoint

Railway hace health checks automáticos a la raíz `/`. Para mejorarlo:

Agregar en Phase 6 un endpoint `/health` que retorne:

```json
{
  "status": "ok",
  "db": "connected",
  "n8n": "reachable",
  "timestamp": "2026-05-08T02:00:00Z"
}
```

---

## 5. Dashboard de métricas de negocio (n8n)

Crear workflow n8n de reporte semanal (Phase 6):

```
CRON (lunes 9am) → PG queries → build report → send via WhatsApp/email
```

Métricas a reportar:
- Nuevas citas de la semana
- Citas completadas vs no_show
- Nuevos pacientes
- Pacientes próximos a vencer retención

---

## 6. Checklist de monitoring en producción

- [ ] Railway notifications configuradas (deploy fail, crash, CPU)
- [ ] `ALERT_WEBHOOK_URL` configurado con endpoint válido
- [ ] Primer login exitoso registrado en audit_log
- [ ] CRON de retención ejecutó sin errores en la primera noche
- [ ] Railway metrics muestran CPU < 20%, Memory < 40% en idle
- [ ] n8n UI accesible y mostrando executions
