#!/bin/bash
# PostgreSQL Backup Script for Fire Productions
# Usage: ./postgres-backup.sh

BACKUP_DIR="${BACKUP_DIR:-/opt/fire-productions/postgres-backup}"
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-fire}"
POSTGRES_DB="${POSTGRES_DB:-firedb}"
PGPASSWORD="${PGPASSWORD:-firepassword}"

export PGPASSWORD

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.dump"

echo "=== PostgreSQL Backup Started ==="
echo "Backing up to: $BACKUP_FILE"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup using custom format (supports compression)
pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -F c -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Clean old backups (keep last 7 days)
echo "Cleaning old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -maxdepth 1 -type f -name "backup_*.dump" -mtime +7 -exec rm -f {} \;

echo "=== Backup Complete ==="
