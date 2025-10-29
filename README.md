# Body Recomp Backend

A comprehensive FastAPI-based backend for body recomposition tracking, supporting both cutting (fat loss) and bulking (muscle gain) goals with automated training and diet plan generation.

## Features

### Goal Management
- **Cutting Goals**: Track fat loss while maintaining muscle mass
  - Caloric deficit calculation (15-20% below TDEE)
  - High protein intake (2.4g per kg body weight)
  - 3-4 strength training + 2-3 cardio sessions per week
- **Bulking Goals**: Track muscle gain with minimal fat
  - Caloric surplus calculation (10-15% above TDEE)
  - Moderate protein intake (2.0g per kg body weight)
  - 4-6 strength training sessions per week

### Progress Tracking
- Body measurements (weight, body fat percentage)
- Goal progress monitoring
- Historical data visualization support
- Weekly check-ins and adjustments

### Automated Plan Generation
- **Training Plans**: Goal-specific workout routines
  - Strength training schedules
  - Cardio recommendations
  - Rest day planning
- **Diet Plans**: Macro-optimized nutrition guidance
  - Protein, carbs, fat targets
  - Meal frequency recommendations
  - Diet guidelines and tips

### Authentication & Security
- JWT-based authentication
- Secure password hashing (bcrypt)
- Token refresh mechanism
- User-scoped data access

## Tech Stack

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL with SQLAlchemy 2.0 (async)
- **Validation**: Pydantic 2.0+
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose)
- **Testing**: pytest with 94.5% pass rate, 76.41% coverage
- **Deployment**: Docker Compose

## Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Poetry (dependency management)
- Docker & Docker Compose (optional)

## Installation

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd body-recomp-backend
```

2. **Install dependencies**
```bash
poetry install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/body_recomp
SECRET_KEY=your-secret-key-here
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

4. **Run database migrations**
```bash
alembic upgrade head
```

5. **Start the development server**
```bash
uvicorn src.api.main:app --reload
```

The API will be available at `http://localhost:8000`

### Docker Development

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
docker-compose -f docker-compose.dev.yml exec api alembic upgrade head

# View logs
docker-compose -f docker-compose.dev.yml logs -f api
```

### Docker Production

```bash
# Start production services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f api
```

## Configuration

### Database Connection Pooling
The application uses production-grade connection pooling:
- Pool size: 20 connections
- Max overflow: 10 additional connections
- Pool timeout: 30 seconds
- Connection health checks enabled
- Connection recycling: 1 hour

### Performance Optimizations
- Database indexes on frequently queried columns
- In-memory caching for BMR/TDEE calculations
- Async database operations
- Connection pooling

## API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/refresh` - Refresh access token

#### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile

#### Goals
- `POST /goals/cutting` - Create cutting goal
- `POST /goals/bulking` - Create bulking goal
- `GET /goals/` - List user's goals
- `GET /goals/{goal_id}` - Get specific goal
- `PATCH /goals/{goal_id}/complete` - Complete a goal

#### Progress
- `POST /progress/{goal_id}/measurements` - Add body measurement
- `POST /progress/{goal_id}/entries` - Log progress entry
- `GET /progress/{goal_id}` - Get goal progress summary

#### Plans
- `GET /plans/{goal_id}/training` - Get training plan
- `GET /plans/{goal_id}/diet` - Get diet plan

## Running Tests

### All Tests
```bash
pytest tests/ -v
```

### With Coverage
```bash
pytest tests/ --cov=src --cov-report=html
```

### Specific Test Types
```bash
# Contract tests
pytest tests/contract/ -v

# Integration tests
pytest tests/integration/ -v

# Unit tests
pytest tests/unit/ -v
```

### Test Statistics
- **Total Tests**: 200
- **Passing**: 189 (94.5%)
- **Coverage**: 76.41%

## Database Migrations

### Create Migration
```bash
alembic revision -m "description"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Rollback
```bash
alembic downgrade -1
```

## Deployment

### Using Deployment Scripts

```bash
# Deploy to production
./scripts/deploy.sh

# Backup database
./scripts/backup.sh
```

### Manual Deployment

1. Build and start containers:
```bash
docker-compose up -d --build
```

2. Run migrations:
```bash
docker-compose exec api alembic upgrade head
```

3. Check health:
```bash
curl http://localhost:8000/health
```

## Project Structure

```
body-recomp-backend/
├── alembic/              # Database migrations
├── src/
│   ├── api/              # API layer
│   │   ├── routers/      # Endpoint definitions
│   │   └── main.py       # FastAPI app
│   ├── core/             # Core configuration
│   │   ├── config.py     # Settings
│   │   ├── database.py   # DB connection
│   │   └── security.py   # Auth utilities
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   └── services/         # Business logic
├── tests/                # Test suite
│   ├── contract/         # API contract tests
│   ├── integration/      # Integration tests
│   └── unit/             # Unit tests
├── scripts/              # Deployment scripts
├── docker-compose.yml    # Production compose
├── docker-compose.dev.yml # Development compose
└── pyproject.toml        # Dependencies
```

## Development Guidelines

### Code Style
- Follow PEP 8
- Use type hints
- Document complex logic
- Keep functions focused and small

### Commit Messages
- Follow conventional commits
- Use descriptive messages
- Reference issues when applicable

### Testing
- Write tests for new features
- Maintain test coverage above 75%
- Run tests before committing

## Monitoring

### Health Check
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy"
}
```

### Cache Statistics
Cache performance metrics are available in logs for BMR/TDEE calculations.

## License

[License Type]

## Contributing

[Contributing guidelines]

## Support

[Support information]
