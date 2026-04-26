# Sprint 3 — Pre-import Backup

Before importing the updated workflows, export the live versions with:

```bash
N8N_URL=https://<your-n8n-host>
N8N_KEY=<your-api-key>

for ID in recordatorios no-show confirmacion google-sheets-sync; do
  curl -s -H "X-N8N-API-KEY: $N8N_KEY" "$N8N_URL/api/v1/workflows/$ID" \
    > "infrastructure/backups/sprint-3/${ID}-$(date +%Y%m%d%H%M%S).json"
done
```

To rollback any workflow after a failed import:

```bash
curl -X PUT -H "X-N8N-API-KEY: $N8N_KEY" \
  -H "Content-Type: application/json" \
  -d @infrastructure/backups/sprint-3/<workflow>-<timestamp>.json \
  "$N8N_URL/api/v1/workflows/<workflow-id>"
```
