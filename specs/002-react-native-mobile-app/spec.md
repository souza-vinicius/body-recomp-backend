# Feature Specification: React Native Mobile Application

**Feature Branch**: `002-react-native-mobile-app`  
**Created**: 2025-11-15  
**Status**: Draft  
**Input**: User description: "Cria a aplicacao mobile em React native"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration and Authentication (Priority: P1)

A new user downloads the mobile app and wants to create an account to start tracking their body recomposition journey. They input their email, password, and basic profile information (name, date of birth, gender, height), and the system creates their account allowing them to log in.

**Why this priority**: Authentication is the foundation for all other features. Without the ability to register and log in, users cannot access any functionality. This is the absolute minimum viable product.

**Independent Test**: Can be fully tested by launching the app, completing the registration flow with valid credentials, logging out, and logging back in. Delivers immediate value by securing user data and enabling personalized tracking.

**Acceptance Scenarios**:

1. **Given** a new user opens the app for the first time, **When** they tap "Sign Up", **Then** they see a registration form with fields for email, password, full name, date of birth, gender, and height
2. **Given** a user fills out the registration form with valid data, **When** they submit, **Then** their account is created and they are logged into the app
3. **Given** a registered user, **When** they enter correct email and password on login screen, **Then** they are authenticated and taken to the home dashboard
4. **Given** a user is logged in, **When** they log out, **Then** they return to the login screen and must re-authenticate to access the app
5. **Given** a user enters incorrect login credentials, **When** they attempt to log in, **Then** they see an error message indicating invalid credentials

---

### User Story 2 - Initial Body Measurement Entry (Priority: P2)

A newly registered user needs to input their first body measurements to establish their baseline. They select their preferred body fat calculation method (Navy, 3-Site, or 7-Site), enter the required measurements, and the system calculates their current body fat percentage.

**Why this priority**: Measurements are essential for goal setting but depend on having an authenticated user account. This establishes the baseline from which all progress will be measured.

**Independent Test**: Can be tested by creating an account (using P1) and then navigating to measurement entry, selecting a calculation method, inputting measurements, and verifying body fat percentage is calculated and displayed.

**Acceptance Scenarios**:

1. **Given** a user completes registration, **When** they are prompted to add their first measurement, **Then** they see options to select Navy Method, 3-Site Skinfold, or 7-Site Skinfold
2. **Given** a user selects Navy Method, **When** the measurement form loads, **Then** they see input fields for weight, waist circumference, and neck circumference only
3. **Given** a user selects 3-Site Skinfold, **When** the measurement form loads, **Then** they see input fields specific to their gender (men: chest/abdomen/thigh; women: tricep/suprailiac/thigh)
4. **Given** a user enters all required measurements, **When** they submit, **Then** the system calculates and displays their current body fat percentage
5. **Given** measurements are submitted, **When** calculation completes, **Then** the user can proceed to create their first goal

---

### User Story 3 - Create Cutting Goal (Priority: P3)

A user with baseline measurements wants to start a fat loss phase. They navigate to goal creation, select "Cutting", set their target body fat percentage, and the system creates a cutting goal with caloric recommendations and estimated timeline.

**Why this priority**: Goal creation enables the core value proposition but requires authentication and baseline measurements first. Cutting is the most common initial goal for users.

**Independent Test**: Can be tested independently by completing registration and initial measurements (P1, P2), then creating a cutting goal with a lower target body fat percentage and verifying goal details, timeline, and caloric deficit recommendations appear.

**Acceptance Scenarios**:

1. **Given** a user has baseline measurements showing 25% body fat, **When** they create a cutting goal with target 15%, **Then** the system creates the goal and displays current vs target body fat
2. **Given** a cutting goal is created, **When** the user views goal details, **Then** they see estimated timeline, weekly milestones, and recommended daily calories with deficit
3. **Given** a user sets an unsafe target (below 8% for men or 15% for women), **When** they attempt to create the goal, **Then** the system shows an error preventing goal creation
4. **Given** a user already has an active goal, **When** they attempt to create another goal, **Then** the system shows an error indicating only one active goal is allowed

---

### User Story 4 - Weekly Progress Tracking (Priority: P4)

A user with an active goal wants to log their weekly measurements to track progress. They navigate to progress tracking, enter their current measurements (at least 7 days after last entry), and the system calculates updated body fat percentage and displays progress toward their goal.

**Why this priority**: Progress tracking creates the feedback loop essential for user engagement, but requires an active goal. This is what keeps users returning to the app week after week.

**Independent Test**: Can be tested by creating a goal (using P1-P3) and then logging measurements after 7 days, verifying new body fat calculation, progress percentage update, and trend visualization.

**Acceptance Scenarios**:

1. **Given** a user has an active cutting goal and 7+ days have passed since last measurement, **When** they log new measurements, **Then** the system calculates updated body fat and shows progress percentage
2. **Given** a user logs measurements showing fat loss, **When** calculation completes, **Then** they see positive feedback, updated timeline, and a progress chart
3. **Given** a user attempts to log measurements less than 7 days after previous entry, **When** they try to submit, **Then** the system shows an error indicating minimum 7-day interval
4. **Given** a user reaches their target body fat, **When** they log measurements, **Then** the system marks the goal as completed and shows celebration screen

---

### User Story 5 - View Progress Dashboard (Priority: P5)

A user wants to see their overall progress at a glance. They open the app and land on a dashboard showing their current goal, latest body fat percentage, progress toward target, and a trend chart of their body fat over time.

**Why this priority**: The dashboard ties everything together and provides motivation, but all underlying features must work first. This is what users see most frequently after initial setup.

**Independent Test**: Can be tested by having an active goal with multiple measurements (using P1-P4) and verifying the dashboard displays current status, progress metrics, and visualizations correctly.

**Acceptance Scenarios**:

1. **Given** a user logs in with an active goal, **When** the app loads, **Then** they see a dashboard with current body fat, target, progress percentage, and timeline
2. **Given** a user has logged multiple measurements, **When** they view the dashboard, **Then** they see a line chart showing body fat percentage trend over time
3. **Given** a user has no active goal, **When** they view the dashboard, **Then** they see a prompt to create their first goal
4. **Given** a user is behind schedule on their goal, **When** they view the dashboard, **Then** they see motivational messages and suggestions for getting back on track

---

### User Story 6 - Create Bulking Goal (Priority: P6)

A lean user wants to gain muscle mass. They navigate to goal creation, select "Bulking", set their body fat ceiling, and the system creates a bulking goal with caloric surplus recommendations.

**Why this priority**: Bulking is important but represents a smaller user segment. Most users cut before bulking, making this lower priority for MVP.

**Independent Test**: Can be tested by creating an account with low body fat measurements (P1-P2), creating a bulking goal with a higher ceiling, and verifying surplus recommendations and ceiling warnings work.

**Acceptance Scenarios**:

1. **Given** a user at 12% body fat, **When** they create a bulking goal with 18% ceiling, **Then** the system creates the goal with caloric surplus recommendations
2. **Given** a user logs measurements approaching their ceiling (within 1%), **When** calculation completes, **Then** they see a warning about approaching their limit
3. **Given** a user reaches their body fat ceiling, **When** they log measurements, **Then** the system marks the goal as completed and suggests transitioning to maintenance or cutting

---

### User Story 7 - View Training and Diet Plans (Priority: P7)

A user with an active goal wants to see their personalized training and diet recommendations. They navigate to the plans section and view workout guidance and macronutrient targets based on their goal type.

**Why this priority**: While valuable for user experience, this is supplementary guidance. Users can track progress successfully with external training/diet plans initially.

**Independent Test**: Can be tested by creating any goal (P3 or P6) and navigating to plans section, verifying appropriate training recommendations and macro targets display based on goal type.

**Acceptance Scenarios**:

1. **Given** a user with a cutting goal, **When** they view their training plan, **Then** they see strength training recommendations with cardio guidelines for fat loss
2. **Given** a user with any active goal, **When** they view their diet plan, **Then** they see daily calorie target and macronutrient breakdown (protein/carbs/fats)
3. **Given** a user's progress changes significantly, **When** they view plans, **Then** recommendations adjust based on current body composition

---

### User Story 8 - Profile Management (Priority: P8)

A user wants to update their profile information or change settings. They navigate to profile settings and can update their email, password, personal information, or preferred measurement method.

**Why this priority**: Important for long-term usability but not essential for initial goal tracking. Users can function with their initial profile settings.

**Independent Test**: Can be tested by logging in (P1), navigating to settings, updating profile fields, and verifying changes persist across sessions.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they navigate to profile settings, **Then** they see their current information and options to update email, password, name, and preferred calculation method
2. **Given** a user updates their email, **When** they save changes, **Then** the new email is used for authentication
3. **Given** a user changes their password, **When** they log out and back in, **Then** the new password is required
4. **Given** a user wants to change calculation method, **When** they select a new method, **Then** the system prompts them that this will apply to future measurements only

---

### Edge Cases

- What happens when the user has no internet connection while trying to log measurements or create goals?
- How does the app handle expired authentication tokens (user hasn't opened app in weeks)?
- What happens if measurement input results in an unrealistic body fat percentage (API validation)?
- How does the app handle slow API responses or timeouts?
- What happens when a user tries to log measurements exactly 7 days after their last entry (edge of allowed timeframe)?
- How does the app behave when switching between foreground and background?
- What happens if the user receives a phone call or notification while in the middle of entering measurements?
- How does the app handle device rotation and different screen sizes?
- What happens when the user tries to navigate back from the registration flow?
- How does the app handle biometric authentication if device supports it?
- What happens when local storage is full or corrupted?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: App MUST provide a registration screen accepting email, password, full name, date of birth, gender, and height
- **FR-002**: App MUST validate email format and password strength before submitting registration
- **FR-003**: App MUST provide a login screen accepting email and password credentials
- **FR-004**: App MUST securely store authentication tokens locally after successful login
- **FR-005**: App MUST automatically log users in on app launch if valid token exists
- **FR-006**: App MUST provide a logout option that clears stored authentication tokens
- **FR-007**: App MUST communicate with backend API for all authentication and data operations
- **FR-008**: App MUST provide measurement entry screens with method selection (Navy, 3-Site, 7-Site)
- **FR-009**: App MUST display only relevant input fields based on selected calculation method and user gender
- **FR-010**: App MUST validate measurement inputs are within reasonable ranges before submission
- **FR-011**: App MUST display calculated body fat percentage immediately after measurement submission
- **FR-012**: App MUST provide goal creation flow with goal type selection (Cutting/Bulking)
- **FR-013**: App MUST validate target body fat is lower than current for cutting goals
- **FR-014**: App MUST validate ceiling body fat is higher than current for bulking goals
- **FR-015**: App MUST prevent unsafe targets (below 8% men, 15% women) from being submitted
- **FR-016**: App MUST display goal details including timeline, caloric recommendations, and progress
- **FR-017**: App MUST provide progress tracking screen for logging weekly measurements
- **FR-018**: App MUST enforce minimum 7-day interval between measurement entries
- **FR-019**: App MUST display progress percentage and trend visualization after each measurement log
- **FR-020**: App MUST provide a dashboard showing current goal status, latest metrics, and progress chart
- **FR-021**: App MUST display training plan recommendations appropriate for active goal type
- **FR-022**: App MUST display diet plan with calorie targets and macronutrient breakdown
- **FR-023**: App MUST provide profile settings screen for updating user information
- **FR-024**: App MUST handle offline scenarios gracefully with appropriate error messages
- **FR-025**: App MUST show loading indicators during API requests
- **FR-026**: App MUST display user-friendly error messages when API requests fail
- **FR-027**: App MUST persist user preference for measurement units (metric/imperial)
- **FR-028**: App MUST refresh authentication tokens before expiration
- **FR-029**: App MUST support both iOS and Android platforms with consistent functionality
- **FR-030**: App MUST be responsive to different screen sizes and orientations

### Key Entities

- **User Session**: Represents authenticated user state including authentication token, refresh token, expiration time, and user ID
- **User Profile (Mobile)**: Local representation of user data including email, name, date of birth, gender, height, and preferred settings
- **Measurement Entry (Mobile)**: Mobile form data for body measurements including selected method, weight, method-specific measurements, and timestamp
- **Goal (Mobile)**: Local representation of active goal including type, target/ceiling, current progress, timeline, and caloric recommendations
- **Progress Record (Mobile)**: Display data for progress tracking including historical measurements, body fat trend data, and progress percentage
- **Navigation State**: App navigation stack and current screen state
- **API Request**: Represents pending or completed API calls with loading state, error state, and response data

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete registration and reach the dashboard in under 2 minutes on first launch
- **SC-002**: Users can log in and see their dashboard in under 5 seconds after entering credentials
- **SC-003**: Users can enter measurements and see calculated body fat in under 90 seconds
- **SC-004**: Users can create a goal in under 2 minutes after entering initial measurements
- **SC-005**: App startup time (splash screen to dashboard) is under 3 seconds with valid token
- **SC-006**: 95% of API requests complete within 2 seconds or show loading indicators
- **SC-007**: App handles offline scenarios for 100% of API-dependent features with clear error messages
- **SC-008**: App prevents 100% of invalid data submissions through client-side validation
- **SC-009**: Users can navigate between all main screens in under 3 taps from the dashboard
- **SC-010**: App displays correctly on 95% of tested devices across different screen sizes (4.7" to 6.9")
- **SC-011**: App maintains 60 FPS performance during navigation and scrolling on mid-range devices
- **SC-012**: Users who complete onboarding (registration + first measurement + goal creation) show 85% 7-day retention
- **SC-013**: Crash rate remains below 1% across all sessions
- **SC-014**: App consumes less than 100MB storage including cached data after 30 days of use

## Assumptions

- Backend API already exists and provides all necessary endpoints for authentication, measurements, goals, and plans
- API follows RESTful conventions with JSON request/response format
- API provides token-based authentication (JWT or similar)
- Users have smartphones with iOS 13+ or Android 8+ operating systems
- Users have internet connectivity most of the time but may occasionally use app offline
- Users understand basic fitness terminology (body fat percentage, cutting, bulking)
- App can use standard mobile UI patterns (tab navigation, form inputs, charts)
- Users will grant necessary permissions for app functionality (storage for caching)
- Push notifications are not required for MVP but may be added later
- App will use native device keyboards for input
- Camera access for measurement photos is not required for initial version
- App will support English language initially with potential for localization later
- Users are comfortable with self-measurement using tape measures or calipers
- Backend handles all business logic and calculations; app is primarily a UI layer
- App can cache user data locally for offline viewing but requires connectivity for updates
