#!/bin/bash
# MongoDB Restore Script for Fire Productions
# Restores database from local backup on first deploy
# Usage: ./mongo-restore.sh [backup_dir]

BACKUP_DIR="${1:-/backup/test}"
MONGO_HOST="${MONGO_HOST:-mongodb}"
MONGO_PORT="${MONGO_PORT:-27017}"
DB_NAME="${DB_NAME:-test}"

echo "=== MongoDB Restore Started ==="
echo "Restoring from: ${BACKUP_DIR}"
echo "To database: ${DB_NAME}"

# Check if backup exists
if [ ! -d "${BACKUP_DIR}" ]; then
    echo "❌ Backup directory not found: ${BACKUP_DIR}"
    exit 1
fi

# Wait for MongoDB to be ready
echo "Waiting for MongoDB..."
for i in {1..30}; do
    if mongosh --host "${MONGO_HOST}:${MONGO_PORT}" --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "MongoDB is ready!"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

# Check if database already has data
DOC_COUNT=$(mongosh --host "${MONGO_HOST}:${MONGO_PORT}" --quiet --eval "db.getSiblingDB('${DB_NAME}').getCollectionNames().length")

if [ "$DOC_COUNT" -gt "0" ]; then
    echo "⚠️  Database already has ${DOC_COUNT} collections. Skipping restore."
    echo "   To force restore, drop the database first."
    exit 0
fi

# Run mongorestore
mongorestore --host "${MONGO_HOST}:${MONGO_PORT}" --db "${DB_NAME}" "${BACKUP_DIR}"

if [ $? -eq 0 ]; then
    echo "✅ Restore completed successfully!"
    echo "Collections in database:"
    mongosh --host "${MONGO_HOST}:${MONGO_PORT}" --quiet --eval "db.getSiblingDB('${DB_NAME}').getCollectionNames()"
else
    echo "❌ Restore failed!"
    exit 1
fi

echo "=== Restore Complete ==="
