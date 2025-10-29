#!/bin/bash
set -e
BACKUP_DIR=${BACKUP_DIR:-./backups}
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
echo "Creating backup: $BACKUP_FILE"
if docker-compose ps | grep -q "db"; then
  docker-compose exec -T db pg_dump -U postgres body_recomp > "$BACKUP_FILE"
else
  echo "Error: Database container not running"
  exit 1
fi
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
  gzip "$BACKUP_FILE"
  echo "Backup completed: $BACKUP_FILE.gz"
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
  echo "Old backups cleaned (kept last 7 days)"
else
  echo "Error: Backup failed"
  exit 1
fi
