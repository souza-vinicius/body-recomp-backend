# Implementation Plan: Body Recomposition Goal Tracking

**Branch**: `001-body-recomp-goals` | **Date**: 2025-10-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-body-recomp-goals/spec.md`

## Summary

Enable users to track body recomposition through goal-based body fat percentage tracking. Users create cutting goals (fat loss with caloric deficit) or bulking goals (muscle gain with caloric surplus), log weekly measurements, and receive personalized training and diet plans. The system supports multiple body fat calculation methods (Navy, 3-Site Skinfold, 7-Site Skinfold) and provides progress visualization with timeline projections. Core MVP focuses on cutting goal creation and weekly progress tracking, with bulking and plan generation as subsequent priorities.

## Technical Context

**Language/Version**: Python 3.11+  
**Primary Dependencies**: FastAPI 0.104+, SQLAlchemy 2.0+, Pydantic 2.0+, Alembic (migrations)  
**Storage**: PostgreSQL 15+ (user profiles, measurements, goals, progress history)  
**Testing**: pytest 7.4+, pytest-asyncio, httpx (async API testing)  
**Target Platform**: Linux server (containerized with Docker)  
**Project Type**: Single backend API (RESTful)  
**Performance Goals**: <200ms p95 response time for calculations, support 1000 concurrent users  
**Constraints**: Must calculate body fat within 2 seconds, support multiple calculation methods without performance degradation  
**Scale/Scope**: Initial MVP targets 1000-10000 users, ~20 API endpoints, storing 50+ measurements per user annually

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. API-First Design ✅ PASS
- [ ] OpenAPI/Swagger specifications created before implementation
- [ ] RESTful conventions followed (GET, POST, PUT, PATCH, DELETE)
- [ ] Request/response schemas explicitly defined with validation
- [ ] Error responses follow consistent structure

**Status**: Will be satisfied in Phase 1 (contracts generation). All endpoints designed as RESTful resources.

### II. Specification-Driven Development ✅ PASS
- [x] User stories prioritized and independently testable
- [x] Functional requirements explicit with acceptance criteria
- [x] Technical plan documented and ready for review
- [x] Specification version controlled in `.specify/specs/001-body-recomp-goals/`

**Status**: Complete. Specification approved with 5 prioritized user stories (P1-P5).

### III. Test-First Development (NON-NEGOTIABLE) ✅ PASS
- [ ] Contract tests will validate API endpoints match OpenAPI specs
- [ ] Integration tests will verify end-to-end user journeys
- [ ] Tests written and fail before implementation
- [ ] Red-Green-Refactor cycle enforced

**Status**: Will be satisfied during implementation. Test structure planned in tasks.md phase.

### IV. Data Privacy & Security First ✅ PASS
- [ ] Authentication required for all user data endpoints
- [ ] Authorization enforces user data isolation
- [ ] Passwords hashed using bcrypt/Argon2
- [ ] Personal health information encrypted at rest
- [ ] API keys/secrets in environment variables only
- [ ] All data access logged for audit trails

**Status**: Will be satisfied. JWT authentication planned, PostgreSQL encryption at rest, user isolation via foreign keys and API middleware.

### V. Simplicity & Maintainability ✅ PASS
- [x] Using proven technologies (FastAPI, PostgreSQL, SQLAlchemy)
- [x] Dependencies justified (FastAPI for async API, SQLAlchemy for ORM, Pydantic for validation)
- [x] No premature optimization
- [x] Clear naming and structure planned

**Status**: Technology choices align with simplicity principle. No over-engineering detected.

**Overall Gate Status**: ✅ **PASS** - All principles will be satisfied. No violations requiring justification.

---

## Phase 0: Research (Complete)

**Output**: [research.md](research.md)

**Completed Research**:
- ✅ Body fat calculation methods (Navy, 3-Site, 7-Site Skinfold formulas)
- ✅ Caloric recommendations (Mifflin-St Jeor BMR + TDEE + goal adjustments)
- ✅ Timeline projections (evidence-based rate limits)
- ✅ Progress visualization (time-series line charts with trend analysis)
- ✅ FastAPI architecture patterns (layered with dependency injection)
- ✅ PostgreSQL schema design (normalized relational with foreign keys)
- ✅ Authentication strategy (JWT tokens with refresh pattern)
- ✅ Testing strategy (contract, integration, unit layers)
- ✅ Error handling approach (Pydantic validation + custom exceptions)
- ✅ Deployment configuration (Docker + docker-compose + environment variables)

---

## Phase 1: Design & Contracts (Complete)

**Outputs**:
- ✅ [data-model.md](data-model.md) - Complete entity definitions with validation rules
- ✅ [contracts/openapi.yaml](contracts/openapi.yaml) - OpenAPI 3.0 specification with 17 endpoints
- ✅ [quickstart.md](quickstart.md) - End-to-end testing guide for all user stories
- ✅ Agent context updated (.github/copilot-instructions.md)

**Data Model Entities** (6 entities):
1. User - Authentication and profile
2. BodyMeasurement - Measurement snapshots with calculation method
3. Goal - Cutting/bulking objectives with targets
4. ProgressEntry - Weekly tracking logs
5. TrainingPlan - Exercise recommendations (JSONB)
6. DietPlan - Nutritional guidelines with macros

**API Endpoints** (17 total):
- Authentication: POST /auth/login, POST /auth/refresh
- Users: POST /users, GET /users/me, PATCH /users/me
- Measurements: POST /measurements
- Goals: POST /goals, GET /goals/{id}
- Progress: POST /goals/{id}/progress, GET /goals/{id}/progress, GET /goals/{id}/trends
- Plans: GET /goals/{id}/training-plan, GET /goals/{id}/diet-plan

---

## Post-Phase 1 Constitution Re-Check

### I. API-First Design ✅ PASS
- [x] OpenAPI 3.0 specification created (contracts/openapi.yaml)
- [x] 17 RESTful endpoints defined with proper HTTP methods
- [x] All request/response schemas explicitly defined with Pydantic models
- [x] Error responses documented (400, 401, 403, 404, 422, 500)
- [x] JWT Bearer authentication documented
- [x] Follows resource-oriented URL pattern (/users, /goals, /measurements)

**Status**: ✅ Fully compliant. OpenAPI spec ready for frontend and contract testing.

### II. Specification-Driven Development ✅ PASS
- [x] Complete specification with 5 prioritized user stories
- [x] Technical plan documents architecture and design decisions
- [x] Data model defines all entities and relationships
- [x] Quickstart provides end-to-end test scenarios

**Status**: ✅ Fully compliant. Ready for implementation phase.

### III. Test-First Development (NON-NEGOTIABLE) ✅ PASS
- [x] Contract test structure defined (tests/contract/)
- [x] Integration test scenarios documented (tests/integration/)
- [x] Unit test targets identified (tests/unit/)
- [x] Quickstart provides test scenarios for all user stories
- [x] OpenAPI spec enables automated contract testing (Schemathesis)

**Status**: ✅ Fully compliant. Test-first workflow can be enforced in implementation.

### IV. Data Privacy & Security First ✅ PASS
- [x] JWT authentication with access/refresh token pattern
- [x] User data isolation via user_id foreign keys
- [x] Password hashing (bcrypt) documented
- [x] PostgreSQL row-level security planned
- [x] Environment-based secrets (no hardcoded credentials)
- [x] Audit logging for data access
- [x] GDPR data export/deletion capabilities in data model
- [x] Body fat percentage validation prevents unrealistic values

**Status**: ✅ Fully compliant. Security architecture sound.

### V. Simplicity & Maintainability ✅ PASS
- [x] Using proven technologies (FastAPI, PostgreSQL, SQLAlchemy)
- [x] Straightforward layered architecture (API → Service → Model)
- [x] No unnecessary abstractions or patterns
- [x] Clear separation of concerns
- [x] Dependencies justified (FastAPI for async, SQLAlchemy for ORM, Pydantic for validation)
- [x] Simple Docker deployment strategy

**Status**: ✅ Fully compliant. No over-engineering detected.

**Final Gate Status**: ✅ **PASS** - All constitution principles satisfied in design phase. Ready to proceed to task breakdown.

## Project Structure

### Documentation (this feature)

```text
specs/001-body-recomp-goals/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── openapi.yaml     # OpenAPI 3.0 specification
│   └── schemas/         # Detailed request/response schemas
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── __init__.py
│   ├── dependencies.py      # Auth, DB session dependencies
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── users.py         # User profile endpoints
│   │   ├── measurements.py  # Body measurement endpoints
│   │   ├── goals.py         # Goal CRUD endpoints
│   │   ├── progress.py      # Progress tracking endpoints
│   │   └── plans.py         # Training/diet plan endpoints
│   └── main.py              # FastAPI app initialization
├── models/
│   ├── __init__.py
│   ├── user.py              # User SQLAlchemy model
│   ├── measurement.py       # BodyMeasurement model
│   ├── goal.py              # Goal model
│   ├── progress.py          # ProgressEntry model
│   ├── plan.py              # TrainingPlan, DietPlan models
│   └── enums.py             # GoalType, CalculationMethod enums
├── schemas/
│   ├── __init__.py
│   ├── user.py              # User Pydantic schemas
│   ├── measurement.py       # Measurement Pydantic schemas
│   ├── goal.py              # Goal Pydantic schemas
│   ├── progress.py          # Progress Pydantic schemas
│   └── plan.py              # Plan Pydantic schemas
├── services/
│   ├── __init__.py
│   ├── body_fat_calculator.py   # Body fat calculation logic
│   ├── goal_service.py          # Goal creation/management
│   ├── progress_service.py      # Progress tracking logic
│   ├── plan_generator.py        # Training/diet plan generation
│   └── validation_service.py    # Measurement validation
├── core/
│   ├── __init__.py
│   ├── config.py            # Settings management
│   ├── security.py          # JWT, password hashing
│   └── database.py          # DB connection, session
└── utils/
    ├── __init__.py
    └── constants.py         # Constants (min/max body fat, etc.)

tests/
├── contract/
│   ├── __init__.py
│   ├── test_users_api.py
│   ├── test_measurements_api.py
│   ├── test_goals_api.py
│   ├── test_progress_api.py
│   └── test_plans_api.py
├── integration/
│   ├── __init__.py
│   ├── test_cutting_journey.py
│   ├── test_bulking_journey.py
│   └── test_progress_tracking.py
└── unit/
    ├── __init__.py
    ├── test_body_fat_calculator.py
    ├── test_goal_service.py
    ├── test_progress_service.py
    └── test_plan_generator.py

alembic/
├── versions/
│   └── [migration files]
├── env.py
└── script.py.mako

Root files:
├── .env.example
├── .gitignore
├── alembic.ini
├── docker-compose.yml
├── Dockerfile
├── pyproject.toml          # Poetry dependencies
├── pytest.ini
└── README.md
```

**Structure Decision**: Single backend API project using FastAPI. Structure follows domain-driven design with clear separation:
- `api/`: HTTP layer (routers, dependencies)
- `models/`: Database models (SQLAlchemy)
- `schemas/`: Data validation (Pydantic)
- `services/`: Business logic (calculations, recommendations)
- `core/`: Cross-cutting concerns (auth, config, DB)
- `tests/`: Three-layer testing (contract, integration, unit)

This aligns with FastAPI best practices and supports independent testing of each user story.

## Complexity Tracking

> **No violations - this section intentionally left empty as all constitution checks passed.**

---

## Planning Summary

**Status**: ✅ **Phase 0 and Phase 1 Complete** - Ready for `/speckit.tasks`

### Deliverables

1. ✅ **research.md** - All technical decisions documented
2. ✅ **data-model.md** - 6 entities with complete validation rules
3. ✅ **contracts/openapi.yaml** - 17 RESTful endpoints fully specified
4. ✅ **quickstart.md** - End-to-end test scenarios for all 5 user stories
5. ✅ **Agent context updated** - GitHub Copilot instructions current

### Key Metrics

- **User Stories**: 5 (P1-P5), independently testable
- **API Endpoints**: 17 RESTful endpoints
- **Database Entities**: 6 tables with relationships
- **Calculation Methods**: 3 (Navy, 3-Site, 7-Site Skinfold)
- **Test Layers**: 3 (contract, integration, unit)
- **Constitution Compliance**: 5/5 principles satisfied

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | FastAPI 0.104+ | Async API with auto-generated OpenAPI |
| Database | PostgreSQL 15+ | Relational storage with strong consistency |
| ORM | SQLAlchemy 2.0+ | Database abstraction with async support |
| Validation | Pydantic 2.0+ | Request/response validation |
| Migrations | Alembic | Database schema versioning |
| Auth | python-jose + passlib | JWT tokens + bcrypt hashing |
| Testing | pytest + httpx | Async API testing |
| Container | Docker + docker-compose | Development environment |

### Next Steps

Run `/speckit.tasks` to generate detailed task breakdown organized by user story. This will create `tasks.md` with:
- Phase-by-phase implementation plan
- Exact file paths for each task
- Parallel execution opportunities
- Test-first workflow integration
- Independent story implementation support

**Branch**: `001-body-recomp-goals`  
**Estimated Implementation**: 4-6 weeks for MVP (P1-P2), 8-10 weeks for full feature set (P1-P5)
