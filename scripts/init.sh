#!/bin/bash
set -e

echo "🚀 Iniciando Body Recomp Backend..."

# Extrai informações do DATABASE_URL para conectar no PostgreSQL
# Formato: postgresql+asyncpg://user:pass@host:port/dbname
if [ -n "$DATABASE_URL" ]; then
  # Remove o prefixo postgresql+asyncpg://
  DB_INFO="${DATABASE_URL#postgresql+asyncpg://}"
  
  # Extrai user:pass@host:port/dbname
  DB_USER=$(echo "$DB_INFO" | cut -d: -f1)
  DB_PASS=$(echo "$DB_INFO" | cut -d: -f2 | cut -d@ -f1)
  DB_HOST=$(echo "$DB_INFO" | cut -d@ -f2 | cut -d: -f1)
  DB_PORT=$(echo "$DB_INFO" | cut -d: -f3 | cut -d/ -f1)
  DB_NAME=$(echo "$DB_INFO" | cut -d/ -f2)
  
  echo "📡 Conectando em: $DB_HOST:$DB_PORT/$DB_NAME"
else
  echo "❌ DATABASE_URL não configurado"
  exit 1
fi

# Aguarda o PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL..."
max_attempts=30
attempt=0

until PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "❌ Timeout aguardando PostgreSQL"
    exit 1
  fi
  echo "⏳ Tentativa $attempt/$max_attempts..."
  sleep 2
done

echo "✅ PostgreSQL pronto!"

# Executa migrações do Alembic
echo "📦 Executando migrações..."
cd /app
alembic upgrade head

echo "✅ Migrações concluídas!"

# Inicia a aplicação
echo "🎯 Iniciando API..."
cd /app/src
exec uvicorn api.main:app --host 0.0.0.0 --port 8000
