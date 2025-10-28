# Database Setup & Migration Guide

## Prerequisites Verification ✅

All Phase 2 Foundation tasks are complete:
- ✅ Poetry dependencies installed (52 packages)
- ✅ All 40 unit tests passing
- ✅ Configuration management ready
- ✅ Database models and schemas ready
- ✅ Alembic migration files ready
- ✅ FastAPI application ready

## Database Setup Steps

### 1. Start Docker Desktop

**macOS**: Open Docker Desktop application from Applications folder

**Verify Docker is running**:
```bash
docker --version
docker ps
```

### 2. Start PostgreSQL Database

Start the database container:
```bash
docker compose up -d db
```

Check database health:
```bash
docker compose ps
docker compose logs db
```

You should see:
```
✅ Database is ready to accept connections
```

### 3. Run Database Migrations

Apply the initial migration to create the users table:
```bash
poetry run alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Running upgrade  -> 001_create_users, Create users table
```

Verify migration status:
```bash
poetry run alembic current
```

Should show:
```
001_create_users (head)
```

### 4. Verify Database Schema

Connect to the database and verify tables:
```bash
docker compose exec db psql -U postgres -d body_recomp_dev -c "\dt"
```

Expected tables:
- `users` - User accounts and profiles
- `alembic_version` - Migration tracking

Verify users table structure:
```bash
docker compose exec db psql -U postgres -d body_recomp_dev -c "\d users"
```

### 5. Start the API Server

Start the FastAPI application:
```bash
# Development mode (with auto-reload)
poetry run uvicorn src.api.main:app --reload --port 8000

# Or using docker-compose (full stack)
docker compose up -d
```

Access the API:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### 6. Run Integration Tests (Future)

Once Phase 3 is complete:
```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=src --cov-report=html

# Run specific test types
poetry run pytest tests/unit/
poetry run pytest tests/integration/
poetry run pytest tests/contract/
```

## Database Commands Reference

### View Logs
```bash
docker compose logs -f db
docker compose logs -f api
```

### Stop Services
```bash
docker compose down
```

### Reset Database (WARNING: Deletes all data)
```bash
docker compose down -v
docker compose up -d db
poetry run alembic upgrade head
```

### Create New Migration
```bash
poetry run alembic revision --autogenerate -m "Description of changes"
```

### Rollback Migration
```bash
# Rollback one migration
poetry run alembic downgrade -1

# Rollback to specific revision
poetry run alembic downgrade 001_create_users
```

### Database Shell Access
```bash
# PostgreSQL shell
docker compose exec db psql -U postgres -d body_recomp_dev

# Inside psql:
\dt              # List tables
\d users         # Describe users table
\d+ users        # Detailed table info
\du              # List users
\l               # List databases
\q               # Quit
```

## Troubleshooting

### Port 5432 Already in Use
If you have another PostgreSQL instance running:
```bash
# Stop local PostgreSQL (macOS)
brew services stop postgresql

# Or change the port in docker-compose.yml
ports:
  - "5433:5432"  # Map to different host port

# Update DATABASE_URL in .env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/body_recomp_dev
```

### Connection Refused
```bash
# Check if database container is running
docker compose ps

# Check database logs
docker compose logs db

# Restart database
docker compose restart db
```

### Alembic Errors
```bash
# Check current version
poetry run alembic current

# View migration history
poetry run alembic history

# Stamp database at specific version (if needed)
poetry run alembic stamp head
```

## Next Steps

After successful database setup:

1. **Phase 3 Implementation**: Start implementing P1 (Create Cutting Goal)
   - Contract tests for API endpoints
   - BodyMeasurement and Goal models
   - API routers and services
   - Integration tests

2. **Verify with Quickstart**: Follow `specs/001-body-recomp-goals/quickstart.md`

3. **Manual API Testing**: Use Swagger UI at http://localhost:8000/docs

## Current Project Status

**Completed** (19/124 tasks, 15.3%):
- ✅ Phase 1: Project Setup (6 tasks)
- ✅ Phase 2: Foundation (13 tasks)

**Next**:
- ⏳ Phase 3: P1 Create Cutting Goal (19 tasks)
- ⏳ Phase 4-9: Additional user stories and polish

## Environment Files

**Development** (`.env`):
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/body_recomp_dev
SECRET_KEY=dev-secret-key-change-in-production-use-openssl-rand-hex-32
```

**Production**: Create `.env.production` with secure values
```bash
# Generate secure secret key
openssl rand -hex 32
```
