# Implementation Plan: React Native Mobile Application

**Branch**: `002-react-native-mobile-app` | **Date**: 2025-11-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-react-native-mobile-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a cross-platform mobile application using React Native with Expo and Gluestack UI library that provides a complete user interface for the body recomposition tracking system. The app will handle user authentication, body measurement entry with multiple calculation methods, goal creation (cutting/bulking), weekly progress tracking, and visualization of progress trends. The app communicates with an existing backend API and provides offline-capable data caching with graceful error handling.

## Technical Context

**Language/Version**: JavaScript/TypeScript with React Native via Expo SDK 51+  
**Primary Dependencies**: 
- Expo (managed workflow for cross-platform development)
- Gluestack UI v2 (component library for consistent UI)
- React Navigation v6 (navigation framework)
- Axios (HTTP client for API communication)
- React Query/TanStack Query (data fetching and caching)
- Expo SecureStore (secure token storage)
- Victory Native or React Native Chart Kit (data visualization)
- Zod (schema validation)
- React Hook Form (form management)

**Storage**: 
- Expo SecureStore for authentication tokens
- AsyncStorage for user preferences and offline data cache
- No local database required (API is source of truth)

**Testing**: 
- Jest (unit testing)
- React Native Testing Library (component testing)
- Detox or Maestro (E2E testing)
- TypeScript for type safety

**Target Platform**: 
- iOS 13.4+ (via Expo Go or standalone build)
- Android 6.0+ (API 23+) (via Expo Go or standalone build)
- Expo managed workflow for rapid development

**Project Type**: Mobile application (React Native + Expo)

**Performance Goals**: 
- 60 FPS during navigation and scrolling
- App startup < 3 seconds with valid token
- API response handling < 2 seconds (with loading states)
- Smooth animations and transitions
- Bundle size < 50MB per platform

**Constraints**: 
- Offline-capable with graceful degradation
- Must work on devices with 4.7" to 6.9" screens
- Memory footprint < 150MB during normal operation
- Storage < 100MB including cache after 30 days
- Network efficiency (minimize API calls, cache appropriately)

**Scale/Scope**: 
- 8 main screens (Auth, Dashboard, Measurements, Goals, Progress, Plans, Profile)
- ~15-20 components/screens total
- Support for ~10k concurrent users (backend capacity)
- Estimated ~5k-8k LOC TypeScript
- 3 navigation stacks (Auth, Main App, Settings)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. API-First Design ✅ PASS

**Status**: PASS - Backend API already exists  
**Evidence**: Feature spec assumes existing RESTful API with endpoints for auth, measurements, goals, and plans. Mobile app is a client consuming existing OpenAPI-documented endpoints from feature 001-body-recomp-goals.  
**Action**: Reference existing OpenAPI spec from feature 001 in contracts/ folder

### II. Specification-Driven Development ✅ PASS

**Status**: PASS  
**Evidence**: Complete specification created with prioritized user stories (P1-P8), functional requirements (FR-001 to FR-030), and measurable success criteria. Following SpecKit workflow: specify → plan → implement.

### III. Test-First Development (NON-NEGOTIABLE) ✅ PASS

**Status**: PASS - Will be enforced  
**Plan**: 
- E2E tests for each user story will be written first using Detox/Maestro
- Component tests using React Native Testing Library before implementation
- Integration tests for API client and state management
- Tests will validate against functional requirements from spec
- Red-Green-Refactor cycle enforced in tasks.md

### IV. Data Privacy & Security First ✅ PASS

**Status**: PASS  
**Evidence**:
- FR-004: Secure token storage using Expo SecureStore
- FR-007: All data operations through authenticated API
- FR-028: Token refresh mechanism
- No sensitive data stored locally (API is source of truth)
- Backend handles authentication and authorization (existing from feature 001)

### V. Simplicity & Maintainability ✅ PASS

**Status**: PASS  
**Evidence**:
- Using Expo managed workflow (boring, proven tech)
- Gluestack UI for consistent, well-documented components
- Standard React patterns (hooks, context, components)
- No over-engineering: simple state management with React Query
- Clear separation: UI components, API client, navigation
- TypeScript for type safety without complexity

**Re-check After Phase 1**: Will verify API contracts match backend, data model is simple and maps to API responses

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
mobile/                           # React Native app (separate from backend)
├── app/                         # Expo Router app directory (file-based routing)
│   ├── (auth)/                  # Auth stack
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                  # Main app tabs
│   │   ├── index.tsx            # Dashboard
│   │   ├── measurements.tsx
│   │   ├── goals.tsx
│   │   ├── progress.tsx
│   │   └── _layout.tsx
│   ├── profile/
│   │   ├── index.tsx
│   │   ├── edit.tsx
│   │   └── settings.tsx
│   ├── _layout.tsx              # Root layout
│   └── +not-found.tsx
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── common/              # Generic components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── measurements/        # Measurement-specific
│   │   │   ├── MeasurementForm.tsx
│   │   │   ├── MethodSelector.tsx
│   │   │   └── MeasurementCard.tsx
│   │   ├── goals/               # Goal-specific
│   │   │   ├── GoalForm.tsx
│   │   │   ├── GoalCard.tsx
│   │   │   └── GoalTypeSelector.tsx
│   │   ├── progress/            # Progress-specific
│   │   │   ├── ProgressChart.tsx
│   │   │   ├── ProgressCard.tsx
│   │   │   └── TrendChart.tsx
│   │   └── charts/              # Chart components
│   │       └── BodyFatChart.tsx
│   ├── services/                # API and business logic
│   │   ├── api/
│   │   │   ├── client.ts        # Axios instance
│   │   │   ├── auth.ts          # Auth endpoints
│   │   │   ├── measurements.ts  # Measurement endpoints
│   │   │   ├── goals.ts         # Goal endpoints
│   │   │   ├── progress.ts      # Progress endpoints
│   │   │   └── plans.ts         # Plans endpoints
│   │   ├── storage/
│   │   │   ├── secureStore.ts   # Token storage
│   │   │   └── asyncStorage.ts  # Preferences/cache
│   │   └── validation/
│   │       ├── schemas.ts       # Zod schemas
│   │       └── validators.ts    # Custom validators
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useMeasurements.ts
│   │   ├── useGoals.ts
│   │   ├── useProgress.ts
│   │   └── useOffline.ts
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── types/                   # TypeScript types
│   │   ├── api.ts               # API response types
│   │   ├── models.ts            # Domain models
│   │   └── navigation.ts        # Navigation types
│   ├── utils/                   # Utility functions
│   │   ├── formatting.ts
│   │   ├── calculations.ts
│   │   └── dates.ts
│   └── constants/               # Constants
│       ├── config.ts            # App configuration
│       └── theme.ts             # Gluestack theme
├── __tests__/
│   ├── e2e/                     # E2E tests (Detox/Maestro)
│   │   ├── auth.e2e.ts
│   │   ├── measurements.e2e.ts
│   │   ├── goals.e2e.ts
│   │   └── progress.e2e.ts
│   ├── integration/             # Integration tests
│   │   ├── api-client.test.ts
│   │   └── navigation.test.ts
│   └── unit/                    # Unit tests
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── utils/
├── assets/                      # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
├── app.json                     # Expo configuration
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── README.md
```

**Structure Decision**: Using Expo Router (file-based routing) with separate mobile/ directory from backend. This creates a clear separation between the API (existing backend/) and the mobile client. The structure follows React Native + Expo best practices with:
- `app/` for file-based routing (Expo Router)
- `src/` for reusable code organized by function
- Feature-based component organization under `components/`
- API services separated by domain
- Comprehensive testing structure (E2E, integration, unit)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution principles are satisfied.

---

## Phase 0: Research ✅

**Goal**: Validate technology choices and define technical architecture for React Native mobile app using Expo and Gluestack UI.

### Completed Tasks
- [x] Evaluate React Native framework options (Expo managed vs bare workflow vs alternatives)
- [x] Research UI component libraries compatible with React Native (Gluestack UI vs NativeBase vs React Native Paper)
- [x] Define navigation strategy (Expo Router vs React Navigation)
- [x] Choose state management approach (React Query for server state)
- [x] Select HTTP client and configure interceptors (Axios with JWT token management)
- [x] Define form management strategy (React Hook Form + Zod validation)
- [x] Research secure storage options for tokens (Expo SecureStore)
- [x] Evaluate charting libraries for body composition trends (Victory Native)
- [x] Define testing strategy (Maestro E2E + RNTL + Jest)
- [x] Plan offline support approach (React Query offline mode + AsyncStorage)
- [x] Document deployment strategy (EAS Build + EAS Update)

**Documentation**: See [`research.md`](./research.md) for detailed technical decisions and rationale.

**Key Decisions**:
- **Framework**: Expo SDK 51+ with managed workflow (rapid development, OTA updates)
- **UI Library**: Gluestack UI v2 (modern design system, accessibility, TypeScript-first)
- **Navigation**: Expo Router (file-based routing, type-safe, deep linking support)
- **Server State**: React Query v5 (caching, optimistic updates, offline support)
- **Forms**: React Hook Form + Zod (performance, validation, type safety)
- **Charts**: Victory Native (SVG-based, customizable, mobile-optimized)
- **Testing**: Maestro (E2E), React Native Testing Library (components), Jest (unit tests)

---

## Phase 1: Data Model & Contracts

**Goal**: Define TypeScript types, Zod schemas, and API contracts that align with existing backend endpoints.

### Tasks

#### 1.1 API Client Setup
- [ ] Create `mobile/src/api/client.ts` with Axios instance configuration
  - Base URL configuration (development vs production)
  - Request/response interceptors for JWT token injection
  - Automatic token refresh logic on 401 responses
  - Timeout configuration (30 seconds)
  - Error handling and logging
- [ ] Create `mobile/src/api/types.ts` with base API types
  - `ApiResponse<T>`, `ApiError`, `PaginatedResponse<T>`
  - HTTP status code types
  - Common error response shapes

#### 1.2 Authentication Contracts
- [ ] Define auth types in `mobile/src/features/auth/types.ts`
  - `LoginRequest`, `LoginResponse`, `RegisterRequest`, `RegisterResponse`
  - `TokenPair` (access + refresh tokens)
  - `User` (id, email, name, profile data)
- [ ] Create Zod schemas in `mobile/src/features/auth/schemas.ts`
  - `loginSchema` (email + password validation)
  - `registerSchema` (email, password, confirmPassword, terms acceptance)
  - Password strength validation (min 8 chars, uppercase, number, special char)
- [ ] Document auth endpoints in `mobile/src/features/auth/api.ts`
  - `POST /api/auth/register` → User registration
  - `POST /api/auth/login` → JWT token pair
  - `POST /api/auth/refresh` → New access token
  - `POST /api/auth/logout` → Invalidate refresh token

#### 1.3 Measurements Contracts
- [ ] Define measurement types in `mobile/src/features/measurements/types.ts`
  - `Measurement` (id, userId, date, weight, bodyFat, photos, measurements)
  - `BodyMeasurements` (chest, waist, hips, biceps, thighs, calves)
  - `CreateMeasurementRequest`, `UpdateMeasurementRequest`
- [ ] Create Zod schemas in `mobile/src/features/measurements/schemas.ts`
  - `measurementSchema` (weight validation, body fat % range, optional measurements)
  - Date validation (cannot be future date)
  - Number validation (positive values, reasonable ranges)
- [ ] Document measurement endpoints in `mobile/src/features/measurements/api.ts`
  - `POST /api/measurements` → Create new measurement
  - `GET /api/measurements?startDate=&endDate=` → List measurements
  - `GET /api/measurements/:id` → Get single measurement
  - `PUT /api/measurements/:id` → Update measurement
  - `DELETE /api/measurements/:id` → Delete measurement

#### 1.4 Goals Contracts
- [ ] Define goal types in `mobile/src/features/goals/types.ts`
  - `Goal` (id, userId, type: CUTTING|BULKING, startDate, endDate, targetWeight, currentWeight, status: ACTIVE|COMPLETED|CANCELLED)
  - `CreateGoalRequest`, `UpdateGoalRequest`
  - `GoalProgress` (startWeight, currentWeight, targetWeight, percentComplete)
- [ ] Create Zod schemas in `mobile/src/features/goals/schemas.ts`
  - `goalSchema` (type validation, date range validation, target weight validation)
  - Business rule: end date must be after start date
  - Business rule: target weight must be different from start weight
  - Business rule: CUTTING → target < current, BULKING → target > current
- [ ] Document goal endpoints in `mobile/src/features/goals/api.ts`
  - `POST /api/goals` → Create new goal
  - `GET /api/goals?status=ACTIVE` → List goals
  - `GET /api/goals/:id` → Get single goal
  - `PUT /api/goals/:id` → Update goal
  - `DELETE /api/goals/:id` → Cancel goal
  - `GET /api/goals/:id/progress` → Get goal progress with trend data

#### 1.5 Progress Tracking Contracts
- [ ] Define progress types in `mobile/src/features/progress/types.ts`
  - `ProgressEntry` (id, goalId, date, weight, bodyFat, notes, photos)
  - `ProgressTrend` (dates[], weights[], bodyFats[], trendline data)
  - `CreateProgressRequest`
- [ ] Create Zod schemas in `mobile/src/features/progress/schemas.ts`
  - `progressSchema` (weight, body fat, date validation)
  - Photo upload validation (max size, allowed types)
- [ ] Document progress endpoints in `mobile/src/features/progress/api.ts`
  - `POST /api/goals/:goalId/progress` → Log progress entry
  - `GET /api/goals/:goalId/progress` → Get progress history
  - `GET /api/goals/:goalId/trend` → Get trend data for charts

#### 1.6 Plans Contracts
- [ ] Define plan types in `mobile/src/features/plans/types.ts`
  - `Plan` (id, goalId, type: TRAINING|DIET, generatedDate, content)
  - `TrainingPlan` (exercises[], sets, reps, rest periods)
  - `DietPlan` (meals[], calories, macros, foods)
- [ ] Document plan endpoints in `mobile/src/features/plans/api.ts`
  - `GET /api/goals/:goalId/plans?type=TRAINING|DIET` → Get generated plans
  - `POST /api/goals/:goalId/plans/regenerate` → Request plan regeneration

#### 1.7 Profile Contracts
- [ ] Define profile types in `mobile/src/features/profile/types.ts`
  - `UserProfile` (id, email, name, dateOfBirth, gender: MALE|FEMALE|OTHER, height, activityLevel: SEDENTARY|LIGHT|MODERATE|ACTIVE|VERY_ACTIVE)
  - `UpdateProfileRequest`
- [ ] Create Zod schemas in `mobile/src/features/profile/schemas.ts`
  - `profileSchema` (name, date of birth, gender, height, activity level)
  - Age validation (must be 13+)
  - Height validation (reasonable range in cm)
- [ ] Document profile endpoints in `mobile/src/features/profile/api.ts`
  - `GET /api/profile` → Get user profile
  - `PUT /api/profile` → Update profile
  - `DELETE /api/profile` → Delete account

#### 1.8 React Query Hooks Setup
- [ ] Create query hooks in `mobile/src/features/*/queries.ts` for each feature
  - Use proper query keys with dependencies (`['goals', 'list', { status }]`)
  - Configure staleTime based on data volatility (auth: 5min, measurements: 1min, goals: 1min)
  - Implement optimistic updates for mutations
  - Add error handling and retry logic
- [ ] Create mutation hooks for create/update/delete operations
  - Invalidate related queries on success
  - Implement optimistic UI updates
  - Handle error states properly

#### 1.9 API Integration Testing
- [ ] Create MSW (Mock Service Worker) handlers for testing
- [ ] Write integration tests for each API client function
- [ ] Test token refresh flow
- [ ] Test error handling (network errors, 401, 403, 500)
- [ ] Test offline behavior

**Outputs**:
- `mobile/src/api/` directory with client configuration
- `mobile/src/features/*/types.ts` with TypeScript types for all features
- `mobile/src/features/*/schemas.ts` with Zod validation schemas
- `mobile/src/features/*/api.ts` with API client functions
- `mobile/src/features/*/queries.ts` with React Query hooks
- Unit tests for all API functions and schemas

**Validation**:
- All API contracts match existing backend endpoints (verify with backend OpenAPI/Swagger docs)
- All types are strongly typed with no `any` types
- All Zod schemas validate expected inputs
- All React Query hooks have proper cache invalidation
- Token refresh flow works correctly (test with expired tokens)
- Offline mode works (test by disabling network)
