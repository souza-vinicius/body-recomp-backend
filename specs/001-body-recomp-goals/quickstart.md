# Quickstart: Body Recomposition Goal Tracking

**Feature**: Body Recomposition Goal Tracking  
**Date**: 2025-10-23  
**Purpose**: Quick reference guide for testing user journeys end-to-end

---

## Prerequisites

- API running at `http://localhost:8000`
- PostgreSQL database initialized
- All migrations applied
- Test user credentials ready

---

## User Story 1: Create Cutting Goal (P1)

### Scenario: New user wants to lose body fat from 25% to 15%

**Step 1: Register User**

```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe",
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "height_cm": 175.0,
    "preferred_calculation_method": "navy",
    "activity_level": "moderately_active"
  }'
```

**Expected Response**: `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "full_name": "John Doe",
  "gender": "male",
  "height_cm": 175.0,
  "preferred_calculation_method": "navy",
  "activity_level": "moderately_active"
}
```

---

**Step 2: Login**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response**: `200 OK`
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 900
}
```

**Save the access_token** for subsequent requests.

---

**Step 3: Create Initial Measurement**

```bash
curl -X POST http://localhost:8000/api/v1/measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "weight_kg": 90.0,
    "calculation_method": "navy",
    "waist_cm": 95.0,
    "neck_cm": 38.0,
    "measured_at": "2025-10-23T08:00:00Z"
  }'
```

**Expected Response**: `201 Created`
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "weight_kg": 90.0,
  "calculation_method": "navy",
  "waist_cm": 95.0,
  "neck_cm": 38.0,
  "calculated_body_fat_percentage": 24.8,
  "measured_at": "2025-10-23T08:00:00Z"
}
```

**Note**: System calculated body fat at 24.8% using Navy Method.

---

**Step 4: Create Cutting Goal**

```bash
curl -X POST http://localhost:8000/api/v1/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "goal_type": "cutting",
    "initial_measurement_id": "650e8400-e29b-41d4-a716-446655440001",
    "target_body_fat_percentage": 15.0
  }'
```

**Expected Response**: `201 Created`
```json
{
  "id": "750e8400-e29b-41d4-a716-446655440002",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "goal_type": "cutting",
  "status": "active",
  "initial_body_fat_percentage": 24.8,
  "target_body_fat_percentage": 15.0,
  "initial_weight_kg": 90.0,
  "target_calories": 2200,
  "estimated_weeks_to_goal": 52,
  "started_at": "2025-10-23T08:00:00Z",
  "progress_percentage": 0.0,
  "current_body_fat_percentage": 24.8,
  "is_on_track": true
}
```

**Success Indicators**:
- ✅ Goal created with status "active"
- ✅ Target calories calculated (2200 cal = TDEE - 400)
- ✅ Estimated ~52 weeks to reach 15% body fat
- ✅ User can now view goal details

---

## User Story 2: Weekly Progress Tracking (P2)

### Scenario: User logs weekly measurements and tracks progress

**Step 5: Log Week 1 Measurement (after 7 days)**

```bash
curl -X POST http://localhost:8000/api/v1/measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "weight_kg": 89.3,
    "calculation_method": "navy",
    "waist_cm": 94.2,
    "neck_cm": 38.0,
    "measured_at": "2025-10-30T08:00:00Z"
  }'
```

**Expected Response**: `201 Created` with calculated_body_fat_percentage: 24.4%

---

**Step 6: Create Progress Entry**

```bash
curl -X POST http://localhost:8000/api/v1/goals/750e8400-e29b-41d4-a716-446655440002/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "measurement_id": "{new_measurement_id}"
  }'
```

**Expected Response**: `201 Created`
```json
{
  "id": "850e8400-e29b-41d4-a716-446655440003",
  "goal_id": "750e8400-e29b-41d4-a716-446655440002",
  "week_number": 1,
  "body_fat_percentage": 24.4,
  "weight_kg": 89.3,
  "body_fat_change": -0.4,
  "weight_change_kg": -0.7,
  "is_on_track": true,
  "logged_at": "2025-10-30T08:00:00Z"
}
```

**Success Indicators**:
- ✅ Body fat decreased 0.4% (on track)
- ✅ Weight decreased 0.7 kg (healthy rate)
- ✅ `is_on_track: true` confirms good progress

---

**Step 7: View Progress History**

```bash
curl -X GET http://localhost:8000/api/v1/goals/750e8400-e29b-41d4-a716-446655440002/progress \
  -H "Authorization: Bearer {access_token}"
```

**Expected Response**: `200 OK`
```json
{
  "goal_id": "750e8400-e29b-41d4-a716-446655440002",
  "entries": [
    {
      "week_number": 1,
      "body_fat_percentage": 24.4,
      "weight_kg": 89.3,
      "body_fat_change": -0.4,
      "weight_change_kg": -0.7,
      "is_on_track": true,
      "logged_at": "2025-10-30T08:00:00Z"
    }
  ],
  "total_entries": 1
}
```

---

**Step 8: View Trend Analysis (after 4+ weeks)**

```bash
curl -X GET http://localhost:8000/api/v1/goals/750e8400-e29b-41d4-a716-446655440002/trends \
  -H "Authorization: Bearer {access_token}"
```

**Expected Response**: `200 OK`
```json
{
  "goal_id": "750e8400-e29b-41d4-a716-446655440002",
  "data_points": [
    {"week": 0, "body_fat": 24.8, "weight": 90.0},
    {"week": 1, "body_fat": 24.4, "weight": 89.3},
    {"week": 2, "body_fat": 24.0, "weight": 88.6},
    {"week": 3, "body_fat": 23.7, "weight": 87.9},
    {"week": 4, "body_fat": 23.3, "weight": 87.2}
  ],
  "statistics": {
    "average_weekly_bf_change": -0.375,
    "average_weekly_weight_change": -0.7,
    "projected_weeks_remaining": 21,
    "is_on_track": true,
    "velocity": "on_pace"
  },
  "smoothed_data": [
    {"week": 1, "smoothed_body_fat": 24.5},
    {"week": 2, "smoothed_body_fat": 24.2},
    {"week": 3, "smoothed_body_fat": 23.9},
    {"week": 4, "smoothed_body_fat": 23.5}
  ]
}
```

**Success Indicators**:
- ✅ Consistent downward trend in body fat
- ✅ 4-week moving average shows smooth progress
- ✅ Projected timeline updated based on actual rate
- ✅ User stays motivated with visual feedback

---

## User Story 3: Create Bulking Goal (P3)

### Scenario: Lean user wants to gain muscle with controlled fat gain

**Step 9: Create Initial Measurement (Lean User)**

```bash
curl -X POST http://localhost:8000/api/v1/measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "weight_kg": 70.0,
    "calculation_method": "navy",
    "waist_cm": 75.0,
    "neck_cm": 36.0,
    "measured_at": "2025-10-23T08:00:00Z"
  }'
```

**Expected Response**: Body fat calculated at 12.1%

---

**Step 10: Create Bulking Goal**

```bash
curl -X POST http://localhost:8000/api/v1/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "goal_type": "bulking",
    "initial_measurement_id": "{measurement_id}",
    "ceiling_body_fat_percentage": 18.0
  }'
```

**Expected Response**: `201 Created`
```json
{
  "id": "{goal_id}",
  "goal_type": "bulking",
  "status": "active",
  "initial_body_fat_percentage": 12.1,
  "ceiling_body_fat_percentage": 18.0,
  "initial_weight_kg": 70.0,
  "target_calories": 2700,
  "estimated_weeks_to_goal": 117,
  "started_at": "2025-10-23T08:00:00Z"
}
```

**Success Indicators**:
- ✅ Bulking goal created with ceiling at 18%
- ✅ Target calories in surplus (2700 cal = TDEE + 250)
- ✅ Conservative timeline (~2 years for healthy bulk)

---

## User Story 4: Weekly Progress Tracking for Bulking (P4)

### Scenario: User logs weekly gains and monitors fat accumulation

**Step 11: Log Week 1 Bulking Measurement**

```bash
curl -X POST http://localhost:8000/api/v1/measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "weight_kg": 70.4,
    "calculation_method": "navy",
    "waist_cm": 75.3,
    "neck_cm": 36.0,
    "measured_at": "2025-10-30T08:00:00Z"
  }'
```

**Expected Response**: Body fat calculated at 12.3% (+0.2% increase, healthy)

---

**Step 12: Create Bulking Progress Entry**

```bash
curl -X POST http://localhost:8000/api/v1/goals/{bulking_goal_id}/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "measurement_id": "{new_measurement_id}"
  }'
```

**Expected Response**: `201 Created`
```json
{
  "week_number": 1,
  "body_fat_percentage": 12.3,
  "weight_kg": 70.4,
  "body_fat_change": 0.2,
  "weight_change_kg": 0.4,
  "is_on_track": true
}
```

**Success Indicators**:
- ✅ Weight increased 0.4 kg (healthy rate)
- ✅ Body fat increased only 0.2% (mostly muscle gain)
- ✅ Still well below 18% ceiling

---

**Step 13: Approaching Ceiling (Week 100)**

```bash
# Measurement shows body fat at 17.6%
curl -X GET http://localhost:8000/api/v1/goals/{bulking_goal_id} \
  -H "Authorization: Bearer {access_token}"
```

**Expected Response**: `200 OK`
```json
{
  "goal_id": "{goal_id}",
  "current_body_fat_percentage": 17.6,
  "ceiling_body_fat_percentage": 18.0,
  "progress_percentage": 94.8,
  "is_on_track": true,
  "alert": "Approaching ceiling - within 1% of target. Consider transitioning to maintenance or cutting."
}
```

**Success Indicators**:
- ✅ System alerts user approaching ceiling
- ✅ Progress tracked accurately over 100 weeks
- ✅ User can decide when to stop bulking

---

## User Story 5: View Training and Diet Plans (P5)

### Scenario: User wants to see personalized recommendations

**Step 14: Get Training Plan**

```bash
curl -X GET http://localhost:8000/api/v1/goals/750e8400-e29b-41d4-a716-446655440002/training-plan \
  -H "Authorization: Bearer {access_token}"
```

**Expected Response**: `200 OK`
```json
{
  "goal_id": "750e8400-e29b-41d4-a716-446655440002",
  "workout_frequency": 4,
  "primary_focus": "Strength training + cardio for fat loss",
  "plan_details": {
    "strength_training": {
      "frequency": 3,
      "exercises": [
        {
          "name": "Compound lifts (squat, deadlift, bench press)",
          "sets": "3-4",
          "reps": "6-12",
          "rest": "2-3 minutes"
        },
        {
          "name": "Accessory work (rows, pull-ups, shoulder press)",
          "sets": "3",
          "reps": "8-15",
          "rest": "1-2 minutes"
        }
      ],
      "progression": "Maintain or slightly increase weight to preserve muscle"
    },
    "cardio": {
      "frequency": 2,
      "type": "LISS or HIIT",
      "duration": "20-30 minutes",
      "intensity": "Zone 2 heart rate for fat burning"
    },
    "rest_days": 3,
    "notes": "Prioritize recovery during caloric deficit"
  }
}
```

---

**Step 15: Get Diet Plan**

```bash
curl -X GET http://localhost:8000/api/v1/goals/750e8400-e29b-41d4-a716-446655440002/diet-plan \
  -H "Authorization: Bearer {access_token}"
```

**Expected Response**: `200 OK`
```json
{
  "goal_id": "750e8400-e29b-41d4-a716-446655440002",
  "daily_calorie_target": 2200,
  "protein_grams": 198,
  "carbs_grams": 220,
  "fat_grams": 61,
  "guidelines": "High protein (2.2g/kg) to preserve muscle during cut. Moderate carbs for training energy. Healthy fats for hormones.",
  "meal_timing": {
    "meals_per_day": 3,
    "pre_workout": "30-60 minutes before: 40g carbs, 20g protein",
    "post_workout": "Within 2 hours: 40g protein, 80g carbs",
    "meal_distribution": {
      "breakfast": 30,
      "lunch": 35,
      "dinner": 35
    }
  }
}
```

**Success Indicators**:
- ✅ Macros calculated based on goal type and current weight
- ✅ High protein (2.2g/kg) for muscle preservation during cut
- ✅ Meal timing optimized for training performance
- ✅ Clear guidelines user can follow

---

## Complete User Journey Timeline

### Cutting Journey (52 weeks)

| Week | Weight (kg) | Body Fat (%) | Status | Action |
|------|-------------|--------------|--------|--------|
| 0 | 90.0 | 24.8 | Goal created | Set target: 15% |
| 1 | 89.3 | 24.4 | On track | First weekly check-in |
| 4 | 87.2 | 23.3 | On track | View trends |
| 12 | 83.1 | 20.9 | On track | Quarter milestone |
| 26 | 78.4 | 17.8 | On track | Halfway point |
| 40 | 74.8 | 15.7 | On track | Approaching target |
| 48 | 73.2 | 15.2 | On track | Final push |
| 52 | 72.5 | 14.9 | ✅ Completed | Target reached! |

---

### Bulking Journey (117 weeks)

| Week | Weight (kg) | Body Fat (%) | Status | Action |
|------|-------------|--------------|--------|--------|
| 0 | 70.0 | 12.1 | Goal created | Set ceiling: 18% |
| 1 | 70.4 | 12.3 | On track | First weekly check-in |
| 10 | 72.5 | 13.1 | On track | Early gains |
| 50 | 79.8 | 15.3 | On track | Midpoint |
| 100 | 87.2 | 17.6 | Near ceiling | Alert triggered |
| 110 | 88.9 | 17.9 | Near ceiling | Final weeks |
| 117 | 89.5 | 18.0 | ✅ Completed | Ceiling reached! |

---

## Testing Checklist

### P1 - Create Cutting Goal ✅
- [ ] User registration with valid data
- [ ] Login returns JWT tokens
- [ ] Create measurement with Navy Method
- [ ] Body fat calculated correctly (±0.5%)
- [ ] Create cutting goal with target < current BF%
- [ ] System validates target not below safety threshold
- [ ] Target calories calculated (TDEE - 300-500)
- [ ] Timeline estimated based on 0.5-1% BF loss/month
- [ ] Goal status set to "active"
- [ ] Only one active goal allowed per user

### P2 - Weekly Progress Tracking ✅
- [ ] Log measurement 7 days after goal start
- [ ] Create progress entry linked to measurement
- [ ] Body fat change calculated correctly
- [ ] Weight change calculated correctly
- [ ] `is_on_track` flag set based on expected rate
- [ ] Progress history returns all entries
- [ ] Trend analysis shows smoothed data (4+ weeks)
- [ ] Statistics calculate average rates
- [ ] Projected timeline updates based on actual progress
- [ ] Alert if off track (>50% deviation)

### P3 - Create Bulking Goal ✅
- [ ] Create measurement for lean user
- [ ] Create bulking goal with ceiling > current BF%
- [ ] System validates ceiling not above 30%
- [ ] Target calories calculated (TDEE + 200-300)
- [ ] Timeline estimated based on 0.1-0.3% BF gain/month
- [ ] Goal type "bulking" stored correctly

### P4 - Bulking Progress Tracking ✅
- [ ] Log weekly measurements showing weight gain
- [ ] Body fat increases at healthy rate
- [ ] Alert when within 1% of ceiling
- [ ] `is_on_track` validates against bulking rates
- [ ] Goal marked complete when ceiling reached

### P5 - Training and Diet Plans ✅
- [ ] Training plan generated on goal creation
- [ ] Cutting plan includes cardio recommendations
- [ ] Bulking plan focuses on progressive overload
- [ ] Diet plan calculates macros based on goal type
- [ ] Cutting: High protein (2.2-2.6g/kg)
- [ ] Bulking: Moderate protein (1.8-2.2g/kg)
- [ ] Calorie targets match goal.target_calories
- [ ] Meal timing suggestions included

---

## Error Cases to Test

### Authentication Errors
```bash
# No token
curl -X GET http://localhost:8000/api/v1/goals/123 
# Expected: 401 Unauthorized

# Invalid token
curl -X GET http://localhost:8000/api/v1/goals/123 \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 Unauthorized
```

### Validation Errors
```bash
# Invalid body fat target (too low)
curl -X POST http://localhost:8000/api/v1/goals \
  -H "Authorization: Bearer {token}" \
  -d '{"goal_type": "cutting", "target_body_fat_percentage": 3.0}'
# Expected: 422 Unprocessable Entity - "Target below safety threshold"

# Missing required measurement fields
curl -X POST http://localhost:8000/api/v1/measurements \
  -H "Authorization: Bearer {token}" \
  -d '{"weight_kg": 90.0, "calculation_method": "navy"}'
# Expected: 422 - "Missing required field: waist_cm"
```

### Authorization Errors
```bash
# Access another user's goal
curl -X GET http://localhost:8000/api/v1/goals/{other_user_goal_id} \
  -H "Authorization: Bearer {token}"
# Expected: 403 Forbidden
```

---

## Performance Benchmarks

| Operation | Expected Response Time | Success Criteria |
|-----------|------------------------|------------------|
| Body fat calculation | < 100ms | SC-003: < 2 seconds |
| Create goal | < 500ms | SC-001: < 3 minutes total |
| Log progress | < 300ms | SC-002: < 1 minute total |
| Get trends | < 1s | Acceptable for data aggregation |
| Generate plan | < 3s | SC-009: < 3 seconds |

---

## Quick Commands Reference

```bash
# Set token variable
export TOKEN="eyJhbGci..."

# Get active goal
curl -X GET http://localhost:8000/api/v1/goals \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.goals[] | select(.status == "active")'

# Latest measurement
curl -X GET http://localhost:8000/api/v1/measurements?limit=1 \
  -H "Authorization: Bearer $TOKEN"

# Refresh access token
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}"
```

---

**Quickstart Status**: ✅ Complete - All user stories testable end-to-end