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
RETENTION_DAYS=90

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Perform backup
echo "[$(date)] Starting backup..."
pg_dump -U "$DB_USER" -Fc "$DB_NAME" > "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

# Check if successful
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup successful: ${DB_NAME}_${DATE}.dump"
    
    # Compress
    gzip "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"
    echo "[$(date)] Compressed: ${DB_NAME}_${DATE}.dump.gz"
else
    echo "[$(date)] ERROR: Backup failed!"
    exit 1
fi

# Clean old backups
echo "[$(date)] Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.dump.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Done. Total backups: $(ls -1 "$BACKUP_DIR" | wc -l)"