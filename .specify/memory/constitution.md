<!--
  Sync Impact Report - Version 1.0.0
  ==================================
  Version Change: NEW → 1.0.0
  Change Type: MINOR (Initial constitution creation)
  Date: 2025-10-23
  
  Modified Principles: N/A (initial creation)
  Added Sections:
    - Core Principles (5 principles)
    - API-First Development
    - Security & Data Privacy
    - Quality Standards
    - Governance
  
  Removed Sections: N/A
  
  Templates Status:
    ✅ plan-template.md - Reviewed, compatible with constitution checks
    ✅ spec-template.md - Reviewed, aligns with user story and requirements approach
    ✅ tasks-template.md - Reviewed, supports test-first and independent story implementation
  
  Follow-up TODOs: None
  
  Rationale for Version 1.0.0:
    - Initial constitution creation for body-recomp-backend project
    - Establishes foundational principles for API-first backend development
    - MINOR bump (not 0.1.0) as this represents a complete, production-ready governance framework
-->

# Body Recomp Backend Constitution

## Core Principles

### I. API-First Design

Every feature MUST be designed as a RESTful API endpoint before implementation. API contracts define the interface between frontend and backend, ensuring clear boundaries and enabling independent development.

**Requirements**:
- OpenAPI/Swagger specifications MUST be created before implementation
- All endpoints MUST follow RESTful conventions (GET, POST, PUT, PATCH, DELETE)
- Request/response schemas MUST be explicitly defined with validation rules
- Error responses MUST follow consistent structure with meaningful HTTP status codes

**Rationale**: API-first design ensures frontend and backend teams can work in parallel, enables early validation of requirements, and provides living documentation that stays synchronized with implementation.

### II. Specification-Driven Development

All features MUST start with a complete specification defining user stories, acceptance criteria, and success metrics before any code is written. Implementation follows the SpecKit workflow: clarify → specify → plan → implement.

**Requirements**:
- User stories MUST be prioritized and independently testable
- Functional requirements MUST be explicit with clear acceptance criteria
- Technical plans MUST be reviewed and approved before implementation begins
- Specifications MUST be version controlled in `.specify/specs/[###-feature-name]/`

**Rationale**: Specification-driven development prevents scope creep, ensures stakeholder alignment, reduces rework, and provides clear acceptance criteria for validation.

### III. Test-First Development (NON-NEGOTIABLE)

Tests MUST be written and validated to fail before implementation begins. This ensures tests are meaningful and implementation is guided by requirements, not assumptions.

**Requirements**:
- Contract tests MUST validate API endpoints match OpenAPI specifications
- Integration tests MUST verify end-to-end user journeys
- Tests MUST be reviewed and approved to fail before implementation
- Red-Green-Refactor cycle: Failing test → Implementation → Passing test → Refactor
- No code merges without corresponding passing tests

**Rationale**: Test-first development ensures code meets requirements, catches regressions early, enables confident refactoring, and serves as executable documentation. This principle is NON-NEGOTIABLE as it fundamentally protects system quality and maintainability.

### IV. Data Privacy & Security First

User health data is sensitive and MUST be protected at every layer. Security and privacy are not optional features but foundational requirements.

**Requirements**:
- Authentication MUST be required for all user data endpoints
- Authorization MUST enforce user data isolation (users can only access their own data)
- Passwords MUST be hashed using industry-standard algorithms (bcrypt, Argon2)
- Personal health information MUST be encrypted at rest
- API keys and secrets MUST never be committed to version control
- All data access MUST be logged for audit trails

**Rationale**: Body recomposition involves personal health metrics (weight, body fat, measurements, photos) that users trust us to protect. A single data breach could compromise user privacy and project viability.

### V. Simplicity & Maintainability

Start with the simplest solution that meets requirements. Avoid premature optimization, over-engineering, and unnecessary abstractions. Prefer explicit code over clever code.

**Requirements**:
- Choose boring, proven technologies over cutting-edge frameworks
- Avoid adding dependencies unless clearly justified
- Keep functions small and focused (single responsibility)
- Use clear, descriptive names over comments
- YAGNI: You Aren't Gonna Need It - implement only what's specified
- DRY violations are acceptable until third occurrence (Rule of Three)

**Rationale**: Simple code is easier to understand, test, debug, and modify. Over-engineering creates technical debt and slows development. Complexity MUST be justified against real requirements, not hypothetical future needs.

## API-First Development

### RESTful Standards

- **Resource-oriented URLs**: Use nouns, not verbs (e.g., `/users/{id}/measurements`, not `/getUserMeasurements`)
- **HTTP methods semantics**: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)
- **Status codes**: 2xx success, 4xx client errors, 5xx server errors with meaningful messages
- **Versioning**: Use URL versioning (e.g., `/api/v1/`) for major breaking changes

### API Documentation

- All endpoints MUST be documented in OpenAPI 3.0+ format
- Documentation MUST include request/response examples
- Error cases MUST be documented with example responses
- Authentication requirements MUST be clearly specified

## Security & Data Privacy

### Authentication & Authorization

- JWT tokens for stateless authentication
- Token expiration and refresh mechanisms required
- Role-based access control (RBAC) where appropriate
- Rate limiting to prevent abuse

### Data Protection

- HTTPS/TLS required for all API communication
- Environment-based configuration for secrets (no hardcoded credentials)
- Regular security dependency updates
- Input validation and sanitization at API boundaries

### Compliance Considerations

- GDPR-style data export capabilities (users can download their data)
- Data deletion capabilities (users can request account deletion)
- Privacy policy and terms of service endpoints

## Quality Standards

### Code Quality

- Linting and formatting tools configured and enforced
- Code review required before merge
- No direct commits to main branch
- Clear commit messages following conventional commits format

### Testing Requirements

- Contract tests for all API endpoints
- Integration tests for critical user journeys  
- Minimum test coverage thresholds enforced (to be defined per project phase)
- Tests run automatically in CI/CD pipeline

### Documentation Requirements

- README with setup instructions
- API documentation auto-generated from OpenAPI specs
- Inline code comments for complex business logic
- Architecture decision records (ADRs) for significant technical choices

## Governance

This constitution supersedes all other development practices and MUST be followed for all features and changes. Any deviation requires explicit justification documented in the feature's Complexity Tracking section.

### Amendment Process

- Constitution changes require proposal with clear rationale
- Version increments follow semantic versioning:
  - **MAJOR**: Backward-incompatible principle removals or redefinitions
  - **MINOR**: New principles or materially expanded guidance
  - **PATCH**: Clarifications, typos, non-semantic refinements
- Amendment proposals MUST identify affected templates and provide migration guidance
- Amendments MUST be propagated to all dependent templates and documentation

### Compliance Verification

- All specification reviews MUST include constitution compliance check
- All implementation plans MUST document adherence to principles
- Any complexity or principle violations MUST be justified in Complexity Tracking table
- Code reviews MUST verify test-first development was followed

### Template Synchronization

- Core templates (plan-template.md, spec-template.md, tasks-template.md) MUST align with principles
- Constitution updates trigger template review and updates as needed
- Agent prompt files MUST reference current constitution version

**Version**: 1.0.0 | **Ratified**: 2025-10-23 | **Last Amended**: 2025-10-23
