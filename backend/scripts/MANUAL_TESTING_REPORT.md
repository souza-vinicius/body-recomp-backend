# Manual End-to-End Testing Report (T121)

**Test Date**: [YYYY-MM-DD]  
**Tester**: [Name]  
**API Version**: 1.0.0  
**Environment**: Local Development / Staging / Production

---

## Test Execution Summary

| Category | Total Tests | Passed | Failed | Skip | Pass Rate |
|----------|-------------|--------|--------|------|-----------|
| User Story 1: Create Cutting Goal | 10 | - | - | - | -% |
| User Story 2: Weekly Progress Tracking | 10 | - | - | - | -% |
| User Story 3: Create Bulking Goal | 6 | - | - | - | -% |
| User Story 4: Bulking Progress Tracking | 4 | - | - | - | -% |
| User Story 5: Training and Diet Plans | 8 | - | - | - | -% |
| Error Cases | 5 | - | - | - | -% |
| **Total** | **43** | **-** | **-** | **-** | **-%** |

---

## Prerequisites Checklist

- [ ] API running at http://localhost:8000
- [ ] PostgreSQL database initialized
- [ ] All migrations applied (`alembic upgrade head`)
- [ ] Database is empty or using test schema
- [ ] curl or Postman/Insomnia available
- [ ] jq installed for JSON parsing (optional but recommended)

---

## User Story 1: Create Cutting Goal

### Test 1.1: User Registration
**Endpoint**: `POST /api/v1/users`

**Request**:
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

**Expected Result**:
- ✅ Status Code: 201 Created
- ✅ Response contains `id`, `email`, `full_name`, `gender`, `height_cm`
- ✅ Password not included in response

**Actual Result**: [PASS/FAIL]

**Notes**: _Record any deviations or observations_

---

### Test 1.2: User Login
**Endpoint**: `POST /api/v1/auth/login`

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Result**:
- ✅ Status Code: 200 OK
- ✅ Response contains `access_token`, `refresh_token`, `token_type`, `expires_in`
- ✅ `token_type` is "bearer"
- ✅ `expires_in` is 900 (15 minutes)

**Actual Result**: [PASS/FAIL]

**Access Token**: [Save for subsequent requests]

---

### Test 1.3: Create Initial Measurement
**Endpoint**: `POST /api/v1/measurements`

**Request**:
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

**Expected Result**:
- ✅ Status Code: 201 Created
- ✅ `calculated_body_fat_percentage` is calculated (approximately 24-25%)
- ✅ All input fields returned correctly

**Actual Result**: [PASS/FAIL]

**Body Fat %**: [Record calculated value]  
**Measurement ID**: [Save for goal creation]

---

### Test 1.4: Create Cutting Goal
**Endpoint**: `POST /api/v1/goals`

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "goal_type": "cutting",
    "initial_measurement_id": "{measurement_id}",
    "target_body_fat_percentage": 15.0
  }'
```

**Expected Result**:
- ✅ Status Code: 201 Created
- ✅ `status` is "active"
- ✅ `target_calories` calculated (should be TDEE - 300-500)
- ✅ `estimated_weeks_to_goal` calculated (approximately 40-60 weeks)
- ✅ `progress_percentage` is 0.0
- ✅ `is_on_track` is true

**Actual Result**: [PASS/FAIL]

**Goal ID**: [Save for progress tracking]  
**Target Calories**: [Record value]  
**Estimated Weeks**: [Record value]

---

### Test 1.5: Validation - Target Too Low
**Endpoint**: `POST /api/v1/goals`

**Request**: Create goal with target_body_fat_percentage = 3.0

**Expected Result**:
- ✅ Status Code: 422 Unprocessable Entity
- ✅ Error message mentions "safety threshold" or "too low"

**Actual Result**: [PASS/FAIL]

---

### Test 1.6: Validation - Missing Required Fields
**Endpoint**: `POST /api/v1/measurements`

**Request**: Create measurement without `waist_cm`

**Expected Result**:
- ✅ Status Code: 422 Unprocessable Entity
- ✅ Error details specify missing field

**Actual Result**: [PASS/FAIL]

---

### Test 1.7: Duplicate Active Goal Prevention
**Endpoint**: `POST /api/v1/goals`

**Request**: Attempt to create a second active goal

**Expected Result**:
- ✅ Status Code: 400 Bad Request
- ✅ Error message: "User already has an active goal"

**Actual Result**: [PASS/FAIL]

---

### Test 1.8: Validate Body Fat Calculation
**Manual Verification**

Using Navy Method formula:
- Male: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450

**Input**: waist=95cm, neck=38cm, height=175cm, gender=male

**Expected**: ~24.8% (±1%)

**Actual**: [Record from measurement creation]

**Result**: [PASS/FAIL]

---

### Test 1.9: Validate Calorie Calculation
**Manual Verification**

1. Calculate BMR (Mifflin-St Jeor):
   - Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
   - For weight=90kg, height=175cm, age=35: BMR ≈ 1765 kcal

2. Calculate TDEE:
   - moderately_active multiplier = 1.55
   - TDEE = 1765 * 1.55 ≈ 2736 kcal

3. Target Calories (cutting):
   - TDEE - 400 (default deficit)
   - 2736 - 400 = 2336 kcal

**Expected**: ~2200-2400 kcal

**Actual**: [Record from goal creation]

**Result**: [PASS/FAIL]

---

### Test 1.10: Only One Active Goal Per User
**Endpoint**: `GET /api/v1/goals`

**Request**:
```bash
curl -X GET http://localhost:8000/api/v1/goals \
  -H "Authorization: Bearer {access_token}"
```

**Expected Result**:
- ✅ Status Code: 200 OK
- ✅ Only 1 goal with `status: "active"`

**Actual Result**: [PASS/FAIL]

---

## User Story 2: Weekly Progress Tracking

### Test 2.1: Log Week 1 Measurement
**Endpoint**: `POST /api/v1/measurements`

**Request**: Create measurement with date 7 days after goal start

**Expected Result**:
- ✅ Status Code: 201 Created
- ✅ Body fat calculated correctly

**Actual Result**: [PASS/FAIL]

---

### Test 2.2: Create Progress Entry
**Endpoint**: `POST /api/v1/goals/{goal_id}/progress`

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/goals/{goal_id}/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "measurement_id": "{week1_measurement_id}"
  }'
```

**Expected Result**:
- ✅ Status Code: 201 Created
- ✅ `week_number` is 1
- ✅ `body_fat_change` is negative (loss)
- ✅ `weight_change_kg` is negative (loss)
- ✅ `is_on_track` is calculated correctly

**Actual Result**: [PASS/FAIL]

**Body Fat Change**: [Record]  
**Weight Change**: [Record]  
**On Track**: [Record]

---

### Test 2.3: View Progress History
**Endpoint**: `GET /api/v1/goals/{goal_id}/progress`

**Expected Result**:
- ✅ Status Code: 200 OK
- ✅ `entries` array contains 1 entry
- ✅ `total_entries` is 1

**Actual Result**: [PASS/FAIL]

---

### Test 2.4: Progress Entry Ordering
**Verification**: Entries should be ordered by logged_at DESC (newest first)

**Expected Result**:
- ✅ Entries are in reverse chronological order

**Actual Result**: [PASS/FAIL]

---

### Test 2.5: Cannot Create Duplicate Progress for Same Week
**Endpoint**: `POST /api/v1/goals/{goal_id}/progress`

**Request**: Attempt to create progress for same measurement again

**Expected Result**:
- ✅ Status Code: 400 Bad Request
- ✅ Error message mentions duplicate

**Actual Result**: [PASS/FAIL]

---

### Test 2.6-2.9: Create Multiple Progress Entries
**Action**: Create measurements and progress entries for weeks 2, 3, 4

**Expected Result**: All successful with incrementing week numbers

**Actual Result**: [PASS/FAIL]

---

### Test 2.10: View Trend Analysis (After 4+ Weeks)
**Endpoint**: `GET /api/v1/goals/{goal_id}/trends`

**Expected Result**:
- ✅ Status Code: 200 OK
- ✅ `data_points` array has 5+ entries (week 0 + 4 weeks)
- ✅ `statistics` includes average rates
- ✅ `smoothed_data` shows 4-week moving average
- ✅ `projected_weeks_remaining` calculated

**Actual Result**: [PASS/FAIL]

---

## User Story 3: Create Bulking Goal

### Test 3.1: Create Lean User
**Endpoint**: `POST /api/v1/users` (new user)

**Result**: [PASS/FAIL]

---

### Test 3.2: Create Lean Measurement
**Endpoint**: `POST /api/v1/measurements`

**Input**: weight=70kg, waist=75cm, neck=36cm

**Expected Body Fat**: ~12-13%

**Actual Result**: [PASS/FAIL]

---

### Test 3.3: Create Bulking Goal
**Endpoint**: `POST /api/v1/goals`

**Request**:
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

**Expected Result**:
- ✅ Status Code: 201 Created
- ✅ `goal_type` is "bulking"
- ✅ `target_calories` is TDEE + 200-300 (surplus)
- ✅ `estimated_weeks_to_goal` calculated

**Actual Result**: [PASS/FAIL]

---

### Test 3.4: Validation - Ceiling Too High
**Request**: Create bulking goal with ceiling = 35.0

**Expected Result**:
- ✅ Status Code: 422
- ✅ Error mentions ceiling too high

**Actual Result**: [PASS/FAIL]

---

### Test 3.5: Validation - Ceiling Below Current
**Request**: Create bulking goal with ceiling < current body fat

**Expected Result**:
- ✅ Status Code: 422
- ✅ Error mentions ceiling must be above current

**Actual Result**: [PASS/FAIL]

---

### Test 3.6: Bulking Calorie Surplus Validation
**Manual Verification**: Target calories should be TDEE + 200-300

**Expected**: ~2500-2800 kcal (for 70kg user)

**Actual**: [Record]

**Result**: [PASS/FAIL]

---

## User Story 4: Bulking Progress Tracking

### Test 4.1: Log Bulking Week 1
**Endpoint**: `POST /api/v1/measurements` + `POST /progress`

**Expected**:
- ✅ Weight increased by 0.3-0.5 kg
- ✅ Body fat increased slightly (0.1-0.3%)
- ✅ `is_on_track` is true

**Actual Result**: [PASS/FAIL]

---

### Test 4.2: Approaching Ceiling Alert
**Scenario**: Progress to within 1% of ceiling

**Expected**:
- ✅ Goal response includes alert message
- ✅ Alert mentions "approaching ceiling"

**Actual Result**: [PASS/FAIL]

---

### Test 4.3: Reaching Ceiling
**Scenario**: Body fat reaches ceiling value

**Expected**:
- ✅ Goal `status` changes to "completed"
- ✅ Completion date set
- ✅ Cannot create new progress on completed goal

**Actual Result**: [PASS/FAIL]

---

### Test 4.4: Bulking Rate Validation
**Verification**: Body fat should increase at 0.1-0.3% per week

**Actual Rate**: [Calculate from multiple weeks]

**Result**: [PASS/FAIL]

---

## User Story 5: Training and Diet Plans

### Test 5.1: Get Training Plan for Cutting
**Endpoint**: `GET /api/v1/goals/{cutting_goal_id}/training-plan`

**Expected Result**:
- ✅ Status Code: 200 OK
- ✅ `workout_frequency` present
- ✅ `primary_focus` mentions "fat loss" or "cutting"
- ✅ `plan_details` includes `strength_training` and `cardio`
- ✅ Cardio frequency >= 2 per week for cutting

**Actual Result**: [PASS/FAIL]

---

### Test 5.2: Get Training Plan for Bulking
**Endpoint**: `GET /api/v1/goals/{bulking_goal_id}/training-plan`

**Expected Result**:
- ✅ Status Code: 200 OK
- ✅ `primary_focus` mentions "muscle gain" or "bulking"
- ✅ Emphasis on progressive overload
- ✅ Less cardio than cutting plan

**Actual Result**: [PASS/FAIL]

---

### Test 5.3: Get Diet Plan for Cutting
**Endpoint**: `GET /api/v1/goals/{cutting_goal_id}/diet-plan`

**Expected Result**:
- ✅ Status Code: 200 OK
- ✅ `daily_calorie_target` matches goal target_calories
- ✅ `protein_grams` is high (2.2-2.6g/kg)
- ✅ `guidelines` mention muscle preservation

**Actual Result**: [PASS/FAIL]

**Protein**: [Record g/kg ratio]

---

### Test 5.4: Get Diet Plan for Bulking
**Endpoint**: `GET /api/v1/goals/{bulking_goal_id}/diet-plan`

**Expected Result**:
- ✅ Status Code: 200 OK
- ✅ `daily_calorie_target` in surplus
- ✅ `protein_grams` moderate (1.8-2.2g/kg)
- ✅ Higher carbs for muscle growth

**Actual Result**: [PASS/FAIL]

---

### Test 5.5: Macro Calculation Verification (Cutting)
**Manual Check**:
- Protein: 2.2 g/kg body weight
- Calculate protein calories: protein_g * 4
- Remaining calories split between carbs and fats

**Expected**: Macros sum to target_calories

**Actual Result**: [PASS/FAIL]

---

### Test 5.6: Macro Calculation Verification (Bulking)
**Manual Check**: Same as above but for bulking goal

**Actual Result**: [PASS/FAIL]

---

### Test 5.7: Meal Timing Recommendations
**Verification**: Diet plan includes meal timing

**Expected**:
- ✅ Pre-workout meal recommendations
- ✅ Post-workout meal recommendations
- ✅ Meal distribution percentages

**Actual Result**: [PASS/FAIL]

---

### Test 5.8: Training Plan Updates with Progress
**Scenario**: Get training plan after 12 weeks of progress

**Expected**:
- ✅ Plan still relevant
- ✅ Recommendations adjust to current status

**Actual Result**: [PASS/FAIL]

---

## Error Case Testing

### Test E.1: No Authentication Token
**Endpoint**: `GET /api/v1/goals/{goal_id}` (no Authorization header)

**Expected Result**:
- ✅ Status Code: 401 Unauthorized
- ✅ Error message indicates missing authentication

**Actual Result**: [PASS/FAIL]

---

### Test E.2: Invalid Authentication Token
**Endpoint**: Any protected endpoint with `Authorization: Bearer invalid_token`

**Expected Result**:
- ✅ Status Code: 401 Unauthorized
- ✅ Error message indicates invalid token

**Actual Result**: [PASS/FAIL]

---

### Test E.3: Expired Token
**Scenario**: Wait 15+ minutes after login, then make request

**Expected Result**:
- ✅ Status Code: 401 Unauthorized
- ✅ Error message indicates expired token

**Actual Result**: [PASS/FAIL]

---

### Test E.4: Access Another User's Goal
**Scenario**: User A tries to access User B's goal

**Expected Result**:
- ✅ Status Code: 403 Forbidden
- ✅ Error message indicates insufficient permissions

**Actual Result**: [PASS/FAIL]

---

### Test E.5: Invalid JSON Request
**Endpoint**: Any POST endpoint with malformed JSON

**Expected Result**:
- ✅ Status Code: 422 Unprocessable Entity
- ✅ Error message indicates JSON parse error

**Actual Result**: [PASS/FAIL]

---

## Performance Observations

| Endpoint | Average Response Time | Notes |
|----------|----------------------|-------|
| POST /users | ___ms | ___ |
| POST /auth/login | ___ms | ___ |
| POST /measurements | ___ms | ___ |
| POST /goals | ___ms | ___ |
| POST /goals/{id}/progress | ___ms | ___ |
| GET /goals/{id}/progress | ___ms | ___ |
| GET /goals/{id}/trends | ___ms | ___ |
| GET /goals/{id}/training-plan | ___ms | ___ |
| GET /goals/{id}/diet-plan | ___ms | ___ |

**Target**: All endpoints < 3 seconds (as per success criteria)

---

## Issues Found

### Critical Issues
1. [If any critical issues found, list here]

### Minor Issues
1. [If any minor issues found, list here]

### Suggestions
1. [Any improvements or suggestions]

---

## Conclusion

**Overall Result**: [PASS/FAIL]

**Recommendations**:
- [List any actions needed before production deployment]

**Sign-off**:
- Tester: _________________ Date: _______
- Reviewer: _________________ Date: _______

---

## Automated Test Script

For faster execution, use the provided script:

```bash
./scripts/manual_test.sh
```

This will automatically execute all test scenarios and report results.
