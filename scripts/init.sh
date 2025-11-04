#!/bin/bash
set -e

echo "🚀 Iniciando Body Recomp Backend..."

# Aguarda o PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL..."
max_attempts=30
attempt=0

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "body-recomp-backend_db" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
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
cd /app/src
alembic upgrade head

echo "✅ Migrações concluídas!"

# Inicia a aplicação
echo "🎯 Iniciando API..."
cd /app/src
exec uvicorn main:app --host 0.0.0.0 --port 8000
