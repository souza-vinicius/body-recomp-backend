# Research: Body Recomposition Goal Tracking

**Feature**: Body Recomposition Goal Tracking  
**Date**: 2025-10-23  
**Status**: Complete

## Overview

This document captures research decisions for implementing body recomposition goal tracking with multiple body fat calculation methods, caloric recommendations, and progress visualization.

---

## 1. Body Fat Calculation Methods

### Decision: Implement Navy Method, 3-Site Skinfold, and 7-Site Skinfold

**Rationale**:
- **Navy Method (US Navy Circumference)**: Most accessible, requires only measuring tape, proven accuracy ±3-4%
- **3-Site Skinfold**: Better accuracy ±2-3%, requires calipers but simpler than 7-site
- **7-Site Skinfold**: Best estimation accuracy ±2%, Jackson-Pollock formula widely validated

**Formulas**:

**Navy Method**:
- Men: Body Fat % = 495 / (1.0324 - 0.19077 × log10(waist - neck) + 0.15456 × log10(height)) - 450
- Women: Body Fat % = 495 / (1.29579 - 0.35004 × log10(waist + hip - neck) + 0.22100 × log10(height)) - 450
- Measurements in cm

**3-Site Skinfold (Jackson-Pollock)**:
- Men (chest, abdomen, thigh): Body Density = 1.10938 - (0.0008267 × sum) + (0.0000016 × sum²) - (0.0002574 × age)
- Women (tricep, suprailiac, thigh): Body Density = 1.0994921 - (0.0009929 × sum) + (0.0000023 × sum²) - (0.0001392 × age)
- Body Fat % = (495 / Body Density) - 450
- Measurements in mm

**7-Site Skinfold (Jackson-Pollock)**:
- Both genders: Body Density = 1.112 - (0.00043499 × sum) + (0.00000055 × sum²) - (0.00028826 × age)
- Body Fat % = (495 / Body Density) - 450
- Sites: chest, midaxillary, tricep, subscapular, abdomen, suprailiac, thigh
- Measurements in mm

**Alternatives Considered**:
- Bioelectrical Impedance Analysis (BIA): Requires hardware, not feasible for software-only solution
- DEXA scan: Gold standard but requires clinical equipment
- Bod Pod: Also requires specialized equipment
- Calipers + estimation apps: User already providing measurement method choice covers this

**Implementation Notes**:
- Store calculation method with each measurement for consistency
- Provide measurement guides with diagrams for each method
- Validate measurements against physiological limits (prevent outliers)

---

## 2. Caloric Recommendations for Cutting and Bulking

### Decision: Use Mifflin-St Jeor equation + activity multiplier + goal adjustment

**Rationale**:
- Mifflin-St Jeor is more accurate than Harris-Benedict for modern populations
- Activity multipliers well-established in exercise science
- Conservative deficits/surpluses minimize muscle loss (cutting) and fat gain (bulking)

**Formulas**:

**Basal Metabolic Rate (BMR) - Mifflin-St Jeor**:
- Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
- Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161

**Total Daily Energy Expenditure (TDEE)**:
- Sedentary (little/no exercise): BMR × 1.2
- Lightly active (1-3 days/week): BMR × 1.375
- Moderately active (3-5 days/week): BMR × 1.55
- Very active (6-7 days/week): BMR × 1.725
- Extremely active (athlete, 2x/day): BMR × 1.9

**Goal Adjustments**:
- Cutting: TDEE - 300 to 500 calories (deficit)
  - Minimum: 1200 cal/day (women), 1500 cal/day (men) for safety
  - Rate: Target 0.5-1% body weight loss per week
- Bulking: TDEE + 200 to 300 calories (surplus)
  - Conservative surplus minimizes fat gain
  - Rate: Target 0.25-0.5% body weight gain per week

**Macronutrient Distribution**:
- **Protein**: 
  - Cutting: 2.2-2.6g per kg bodyweight (preserve muscle)
  - Bulking: 1.8-2.2g per kg bodyweight
- **Fats**: 20-30% of total calories (minimum 0.5g/kg for hormones)
- **Carbohydrates**: Remaining calories

**Alternatives Considered**:
- Harris-Benedict: Less accurate for obese individuals
- Katch-McArdle: Requires accurate body fat percentage (circular dependency)
- Fixed deficit/surplus percentages: Less flexible across different body compositions

**Implementation Notes**:
- Require user to input activity level during goal creation
- Recalculate TDEE as weight changes over weeks
- Alert users if approaching minimum safe calorie thresholds
- Store calorie recommendations with timestamp for historical tracking

---

## 3. Timeline Projections

### Decision: Evidence-based rate limits with linear projection

**Rationale**:
- Research supports safe fat loss of 0.5-1% body fat per month
- Muscle gain rates vary by training status, use conservative estimates
- Linear projections acceptable for 12-16 week timeframes

**Cutting Timeline**:
- Rate: 0.5-1% body fat decrease per month
- Formula: weeks_to_goal = (current_bf% - target_bf%) / (rate_per_month / 4.33)
- Example: 25% → 15% at 0.75%/month = 13.3 months (~57 weeks)
- Adjust projection based on actual progress every 4 weeks

**Bulking Timeline**:
- Rate: 0.1-0.3% body fat increase per month (while gaining muscle)
- Formula: weeks_to_ceiling = (ceiling_bf% - current_bf%) / (rate_per_month / 4.33)
- Example: 12% → 18% at 0.2%/month = 30 months (~130 weeks)
- Bulking typically slower than cutting

**Alternatives Considered**:
- Exponential models: Unnecessary complexity for initial MVP
- Machine learning predictions: Requires training data we don't have yet
- Fixed timelines: Ignores individual variance

**Implementation Notes**:
- Display timeline as range (best case / worst case)
- Update projections based on rolling 4-week average progress
- Flag if progress deviates >50% from expected rate

---

## 4. Progress Visualization

### Decision: Time-series line chart with trend analysis

**Rationale**:
- Line charts best for showing trends over time
- Simple and universally understood
- Can overlay goal markers and milestones

**Data Points**:
- X-axis: Week number or date
- Y-axis: Body fat percentage
- Additional series: Weight, projected trend line
- Goal markers: Starting point, current, target/ceiling

**Statistical Features**:
- 4-week moving average to smooth weekly fluctuations
- Linear regression trend line
- Velocity indicator (current rate vs expected rate)

**Alternatives Considered**:
- Bar charts: Less effective for time series
- Dashboard with multiple metrics: Risk of information overload
- Photo progress: P6 feature, not MVP

**Implementation Notes**:
- Return data structure optimized for frontend charting libraries (Chart.js, Recharts)
- Include raw data and smoothed data in API response
- Calculate trend analysis server-side for consistency

---

## 5. FastAPI Architecture Patterns

### Decision: Layered architecture with dependency injection

**Rationale**:
- FastAPI's dependency injection supports clean separation
- Services layer enables business logic testing without HTTP
- Schemas (Pydantic) provide automatic validation and OpenAPI generation

**Architecture Layers**:
1. **API Layer** (routers/): HTTP endpoints, request/response handling
2. **Schema Layer** (schemas/): Pydantic models for validation and serialization
3. **Service Layer** (services/): Business logic, calculations
4. **Model Layer** (models/): SQLAlchemy ORM models
5. **Core Layer** (core/): Database, auth, config

**Dependency Injection Pattern**:
```python
# Example pattern
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str, db: Session = Depends(get_db)):
    # Verify JWT, return user
    pass

@router.post("/goals")
async def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return goal_service.create_goal(db, current_user, goal)
```

**Alternatives Considered**:
- Repository pattern: Adds abstraction layer, unnecessary for this scale
- CQRS: Over-engineering for straightforward CRUD operations
- Microservices: Premature for MVP

**Implementation Notes**:
- Use async where I/O-bound (DB queries, external services)
- Keep services stateless for testability
- Use Pydantic models for all input/output validation

---

## 6. PostgreSQL Schema Design

### Decision: Normalized relational schema with foreign key constraints

**Rationale**:
- Body recomposition data is inherently relational (users → goals → measurements)
- Strong consistency needed for health data
- PostgreSQL excels at complex queries (trends, aggregations)

**Key Design Decisions**:
- **User Isolation**: All tables have user_id foreign key with ON DELETE CASCADE
- **Temporal Data**: All measurement and progress tables include timestamps
- **Calculation Method Storage**: Store method with each measurement for reproducibility
- **Goal Status**: Enum for active/completed/abandoned
- **Indexes**: On user_id, created_at for efficient queries

**Schema Relationships**:
- Users (1) → (N) Goals
- Goals (1) → (N) ProgressEntries
- Goals (1) → (1) TrainingPlan
- Goals (1) → (1) DietPlan
- Users (1) → (N) BodyMeasurements

**Alternatives Considered**:
- NoSQL (MongoDB): Loses referential integrity, complex queries harder
- Time-series DB (TimescaleDB): Over-specialized, weekly data not high-frequency
- Separate microservices DBs: Premature, adds complexity

**Implementation Notes**:
- Use Alembic for migrations (version control schema changes)
- Enable PostgreSQL row-level security for multi-tenancy safety
- Use JSONB for flexible plan storage (training/diet details)

---

## 7. Authentication & Authorization

### Decision: JWT tokens with FastAPI security utilities

**Rationale**:
- Stateless auth suitable for API-first architecture
- FastAPI has excellent JWT support via `python-jose`
- Refresh token pattern for security

**Implementation**:
- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry, stored in httpOnly cookie
- Password hashing: bcrypt (via `passlib`)
- Token payload: user_id, email, exp, iat

**Authorization Strategy**:
- Middleware extracts user from JWT
- All endpoints verify user owns requested resources via user_id checks
- Example: `/goals/{goal_id}` verifies goal.user_id == current_user.id

**Alternatives Considered**:
- Session-based auth: Requires state management, doesn't scale horizontally
- OAuth2 with external provider: Adds complexity, may add later for social login
- API keys: Less secure for user-facing app

**Implementation Notes**:
- Store hashed passwords only (never plaintext)
- Implement rate limiting on auth endpoints
- Log all auth attempts for security monitoring

---

## 8. Testing Strategy

### Decision: Three-layer testing (contract, integration, unit)

**Rationale**:
- Constitution mandates test-first development
- Contract tests ensure API matches OpenAPI spec
- Integration tests verify user journeys end-to-end
- Unit tests validate business logic in isolation

**Contract Tests** (pytest + httpx):
- Test each endpoint against OpenAPI schema
- Verify status codes, response shapes, validation errors
- Use `schemathesis` for automated contract testing

**Integration Tests**:
- Test complete user stories (P1-P5)
- Use test database (PostgreSQL in Docker)
- Verify data persistence and state transitions

**Unit Tests**:
- Body fat calculations (verify formulas)
- Caloric recommendations (verify BMR/TDEE math)
- Timeline projections (verify rate calculations)
- Validation logic (edge cases)

**Test Data Strategy**:
- Fixtures for common user profiles
- Factory pattern for generating test measurements
- Rollback transactions after each test for isolation

**Alternatives Considered**:
- End-to-end tests with Selenium: Too slow for MVP, no UI yet
- Property-based testing: Useful for calculations, may add later
- Load testing: Important but post-MVP

**Implementation Notes**:
- Use pytest fixtures for DB setup/teardown
- Mock external services if any added later
- Maintain >80% code coverage target

---

## 9. Error Handling & Validation

### Decision: Pydantic validation + custom HTTP exceptions

**Rationale**:
- Pydantic provides declarative validation
- FastAPI automatically converts to 422 Unprocessable Entity
- Custom exceptions for domain-specific errors

**Validation Rules**:
- Body fat: 5-50% (physiological limits)
- Weight: 30-300 kg
- Height: 120-250 cm
- Age: 13-120 years
- Measurement values: Positive numbers, reasonable ranges

**Error Response Format**:
```json
{
  "detail": "Human-readable message",
  "error_code": "INVALID_BODY_FAT_TARGET",
  "field": "target_body_fat_percentage",
  "value": 3.5
}
```

**Custom Exceptions**:
- `InvalidGoalError`: Invalid goal parameters
- `MeasurementValidationError`: Measurements out of range
- `GoalNotFoundError`: Goal doesn't exist or wrong user
- `UnauthorizedError`: Auth failures

**Alternatives Considered**:
- Generic 400 Bad Request: Less informative for frontend
- Validation middleware: Pydantic is more declarative
- Separate validation service: Unnecessary abstraction

**Implementation Notes**:
- Log all errors with context for debugging
- Return user-friendly messages (don't expose internals)
- Document all error codes in OpenAPI spec

---

## 10. Deployment & Environment Configuration

### Decision: Docker + docker-compose for development, environment variables for config

**Rationale**:
- Docker ensures consistent environment across dev/prod
- docker-compose simplifies local development with PostgreSQL
- 12-factor app principles (config via environment)

**Configuration Management**:
- `pydantic-settings` for typed config
- `.env` file for local development
- Environment variables in production
- Secrets never committed to git

**Docker Setup**:
```yaml
services:
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/bodyrecomp
      SECRET_KEY: ${SECRET_KEY}
    depends_on: [db]
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bodyrecomp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

**Alternatives Considered**:
- Virtual environment only: Doesn't handle PostgreSQL
- Kubernetes: Over-engineered for MVP
- Serverless: Cold starts unacceptable for <2s calculation requirement

**Implementation Notes**:
- Use multi-stage Docker build for smaller images
- Health check endpoints for container orchestration
- Database connection pooling (SQLAlchemy)

---

## Summary of Key Technologies

| Category | Technology | Justification |
|----------|-----------|---------------|
| Framework | FastAPI 0.104+ | Async support, auto OpenAPI, Pydantic integration |
| Database | PostgreSQL 15+ | Strong consistency, complex queries, proven reliability |
| ORM | SQLAlchemy 2.0+ | Mature, async support, great FastAPI integration |
| Validation | Pydantic 2.0+ | Declarative validation, automatic OpenAPI schemas |
| Migrations | Alembic | Standard SQLAlchemy migration tool |
| Auth | python-jose + passlib | JWT tokens, bcrypt hashing, FastAPI compatible |
| Testing | pytest + httpx | Async test support, excellent FastAPI testing story |
| Container | Docker + docker-compose | Consistent environments, easy local development |

---

## Open Questions / Future Research

1. **Photo upload for progress tracking** (P6 feature): S3-compatible storage? Size limits?
2. **Training plan templates**: Integrate with exercise database API or build custom?
3. **Diet plan meal suggestions**: Recipe API integration or simple macros only?
4. **Mobile app**: React Native vs native? Timeline?
5. **Analytics**: User behavior tracking for feature optimization?

These will be addressed as corresponding user stories are prioritized.

---

**Research Status**: ✅ Complete - All technical decisions documented and ready for Phase 1 design.
