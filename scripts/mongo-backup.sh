#!/bin/bash
# MongoDB Backup Script for Fire Productions
# Usage: ./mongo-backup.sh [backup_dir] [days_to_keep]

BACKUP_DIR="${1:-/backup}"
DAYS_TO_KEEP="${2:-7}"
MONGO_HOST="${MONGO_HOST:-mongodb}"
MONGO_PORT="${MONGO_PORT:-27017}"
DB_NAME="${DB_NAME:-test}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/backup_${TIMESTAMP}"

echo "=== MongoDB Backup Started ==="
echo "Timestamp: ${TIMESTAMP}"
echo "Database: ${DB_NAME}"
echo "Backup Path: ${BACKUP_PATH}"

# Run mongodump
mongodump --host "${MONGO_HOST}:${MONGO_PORT}" --db "${DB_NAME}" --out "${BACKUP_PATH}"

if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    
    # Clean old backups
    echo "Cleaning backups older than ${DAYS_TO_KEEP} days..."
    find "${BACKUP_DIR}" -maxdepth 1 -type d -name "backup_*" -mtime +${DAYS_TO_KEEP} -exec rm -rf {} \;
    
    echo "Current backups:"
    ls -la "${BACKUP_DIR}" | grep backup_
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "=== Backup Complete ==="
