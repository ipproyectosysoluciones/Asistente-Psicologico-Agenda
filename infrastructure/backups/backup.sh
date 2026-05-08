#!/bin/bash
# ============================================================
# Backup Script - Asistente Psicológico
# Daily PostgreSQL backup con retención de 90 días
# ============================================================

# Configuration
BACKUP_DIR="$(dirname "$0")/../backups/data"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-asistente_psicologico}"
DB_USER="${DB_USER:-admin}"
DB_HOST="${DB_HOST:-localhost}"
RETENTION_DAYS=90

# PGPASSWORD required for non-interactive auth in cron
export PGPASSWORD="${DB_PASSWORD:?DB_PASSWORD env var is required}"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

# pg_dump -Fc produces a compressed custom-format archive — no gzip needed
echo "[$(date)] Starting backup..."
pg_dump -U "$DB_USER" -h "$DB_HOST" -Fc "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup successful: ${DB_NAME}_${DATE}.dump"
else
    echo "[$(date)] ERROR: Backup failed!"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Verify backup integrity (structural check via TOC parse — no DB required)
pg_restore --list "$BACKUP_FILE" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[$(date)] ERROR: Restore-verify failed for $BACKUP_FILE" >&2
    exit 1
fi
echo "OK   $BACKUP_FILE   $(stat -c%s "$BACKUP_FILE")bytes   $(date)" >> "$(dirname "$0")/backup.log"
echo "[$(date)] Backup verified: TOC parsed successfully"

# Clean old backups
echo "[$(date)] Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Done. Total backups: $(ls -1 "$BACKUP_DIR" | wc -l)"
