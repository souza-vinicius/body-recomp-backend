# Feature Specification: Body Recomposition Goal Tracking

**Feature Branch**: `001-body-recomp-goals`  
**Created**: 2025-10-23  
**Status**: Draft  
**Input**: User description: "Body recomposition tracking with body fat percentage goals for cutting and bulking phases"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Cutting Goal (Priority: P1)

A user who is overweight wants to lose fat by setting a target body fat percentage. They input their current measurements (height, weight, body measurements for body fat calculation), define their target body fat percentage, and the system creates a cutting goal with a caloric deficit plan.

**Why this priority**: This is the core value proposition and most common use case for body recomposition. Users starting their fitness journey typically begin with fat loss (cutting), making this the essential MVP functionality.

**Independent Test**: Can be fully tested by creating a user profile, entering initial measurements, setting a lower target body fat percentage, and verifying the system creates a cutting goal with deficit-based recommendations. Delivers immediate value by giving users a clear starting point.

**Acceptance Scenarios**:

1. **Given** a new user without any goals, **When** they input height (175cm), weight (90kg), body measurements for body fat calculation, and set target body fat to 15%, **Then** the system calculates current body fat percentage, creates a cutting goal, and generates a caloric deficit plan
2. **Given** a user with current body fat of 25%, **When** they set target body fat to 18%, **Then** the system creates a cutting phase goal with projected timeline and weekly milestones
3. **Given** a user entering measurements, **When** body fat calculation is completed, **Then** the system displays current body fat percentage and allows setting a lower target for cutting
4. **Given** a cutting goal is created, **When** the user views their goal, **Then** they see current vs target body fat, estimated timeline, and recommended caloric deficit

---

### User Story 2 - Weekly Progress Tracking for Cutting (Priority: P2)

A user in a cutting phase logs their weekly measurements (weight and body measurements) to track progress toward their body fat goal. The system calculates updated body fat percentage, shows progress against the goal, and adjusts recommendations if needed.

**Why this priority**: Progress tracking is essential for user engagement and goal achievement, but depends on having a goal established first (P1). This creates the feedback loop that keeps users motivated.

**Independent Test**: Can be tested independently by creating a cutting goal (using P1 functionality) and then logging weekly measurements over multiple weeks, verifying progress calculations, visual feedback, and plan adjustments work correctly.

**Acceptance Scenarios**:

1. **Given** a user with an active cutting goal, **When** they log weekly measurements after 7 days, **Then** the system calculates new body fat percentage and displays progress toward target
2. **Given** a user logging measurements, **When** body fat percentage decreases, **Then** the system shows positive progress feedback and updates remaining timeline
3. **Given** a user has logged 4 weeks of data, **When** they view progress, **Then** they see a trend chart of body fat percentage over time
4. **Given** progress is slower than expected, **When** weekly update is logged, **Then** the system suggests potential adjustments to the plan
5. **Given** target body fat is reached, **When** the user logs measurements, **Then** the system marks the goal as completed and celebrates achievement

---

### User Story 3 - Create Bulking Goal (Priority: P3)

A user who wants to gain muscle mass sets a bulking goal by defining a target body fat percentage ceiling. They input their current measurements, set the maximum body fat percentage they're willing to reach, and the system creates a bulking goal with a caloric surplus plan.

**Why this priority**: Bulking is the complementary use case to cutting but represents a smaller initial user segment. Users typically cut first before bulking, and the system can deliver value without this feature initially.

**Independent Test**: Can be tested independently by creating a user profile, entering measurements, setting a higher body fat ceiling (e.g., current 12%, ceiling 18%), and verifying the system creates a bulking goal with surplus-based recommendations.

**Acceptance Scenarios**:

1. **Given** a lean user at 12% body fat, **When** they set a bulking goal with 18% body fat ceiling, **Then** the system creates a bulking phase goal with caloric surplus recommendations
2. **Given** a user creating a bulking goal, **When** they input measurements, **Then** the system calculates safe rate of weight gain and projected timeline to ceiling
3. **Given** a bulking goal is active, **When** the user views their goal, **Then** they see current body fat, ceiling target, and recommended caloric surplus
4. **Given** a user reaches their body fat ceiling during bulking, **When** they log measurements, **Then** the system alerts them to transition to maintenance or cutting

---

### User Story 4 - Weekly Progress Tracking for Bulking (Priority: P4)

A user in a bulking phase logs weekly measurements to ensure they're gaining muscle while staying below their body fat ceiling. The system tracks body fat percentage increases and alerts if approaching the ceiling too quickly.

**Why this priority**: Essential for bulking users but lower priority than cutting tracking due to smaller user segment. Bulking requires more careful monitoring to avoid excessive fat gain.

**Independent Test**: Can be tested by creating a bulking goal (using P3) and logging weekly measurements, verifying the system tracks body fat increases, provides warnings when approaching ceiling, and maintains historical data.

**Acceptance Scenarios**:

1. **Given** a user with an active bulking goal at 14% body fat (ceiling 18%), **When** they log weekly measurements showing 14.5% body fat, **Then** the system confirms healthy progress
2. **Given** body fat is approaching the ceiling, **When** user logs measurements at 17.5% body fat, **Then** the system warns they're near their limit and may need to slow down
3. **Given** a user reaches their body fat ceiling, **When** they view their goal, **Then** the system marks bulking phase complete and suggests next steps
4. **Given** body fat increases too rapidly, **When** weekly update shows 2% increase in one week, **Then** the system alerts the user and suggests reducing surplus

---

### User Story 5 - View Training and Diet Plans (Priority: P5)

A user with an active goal (cutting or bulking) can view their personalized training plan and diet plan generated based on their goal type and current metrics.

**Why this priority**: While important for the complete experience, this is a supporting feature. Users can still benefit from goal tracking and progress monitoring even with external training/diet plans initially.

**Independent Test**: Can be tested by creating any goal (cutting or bulking) and verifying the system displays appropriate training recommendations and dietary guidelines based on the goal type and user metrics.

**Acceptance Scenarios**:

1. **Given** a user with a cutting goal, **When** they view their training plan, **Then** they see strength training recommendations and cardio guidelines for fat loss
2. **Given** a user with a bulking goal, **When** they view their training plan, **Then** they see progressive overload recommendations focused on muscle growth
3. **Given** a user with any active goal, **When** they view their diet plan, **Then** they see macronutrient targets (protein, carbs, fats) and total calorie recommendations
4. **Given** a user's progress changes, **When** plan is regenerated, **Then** calorie and macro targets adjust based on current body composition and progress rate

---

### Edge Cases

- What happens when a user enters measurements that result in an unrealistic body fat percentage (e.g., below 5% or above 50%)?
- How does the system handle a user who sets an unhealthy target (e.g., trying to cut to 5% body fat)?
- What happens if a user doesn't log measurements for multiple weeks?
- How does the system handle measurement errors or inconsistencies (e.g., body fat goes up during cutting)?
- What happens when a user wants to change their goal mid-phase?
- How does the system handle users who reach their goal faster or slower than projected?
- What happens if a user's weight fluctuates significantly week-to-week due to water retention?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to input body measurements including height, weight, and multiple body circumference measurements for body fat calculation
- **FR-002**: System MUST support multiple body fat calculation methods allowing users to choose based on available equipment: Navy Method (waist/neck/height), 3-Site Skinfold (chest/abdomen/thigh or tricep/suprailiac/thigh), and 7-Site Skinfold (chest/midaxillary/tricep/subscapular/abdomen/suprailiac/thigh)
- **FR-003**: Users MUST be able to create a cutting goal by setting a target body fat percentage lower than their current percentage
- **FR-004**: Users MUST be able to create a bulking goal by setting a maximum body fat percentage ceiling higher than their current percentage
- **FR-005**: System MUST generate a caloric deficit recommendation for cutting goals based on current metrics and target
- **FR-006**: System MUST generate a caloric surplus recommendation for bulking goals based on current metrics and ceiling
- **FR-006-A**: System MUST allow users to select their preferred body fat calculation method during initial setup
- **FR-006-B**: System MUST collect only the measurements required for the user's chosen calculation method
- **FR-007**: System MUST allow users to log weekly measurements including weight and body circumference measurements
- **FR-008**: System MUST calculate updated body fat percentage from each weekly measurement entry using the user's selected method
- **FR-009**: System MUST display progress toward goal showing current vs target body fat percentage
- **FR-010**: System MUST maintain historical record of all measurements and calculated body fat percentages
- **FR-011**: System MUST estimate timeline to reach target based on healthy fat loss rate (0.5-1% body fat per month for cutting)
- **FR-012**: System MUST estimate timeline to reach ceiling based on healthy gain rate for bulking
- **FR-013**: System MUST mark a goal as completed when target body fat is reached (cutting) or ceiling is reached (bulking)
- **FR-014**: System MUST generate a training plan appropriate for the goal type (cutting or bulking)
- **FR-015**: System MUST generate a diet plan with macronutrient targets based on goal type and user metrics
- **FR-016**: System MUST validate measurements are within reasonable ranges for human physiology
- **FR-017**: System MUST prevent users from setting unsafe body fat targets (below 8% for men, below 15% for women)
- **FR-018**: System MUST allow only one active goal per user at a time
- **FR-019**: System MUST display trend visualization of body fat percentage over time
- **FR-020**: System MUST alert users when approaching their bulking ceiling (within 1% of target)
- **FR-021**: System MUST maintain consistency by using the same calculation method throughout a goal's lifecycle
- **FR-022**: System MUST provide guidance on how to take measurements correctly for each supported method

### Key Entities

- **User Profile**: Represents a system user with attributes like height, gender, age, fitness level, and preferred body fat calculation method
- **Body Measurement**: A snapshot of user measurements at a specific point in time including weight and method-specific measurements (circumferences for Navy Method, skinfold measurements for 3-Site/7-Site methods), plus timestamp and calculation method used
- **Goal**: Represents a user's body recomposition objective, includes goal type (cutting/bulking), start date, target body fat percentage (cutting) or ceiling (bulking), current body fat, and status (active/completed)
- **Progress Entry**: Weekly measurement log linking to a Goal, includes body measurement snapshot, calculated body fat percentage, progress percentage toward target, and comparison to previous entry
- **Training Plan**: Exercise recommendations generated for a specific Goal, includes workout type, frequency, and progression guidelines appropriate for goal type
- **Diet Plan**: Nutritional guidelines for a Goal, includes daily calorie target, macronutrient breakdown (protein/carbs/fats in grams), and meal timing suggestions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a cutting or bulking goal in under 3 minutes from initial measurement input
- **SC-002**: Users can log weekly progress measurements in under 1 minute
- **SC-003**: System calculates body fat percentage and displays results within 2 seconds of measurement submission
- **SC-004**: 90% of users successfully complete their goal setup on first attempt without errors
- **SC-005**: Users can view their complete progress history including all past measurements and body fat trends
- **SC-006**: System provides accurate timeline projections within ±2 weeks for goals spanning 12-16 weeks
- **SC-007**: Users who log measurements weekly for 4+ weeks show 80% retention rate
- **SC-008**: System prevents 100% of unsafe body fat targets from being set
- **SC-009**: Training and diet plans are generated and displayed within 3 seconds of goal creation
- **SC-010**: Users can access their current goal status, training plan, and diet plan from a single dashboard view

## Assumptions

- Users will measure themselves consistently using the same method each week for accuracy
- Body fat calculation methods provide reasonable estimates (Navy: ±3-4%, 3-Site: ±2-3%, 7-Site: ±2%) sufficient for tracking trends
- Users selecting skinfold methods have access to calipers and basic training in measurement technique
- Most users will choose Navy Method initially due to simplicity, with option to switch methods between goals
- Users understand basic fitness concepts like cutting, bulking, and body fat percentage
- Weekly measurement frequency is sufficient for meaningful progress tracking
- Users will follow standard measurement protocols (e.g., measuring at same time of day, similar hydration status)
- Caloric deficit of 300-500 calories is safe and effective for cutting
- Caloric surplus of 200-300 calories is appropriate for lean bulking
- Training and diet plans are guidelines; users may work with professionals for detailed programming
- System assumes English units or metric units based on user preference, with conversion capabilities
