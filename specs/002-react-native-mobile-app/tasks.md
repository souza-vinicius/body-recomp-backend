# Tasks: React Native Mobile Application

**Branch**: `002-react-native-mobile-app`  
**Input**: Design documents from `/specs/002-react-native-mobile-app/`  
**Prerequisites**: plan.md, spec.md, research.md

**Organization**: Tasks are grouped by user story (P1-P8 from spec.md) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize React Native mobile project with Expo and configure development environment

- [x] T001 Initialize Expo project with TypeScript in mobile/ directory using `npx create-expo-app mobile --template expo-template-blank-typescript`
- [x] T002 Install core dependencies: @gluestack-ui/themed, expo-router, @tanstack/react-query, axios, zod, react-hook-form
- [x] T003 [P] Configure TypeScript with strict mode in mobile/tsconfig.json
- [x] T004 [P] Configure Babel and Metro bundler in mobile/babel.config.js and mobile/metro.config.js
- [x] T005 [P] Setup Expo Router file-based routing structure in mobile/app/ directory
- [x] T006 [P] Configure Gluestack UI theme and provider in mobile/src/constants/theme.ts
- [x] T007 [P] Setup ESLint and Prettier configuration files in mobile/.eslintrc.js and mobile/.prettierrc
- [x] T008 [P] Create mobile/app.json with app name, slug, version, and platform configurations
- [x] T009 [P] Setup environment configuration in mobile/src/constants/config.ts for API base URLs
- [x] T010 [P] Create directory structure: mobile/src/{components,services,hooks,contexts,types,utils,constants}
- [x] T011 [P] Initialize Git in mobile/ with appropriate .gitignore for React Native/Expo
- [x] T012 [P] Create mobile/README.md with setup and running instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### API Client & Types

- [x] T013 Create base API types in mobile/src/types/api.ts with ApiResponse<T>, ApiError, PaginatedResponse<T>
- [x] T014 Create Axios client instance in mobile/src/services/api/client.ts with base URL and timeout configuration
- [x] T015 Implement request interceptor in mobile/src/services/api/client.ts to inject JWT tokens from SecureStore
- [x] T016 Implement response interceptor in mobile/src/services/api/client.ts for error handling and logging
- [x] T017 Implement automatic token refresh logic in mobile/src/services/api/client.ts on 401 responses
- [x] T018 [P] Create secure storage service in mobile/src/services/storage/secureStore.ts for token management
- [x] T019 [P] Create async storage service in mobile/src/services/storage/asyncStorage.ts for cache and preferences

### Navigation & Layouts

- [x] T020 Create root layout in mobile/app/_layout.tsx with React Query provider and Gluestack UI provider
- [x] T021 Create auth layout in mobile/app/(auth)/_layout.tsx for authentication screens
- [x] T022 Create tabs layout in mobile/app/(tabs)/_layout.tsx with tab navigation configuration
- [x] T023 Create not-found screen in mobile/app/+not-found.tsx

### Common Components

- [x] T024 [P] Create Button component in mobile/src/components/common/Button.tsx using Gluestack UI
- [x] T025 [P] Create Input component in mobile/src/components/common/Input.tsx using Gluestack UI
- [x] T026 [P] Create Card component in mobile/src/components/common/Card.tsx using Gluestack UI
- [x] T027 [P] Create LoadingSpinner component in mobile/src/components/common/LoadingSpinner.tsx
- [x] T028 [P] Create ErrorMessage component in mobile/src/components/common/ErrorMessage.tsx

### Utilities & Helpers

- [x] T029 [P] Create date formatting utilities in mobile/src/utils/dates.ts
- [x] T030 [P] Create number/measurement formatting utilities in mobile/src/utils/formatting.ts
- [x] T031 [P] Create body fat calculation utilities in mobile/src/utils/calculations.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to register, login, logout, and maintain authenticated sessions

**Independent Test**: Launch app → Register with email/password → Logout → Login with same credentials → See dashboard

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T032 [P] [US1] E2E test for registration flow in mobile/__tests__/e2e/auth.e2e.ts using Maestro
- [ ] T033 [P] [US1] E2E test for login flow in mobile/__tests__/e2e/auth.e2e.ts using Maestro
- [ ] T034 [P] [US1] E2E test for logout flow in mobile/__tests__/e2e/auth.e2e.ts using Maestro
- [ ] T035 [P] [US1] Integration test for token refresh in mobile/__tests__/integration/api-client.test.ts

### Types & Schemas for User Story 1

- [x] T036 [P] [US1] Define auth types in mobile/src/types/auth.ts: LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, TokenPair, User
- [x] T037 [P] [US1] Create login Zod schema in mobile/src/services/validation/schemas.ts with email and password validation
- [x] T038 [P] [US1] Create registration Zod schema in mobile/src/services/validation/schemas.ts with password strength validation (min 8 chars, uppercase, number, special char)
- [x] T039 [P] [US1] Define navigation types for auth flow in mobile/src/types/navigation.ts

### API Integration for User Story 1

- [x] T040 [P] [US1] Implement auth API functions in mobile/src/services/api/auth.ts: register(), login(), logout(), refreshToken()
- [x] T041 [US1] Create useAuth hook in mobile/src/hooks/useAuth.ts with login, logout, register mutations using React Query
- [x] T042 [US1] Create AuthContext in mobile/src/contexts/AuthContext.tsx for global auth state management

### UI Implementation for User Story 1

- [x] T043 [P] [US1] Create registration screen in mobile/app/(auth)/register.tsx with form using React Hook Form
- [x] T044 [P] [US1] Create login screen in mobile/app/(auth)/login.tsx with form using React Hook Form
- [x] T045 [US1] Add email/password validation and error display to registration screen
- [x] T046 [US1] Add email/password validation and error display to login screen
- [x] T047 [US1] Implement auth guard in mobile/app/(tabs)/_layout.tsx to redirect unauthenticated users
- [x] T048 [US1] Add logout functionality to profile/settings screen
- [x] T049 [US1] Implement auto-login on app launch if valid token exists in root layout

**Checkpoint**: User Story 1 complete - Users can register, login, logout, and maintain sessions

---

## Phase 4: User Story 2 - Initial Body Measurement Entry (Priority: P2)

**Goal**: Enable authenticated users to enter their first body measurements with method selection and body fat calculation

**Independent Test**: After completing registration (US1) → Navigate to measurements → Select calculation method → Enter measurements → See calculated body fat percentage

### Tests for User Story 2

- [ ] T050 [P] [US2] E2E test for measurement entry with Navy Method in mobile/__tests__/e2e/measurements.e2e.ts
- [ ] T051 [P] [US2] E2E test for measurement entry with 3-Site Skinfold in mobile/__tests__/e2e/measurements.e2e.ts
- [ ] T052 [P] [US2] E2E test for measurement entry with 7-Site Skinfold in mobile/__tests__/e2e/measurements.e2e.ts
- [ ] T053 [P] [US2] Unit test for body fat calculation utilities in mobile/__tests__/unit/utils/calculations.test.ts

### Types & Schemas for User Story 2

- [x] T054 [P] [US2] Define measurement types in mobile/src/types/measurements.ts: Measurement, BodyMeasurements, CreateMeasurementRequest, CalculationMethod
- [x] T055 [P] [US2] Create measurement Zod schema in mobile/src/services/validation/schemas.ts with weight, body fat range, and measurement validation
- [x] T056 [P] [US2] Add measurement navigation types in mobile/src/types/navigation.ts

### API Integration for User Story 2

- [x] T057 [P] [US2] Implement measurement API functions in mobile/src/services/api/measurements.ts: createMeasurement(), getMeasurements(), getMeasurement(), updateMeasurement(), deleteMeasurement()
- [x] T058 [US2] Create useMeasurements hook in mobile/src/hooks/useMeasurements.ts with queries and mutations using React Query
- [x] T059 [US2] Configure React Query cache invalidation for measurements in mobile/src/hooks/useMeasurements.ts

### UI Components for User Story 2

- [x] T060 [P] [US2] Create MethodSelector component in mobile/src/components/measurements/MethodSelector.tsx for Navy/3-Site/7-Site selection
- [x] T061 [P] [US2] Create MeasurementForm component in mobile/src/components/measurements/MeasurementForm.tsx with dynamic fields based on method
- [x] T062 [P] [US2] Create MeasurementCard component in mobile/src/components/measurements/MeasurementCard.tsx to display measurement results
- [x] T063 [US2] Create measurements screen in mobile/app/(tabs)/measurements.tsx with method selection and form
- [x] T064 [US2] Implement gender-specific field logic in MeasurementForm (3-Site differs by gender)
- [x] T065 [US2] Add measurement input validation (positive values, reasonable ranges)
- [x] T066 [US2] Display calculated body fat percentage after successful measurement submission
- [x] T067 [US2] Add loading states and error handling for measurement submission

**Checkpoint**: User Story 2 complete - Users can enter measurements and see calculated body fat percentage

---

## Phase 5: User Story 3 - Create Cutting Goal (Priority: P3)

**Goal**: Enable users with baseline measurements to create a cutting goal with target body fat and receive caloric recommendations

**Independent Test**: After completing measurements (US2) → Navigate to goals → Select "Cutting" → Set target body fat below current → See goal details with timeline and calorie recommendations

### Tests for User Story 3

- [ ] T068 [P] [US3] E2E test for cutting goal creation in mobile/__tests__/e2e/goals.e2e.ts
- [ ] T069 [P] [US3] E2E test for unsafe target validation in mobile/__tests__/e2e/goals.e2e.ts (below 8% men, 15% women)
- [ ] T070 [P] [US3] E2E test for duplicate active goal prevention in mobile/__tests__/e2e/goals.e2e.ts

### Types & Schemas for User Story 3

- [x] T071 [P] [US3] Define goal types in mobile/src/types/goals.ts: Goal, CreateGoalRequest, UpdateGoalRequest, GoalProgress, GoalType (CUTTING|BULKING), GoalStatus
- [x] T072 [P] [US3] Create goal Zod schema in mobile/src/services/validation/schemas.ts with business rules (end date after start, target < current for cutting, safe limits)
- [x] T073 [P] [US3] Add goal navigation types in mobile/src/types/navigation.ts

### API Integration for User Story 3

- [x] T074 [P] [US3] Implement goal API functions in mobile/src/services/api/goals.ts: createGoal(), getGoals(), getGoal(), updateGoal(), cancelGoal(), getGoalProgress()
- [x] T075 [US3] Create useGoals hook in mobile/src/hooks/useGoals.ts with queries and mutations using React Query
- [x] T076 [US3] Configure optimistic updates for goal mutations in mobile/src/hooks/useGoals.ts

### UI Components for User Story 3

- [x] T077 [P] [US3] Create GoalTypeSelector component in mobile/src/components/goals/GoalTypeSelector.tsx for Cutting/Bulking selection
- [x] T078 [P] [US3] Create GoalForm component in mobile/src/components/goals/GoalForm.tsx with target selection and date pickers
- [x] T079 [P] [US3] Create GoalCard component in mobile/src/components/goals/GoalCard.tsx to display goal details
- [x] T080 [US3] Create goals screen in mobile/app/(tabs)/goals.tsx with goal type selection and form
- [x] T081 [US3] Implement cutting goal validation (target must be lower than current body fat)
- [x] T082 [US3] Implement unsafe target prevention (below 8% men, 15% women) with error message
- [x] T083 [US3] Display goal details: timeline, milestones, recommended daily calories with deficit
- [x] T084 [US3] Add one active goal constraint validation
- [x] T085 [US3] Add loading states and error handling for goal creation

**Checkpoint**: User Story 3 complete - Users can create cutting goals with caloric recommendations

---

## Phase 6: User Story 4 - Weekly Progress Tracking (Priority: P4)

**Goal**: Enable users with active goals to log weekly measurements and see progress toward their goal

**Independent Test**: After creating a goal (US3) → Wait 7+ days (or simulate) → Log new measurements → See updated body fat, progress percentage, and trend chart

### Tests for User Story 4

- [ ] T086 [P] [US4] E2E test for weekly progress logging in mobile/__tests__/e2e/progress.e2e.ts
- [ ] T087 [P] [US4] E2E test for 7-day interval enforcement in mobile/__tests__/e2e/progress.e2e.ts
- [ ] T088 [P] [US4] E2E test for goal completion detection in mobile/__tests__/e2e/progress.e2e.ts

### Types & Schemas for User Story 4

- [X] T089 [P] [US4] Define progress types in mobile/src/types/progress.ts: ProgressEntry, ProgressTrend, CreateProgressRequest
- [X] T090 [P] [US4] Create progress Zod schema in mobile/src/services/validation/schemas.ts with date and measurement validation
- [X] T091 [P] [US4] Add progress navigation types in mobile/src/types/navigation.ts

### API Integration for User Story 4

- [X] T092 [P] [US4] Implement progress API functions in mobile/src/services/api/progress.ts: logProgress(), getProgressHistory(), getProgressTrend()
- [X] T093 [US4] Create useProgress hook in mobile/src/hooks/useProgress.ts with queries and mutations using React Query
- [X] T094 [US4] Configure cache invalidation for progress updates affecting goal progress

### UI Components for User Story 4

- [X] T095 [P] [US4] Create ProgressChart component in mobile/src/components/progress/ProgressChart.tsx using Victory Native for body fat trend
- [X] T096 [P] [US4] Create ProgressCard component in mobile/src/components/progress/ProgressCard.tsx to display single progress entry
- [X] T097 [P] [US4] Create TrendChart component in mobile/src/components/progress/TrendChart.tsx for weight and body fat trends
- [X] T098 [US4] Create progress screen in mobile/app/(tabs)/progress.tsx with measurement entry form
- [X] T099 [US4] Implement 7-day interval validation (client-side check before submission)
- [X] T100 [US4] Display updated body fat percentage and progress percentage after submission
- [X] T101 [US4] Render trend chart showing historical body fat data
- [X] T102 [US4] Display positive feedback message when user makes progress
- [X] T103 [US4] Implement goal completion detection and celebration screen
- [X] T104 [US4] Add loading states and error handling for progress logging

**Checkpoint**: User Story 4 complete - Users can track weekly progress and see trends

---

## Phase 7: User Story 5 - View Progress Dashboard (Priority: P5)

**Goal**: Provide users with an at-a-glance view of their current goal status, latest metrics, and progress visualization

**Independent Test**: After logging progress (US4) → Open app → Land on dashboard → See current goal, latest body fat, progress percentage, and trend chart

### Tests for User Story 5

- [ ] T105 [P] [US5] E2E test for dashboard with active goal in mobile/__tests__/e2e/dashboard.e2e.ts
- [ ] T106 [P] [US5] E2E test for dashboard with no active goal in mobile/__tests__/e2e/dashboard.e2e.ts

### UI Implementation for User Story 5

- [X] T107 [US5] Create dashboard screen in mobile/app/(tabs)/index.tsx as home screen
- [X] T108 [US5] Display current active goal details: type, current body fat, target, status
- [X] T109 [US5] Display progress percentage with visual progress bar
- [X] T110 [US5] Display timeline information (start date, end date, days remaining)
- [X] T111 [US5] Render body fat trend chart using ProgressChart component
- [X] T112 [US5] Display latest measurement date and weight
- [X] T113 [US5] Show prompt to create first goal when no active goal exists
- [X] T114 [US5] Display motivational messages when user is behind schedule
- [X] T115 [US5] Add quick action buttons (log progress, view plans)
- [X] T116 [US5] Implement pull-to-refresh for dashboard data
- [X] T117 [US5] Add loading skeleton for dashboard while data loads

**Checkpoint**: User Story 5 complete - Users see comprehensive dashboard on app launch

---

## Phase 8: User Story 6 - Create Bulking Goal (Priority: P6)

**Goal**: Enable lean users to create bulking goals with body fat ceiling and caloric surplus recommendations

**Independent Test**: After completing measurements (US2) with low body fat → Navigate to goals → Select "Bulking" → Set ceiling higher than current → See goal with surplus recommendations

### Tests for User Story 6

- [ ] T118 [P] [US6] E2E test for bulking goal creation in mobile/__tests__/e2e/goals.e2e.ts
- [ ] T119 [P] [US6] E2E test for ceiling approach warning in mobile/__tests__/e2e/goals.e2e.ts
- [ ] T120 [P] [US6] E2E test for ceiling reached completion in mobile/__tests__/e2e/goals.e2e.ts

### Implementation for User Story 6

- [X] T121 [US6] Extend GoalForm component to support bulking goal type with ceiling input
- [X] T122 [US6] Implement bulking goal validation (ceiling must be higher than current body fat)
- [X] T123 [US6] Display bulking goal details: ceiling, surplus recommendations, timeline
- [X] T124 [US6] Implement ceiling approach warning (within 1% of ceiling)
- [X] T125 [US6] Implement goal completion when ceiling is reached
- [X] T126 [US6] Add transition suggestion (maintenance or cutting) when bulking completes
- [X] T127 [US6] Update dashboard to handle bulking goals correctly (show ceiling instead of target)

**Checkpoint**: User Story 6 complete - Users can create and track bulking goals

---

## Phase 9: User Story 7 - View Training and Diet Plans (Priority: P7)

**Goal**: Provide users with personalized training recommendations and macro targets based on their goal type

**Independent Test**: After creating any goal (US3 or US6) → Navigate to plans → See training recommendations and macro breakdown appropriate for goal type

### Tests for User Story 7

- [ ] T128 [P] [US7] E2E test for viewing training plan with cutting goal in mobile/__tests__/e2e/plans.e2e.ts
- [ ] T129 [P] [US7] E2E test for viewing diet plan with macro targets in mobile/__tests__/e2e/plans.e2e.ts

### Types & API Integration for User Story 7

- [X] T130 [P] [US7] Define plan types in mobile/src/types/plans.ts: Plan, TrainingPlan, DietPlan, PlanType
- [X] T131 [P] [US7] Implement plan API functions in mobile/src/services/api/plans.ts: getPlans(), regeneratePlan()
- [X] T132 [US7] Create usePlans hook in mobile/src/hooks/usePlans.ts with queries for training and diet plans

### UI Implementation for User Story 7

- [X] T133 [US7] Create plans directory and layout in mobile/app/plans/
- [X] T134 [US7] Create training plan screen in mobile/app/plans/training.tsx displaying workout recommendations
- [X] T135 [US7] Create diet plan screen in mobile/app/plans/diet.tsx displaying calorie targets and macro breakdown
- [X] T136 [US7] Display cutting-specific training recommendations (strength + cardio)
- [X] T137 [US7] Display bulking-specific training recommendations (progressive overload focus)
- [X] T138 [US7] Display macronutrient breakdown (protein/carbs/fats) with visual representation
- [X] T139 [US7] Add plan regeneration functionality with loading states
- [X] T140 [US7] Display last updated date for plans

**Checkpoint**: User Story 7 complete - Users can view training and diet guidance

---

## Phase 10: User Story 8 - Profile Management (Priority: P8)

**Goal**: Enable users to update their profile information, change settings, and manage their account

**Independent Test**: After logging in (US1) → Navigate to profile → Update email, password, or preferences → Verify changes persist

### Tests for User Story 8

- [ ] T141 [P] [US8] E2E test for profile update in mobile/__tests__/e2e/profile.e2e.ts
- [ ] T142 [P] [US8] E2E test for password change in mobile/__tests__/e2e/profile.e2e.ts
- [ ] T143 [P] [US8] E2E test for calculation method change in mobile/__tests__/e2e/profile.e2e.ts

### Types & API Integration for User Story 8

- [X] T144 [P] [US8] Define profile types in mobile/src/types/profile.ts: UserProfile, UpdateProfileRequest
- [X] T145 [P] [US8] Create profile Zod schema in mobile/src/services/validation/schemas.ts with age and height validation
- [X] T146 [P] [US8] Implement profile API functions in mobile/src/services/api/profile.ts: getProfile(), updateProfile(), deleteAccount()
- [X] T147 [US8] Create useProfile hook in mobile/src/hooks/useProfile.ts with profile queries and mutations

### UI Implementation for User Story 8

- [X] T148 [US8] Create profile home screen in mobile/app/profile/index.tsx displaying current profile information
- [X] T149 [US8] Create profile edit screen in mobile/app/profile/edit.tsx with form for updating information
- [X] T150 [US8] Create settings screen in mobile/app/profile/settings.tsx for app preferences
- [X] T151 [US8] Implement email update functionality with validation
- [X] T152 [US8] Implement password change functionality with current password verification
- [X] T153 [US8] Implement calculation method preference change
- [X] T154 [US8] Display confirmation dialog for calculation method change (affects future measurements only)
- [X] T155 [US8] Implement account deletion with confirmation dialog
- [X] T156 [US8] Add unit preference toggle (metric/imperial) in settings
- [X] T157 [US8] Display app version and build information in settings

**Checkpoint**: User Story 8 complete - Users can manage their profile and settings

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and features that affect multiple user stories or overall app quality

### Offline Support

- [ ] T158 [P] Configure React Query offline mode in mobile/app/_layout.tsx
- [ ] T159 [P] Implement offline indicator component in mobile/src/components/common/OfflineIndicator.tsx
- [ ] T160 [P] Create useOffline hook in mobile/src/hooks/useOffline.ts for network state detection
- [ ] T161 Implement mutation queue for offline operations
- [ ] T162 Add retry logic for failed requests when connection restored
- [ ] T163 Display clear offline indicators across all screens

### Error Handling & UX

- [ ] T164 [P] Implement global error boundary in mobile/app/_layout.tsx
- [ ] T165 [P] Create error logging service for debugging
- [ ] T166 Standardize error messages across all API calls
- [ ] T167 Add haptic feedback for important actions (goal completion, errors)
- [ ] T168 Implement form field auto-focus and keyboard handling
- [ ] T169 Add accessibility labels to all interactive elements

### Performance Optimization

- [ ] T170 [P] Implement React.memo for expensive components (charts, lists)
- [ ] T171 [P] Configure image caching with Expo Image
- [ ] T172 Replace FlatList with FlashList in any list views if needed
- [ ] T173 Optimize bundle size by analyzing with expo-updates
- [ ] T174 Implement code splitting for heavy screens using React.lazy()

### Testing & Quality

- [ ] T175 [P] Add unit tests for all utility functions in mobile/__tests__/unit/utils/
- [ ] T176 [P] Add unit tests for all validation schemas in mobile/__tests__/unit/validation/
- [ ] T177 [P] Add component tests for all common components in mobile/__tests__/unit/components/
- [ ] T178 Setup test coverage reporting with Jest
- [ ] T179 Setup continuous integration for running tests

### Documentation & Developer Experience

- [ ] T180 [P] Update mobile/README.md with complete setup, running, and testing instructions
- [ ] T181 [P] Add API documentation comments to all service functions
- [ ] T182 [P] Create CONTRIBUTING.md with code style guidelines and PR process
- [ ] T183 Add inline code comments for complex business logic
- [ ] T184 Document environment variables needed in .env.example

### Deployment & Distribution

- [ ] T185 Configure EAS Build for iOS and Android in mobile/eas.json
- [ ] T186 Configure EAS Update for OTA updates in mobile/eas.json
- [ ] T187 Setup app icons and splash screens in mobile/assets/
- [ ] T188 Configure app permissions in mobile/app.json (camera, storage if needed)
- [ ] T189 Create privacy policy and terms of service content
- [ ] T190 Setup crash reporting (Sentry or similar)
- [ ] T191 Setup analytics (Expo Analytics or Firebase)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - MVP baseline
- **User Story 2 (Phase 4)**: Depends on US1 (need authenticated users)
- **User Story 3 (Phase 5)**: Depends on US2 (need baseline measurements)
- **User Story 4 (Phase 6)**: Depends on US3 (need active goal)
- **User Story 5 (Phase 7)**: Depends on US4 (need progress data for dashboard)
- **User Story 6 (Phase 8)**: Depends on US2 (need measurements, independent of US3)
- **User Story 7 (Phase 9)**: Depends on US3 or US6 (need active goal)
- **User Story 8 (Phase 10)**: Depends on US1 (need authenticated user, otherwise independent)
- **Polish (Phase 11)**: Depends on core user stories being complete

### User Story Dependencies (Data Flow)

```
US1 (Auth) → US2 (Measurements) → US3 (Cutting Goal) → US4 (Progress) → US5 (Dashboard)
                                ↘
                                  US6 (Bulking Goal) → US7 (Plans)
                                ↗
                  US8 (Profile) ← US1 (Auth)
```

### Parallel Opportunities

**Setup Phase**: T003, T004, T005, T006, T007, T008, T009, T010, T011, T012 can all run in parallel after T001-T002 complete

**Foundational Phase**:
- T018, T019 (storage services) can run in parallel
- T024, T025, T026, T027, T028 (common components) can all run in parallel
- T029, T030, T031 (utilities) can all run in parallel

**User Story 1**: T032, T033, T034, T035 (tests) can run in parallel; T036, T037, T038, T039 (types) can run in parallel; T040, T043, T044 can run in parallel

**User Story 2**: T050, T051, T052, T053 (tests) in parallel; T054, T055, T056 (types) in parallel; T057, T060, T061, T062 in parallel

**User Story 3**: T068, T069, T070 (tests) in parallel; T071, T072, T073 (types) in parallel; T074, T077, T078, T079 in parallel

**User Story 4**: T086, T087, T088 (tests) in parallel; T089, T090, T091 (types) in parallel; T092, T095, T096, T097 in parallel

**User Story 5**: T105, T106 (tests) in parallel

**User Story 6**: T118, T119, T120 (tests) in parallel

**User Story 7**: T128, T129 (tests) in parallel; T130, T131 in parallel

**User Story 8**: T141, T142, T143 (tests) in parallel; T144, T145, T146 in parallel

**Polish Phase**: Most tasks marked [P] can run in parallel

### Multi-Developer Strategy

With 3 developers after Foundational phase completes:
- **Developer A**: US1 → US4 → US5 (critical path for MVP)
- **Developer B**: US2 → US3 (measurements and cutting goals)
- **Developer C**: US6 → US7 (bulking and plans)
- **Everyone**: US8 and Polish tasks

---

## Implementation Strategy

### MVP First (Minimal Viable Product)

**Goal**: Get to a working app as quickly as possible

1. **Complete Phase 1**: Setup (T001-T012)
2. **Complete Phase 2**: Foundational (T013-T031) - CRITICAL
3. **Complete Phase 3**: User Story 1 - Authentication (T032-T049)
4. **STOP and VALIDATE**: Test registration, login, logout independently
5. **Deploy**: TestFlight/Internal Testing for validation

**Estimated MVP**: ~40-50 tasks, delivers authenticated user experience

### Incremental Feature Delivery

After MVP, add features one user story at a time:

1. **MVP + US2** (Measurements): Users can track body composition
2. **MVP + US2 + US3** (Cutting Goals): Users can set fat loss goals
3. **MVP + US2 + US3 + US4** (Progress): Users can track toward goals
4. **MVP + US2 + US3 + US4 + US5** (Dashboard): Complete tracking experience
5. Continue with US6, US7, US8 based on user feedback

Each increment is fully functional and testable independently.

### Test-First Development (CRITICAL)

**For EVERY user story**:
1. Write E2E tests FIRST (they should FAIL)
2. Write unit tests for utilities/calculations FIRST (they should FAIL)
3. Implement types and schemas
4. Implement API integration
5. Implement UI components
6. Run tests (they should PASS)
7. Manual testing on device
8. Commit and move to next story

---

## Total Task Count: 191 tasks

**Breakdown by Phase**:
- Phase 1 (Setup): 12 tasks
- Phase 2 (Foundational): 19 tasks
- Phase 3 (US1 - Auth): 18 tasks
- Phase 4 (US2 - Measurements): 18 tasks
- Phase 5 (US3 - Cutting Goals): 18 tasks
- Phase 6 (US4 - Progress): 19 tasks
- Phase 7 (US5 - Dashboard): 13 tasks
- Phase 8 (US6 - Bulking Goals): 10 tasks
- Phase 9 (US7 - Plans): 13 tasks
- Phase 10 (US8 - Profile): 14 tasks
- Phase 11 (Polish): 37 tasks

**MVP Scope** (Phases 1-3): 49 tasks  
**Core Features** (Phases 1-7): 117 tasks  
**Full Feature Set** (All phases): 191 tasks

---

## Notes

- All test tasks should be completed FIRST and FAIL before implementation
- Each user story is independently testable once its phase is complete
- [P] indicates tasks that can run in parallel (different files, no blocking dependencies)
- [US#] indicates which user story the task belongs to for traceability
- File paths are relative to mobile/ directory
- Commit after completing each user story phase for atomic changes
- Stop at any checkpoint to validate independently before proceeding
- TypeScript strict mode should catch type errors during development
- Use React Query DevTools during development for debugging API state
