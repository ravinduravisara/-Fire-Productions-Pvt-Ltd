#!/bin/bash
# PostgreSQL Restore Script for Fire Productions
# Usage: ./postgres-restore.sh [backup_file]

BACKUP_FILE="${1:-}"
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-fire}"
POSTGRES_DB="${POSTGRES_DB:-firedb}"
PGPASSWORD="${PGPASSWORD:-firepassword}"

export PGPASSWORD

if [ -z "$BACKUP_FILE" ]; then
    # Find most recent backup
    BACKUP_DIR="/opt/fire-productions/postgres-backup"
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/backup_*.dump 2>/dev/null | head -1)
    
    if [ -z "$BACKUP_FILE" ]; then
        echo "❌ No backup file specified and no backups found in $BACKUP_DIR"
        exit 1
    fi
    echo "Using most recent backup: $BACKUP_FILE"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "=== PostgreSQL Restore Started ==="
echo "Restoring from: $BACKUP_FILE"

# Restore using pg_restore
pg_restore -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c --if-exists "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Restore completed successfully!"
else
    echo "⚠️  Restore completed with warnings (this is normal for first restore)"
fi

echo "=== Restore Complete ==="
