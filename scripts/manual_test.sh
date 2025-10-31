#!/bin/bash

# Manual End-to-End Testing Script for T121
# Based on quickstart.md user journeys
# Run this script with the API running at http://localhost:8000

set -e

BASE_URL="http://localhost:8000"
TEST_USER_EMAIL="john.doe.test.$(date +%s)@example.com"
TEST_PASSWORD="SecurePass123!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
TOTAL=0

# Helper function to print test results
print_result() {
    local test_name=$1
    local expected=$2
    local actual=$3
    
    TOTAL=$((TOTAL + 1))
    
    if [[ "$actual" == "$expected" ]]; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - $test_name (expected: $expected, got: $actual)"
        FAILED=$((FAILED + 1))
    fi
}

# Helper function to extract JSON field
get_json_field() {
    local json=$1
    local field=$2
    echo "$json" | python3 -c "import sys, json; print(json.load(sys.stdin)['$field'])" 2>/dev/null || echo ""
}

echo "========================================="
echo "Manual End-to-End Testing - T121"
echo "========================================="
echo ""

# Check if API is running
echo "Checking API health..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
print_result "API Health Check" "200" "$HTTP_CODE"
echo ""

if [[ "$HTTP_CODE" != "200" ]]; then
    echo -e "${RED}ERROR: API is not responding. Please start the server with:${NC}"
    echo "  uvicorn src.api.main:app --host 0.0.0.0 --port 8000"
    exit 1
fi

echo "========================================="
echo "User Story 1: Create Cutting Goal"
echo "========================================="
echo ""

# Step 1: Register User
echo "Step 1: Registering test user..."
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/users" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_USER_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"full_name\": \"John Doe Test\",
    \"date_of_birth\": \"1990-05-15\",
    \"gender\": \"male\",
    \"height_cm\": 175.0,
    \"preferred_calculation_method\": \"navy\",
    \"activity_level\": \"moderately_active\"
  }")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')
print_result "User Registration" "201" "$HTTP_CODE"

if [[ "$HTTP_CODE" == "201" ]]; then
    USER_ID=$(get_json_field "$REGISTER_BODY" "id")
    echo "  User ID: $USER_ID"
fi
echo ""

# Step 2: Login
echo "Step 2: Logging in..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_USER_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')
print_result "User Login" "200" "$HTTP_CODE"

if [[ "$HTTP_CODE" == "200" ]]; then
    ACCESS_TOKEN=$(get_json_field "$LOGIN_BODY" "access_token")
    echo "  Access Token: ${ACCESS_TOKEN:0:20}..."
fi
echo ""

# Step 3: Create Initial Measurement
echo "Step 3: Creating initial measurement..."
MEASUREMENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/measurements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "weight_kg": 90.0,
    "calculation_method": "navy",
    "waist_cm": 95.0,
    "neck_cm": 38.0,
    "measured_at": "2025-10-23T08:00:00Z"
  }')

HTTP_CODE=$(echo "$MEASUREMENT_RESPONSE" | tail -n1)
MEASUREMENT_BODY=$(echo "$MEASUREMENT_RESPONSE" | sed '$d')
print_result "Create Measurement" "201" "$HTTP_CODE"

if [[ "$HTTP_CODE" == "201" ]]; then
    MEASUREMENT_ID=$(get_json_field "$MEASUREMENT_BODY" "id")
    BODY_FAT=$(get_json_field "$MEASUREMENT_BODY" "calculated_body_fat_percentage")
    echo "  Measurement ID: $MEASUREMENT_ID"
    echo "  Calculated Body Fat: ${BODY_FAT}%"
fi
echo ""

# Step 4: Create Cutting Goal
echo "Step 4: Creating cutting goal..."
GOAL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/goals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"goal_type\": \"cutting\",
    \"initial_measurement_id\": \"$MEASUREMENT_ID\",
    \"target_body_fat_percentage\": 15.0
  }")

HTTP_CODE=$(echo "$GOAL_RESPONSE" | tail -n1)
GOAL_BODY=$(echo "$GOAL_RESPONSE" | sed '$d')
print_result "Create Cutting Goal" "201" "$HTTP_CODE"

if [[ "$HTTP_CODE" == "201" ]]; then
    GOAL_ID=$(get_json_field "$GOAL_BODY" "id")
    TARGET_CALORIES=$(get_json_field "$GOAL_BODY" "target_calories")
    ESTIMATED_WEEKS=$(get_json_field "$GOAL_BODY" "estimated_weeks_to_goal")
    echo "  Goal ID: $GOAL_ID"
    echo "  Target Calories: $TARGET_CALORIES"
    echo "  Estimated Weeks: $ESTIMATED_WEEKS"
fi
echo ""

echo "========================================="
echo "User Story 2: Weekly Progress Tracking"
echo "========================================="
echo ""

# Step 5: Log Week 1 Measurement
echo "Step 5: Logging Week 1 measurement..."
WEEK1_MEASUREMENT=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/measurements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "weight_kg": 89.3,
    "calculation_method": "navy",
    "waist_cm": 94.2,
    "neck_cm": 38.0,
    "measured_at": "2025-10-30T08:00:00Z"
  }')

HTTP_CODE=$(echo "$WEEK1_MEASUREMENT" | tail -n1)
WEEK1_BODY=$(echo "$WEEK1_MEASUREMENT" | sed '$d')
print_result "Week 1 Measurement" "201" "$HTTP_CODE"

if [[ "$HTTP_CODE" == "201" ]]; then
    WEEK1_MEASUREMENT_ID=$(get_json_field "$WEEK1_BODY" "id")
    WEEK1_BODY_FAT=$(get_json_field "$WEEK1_BODY" "calculated_body_fat_percentage")
    echo "  Measurement ID: $WEEK1_MEASUREMENT_ID"
    echo "  Body Fat: ${WEEK1_BODY_FAT}%"
fi
echo ""

# Step 6: Create Progress Entry
echo "Step 6: Creating progress entry..."
PROGRESS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/goals/$GOAL_ID/progress" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"measurement_id\": \"$WEEK1_MEASUREMENT_ID\"
  }")

HTTP_CODE=$(echo "$PROGRESS_RESPONSE" | tail -n1)
PROGRESS_BODY=$(echo "$PROGRESS_RESPONSE" | sed '$d')
print_result "Create Progress Entry" "201" "$HTTP_CODE"

if [[ "$HTTP_CODE" == "201" ]]; then
    WEEK_NUMBER=$(get_json_field "$PROGRESS_BODY" "week_number")
    BODY_FAT_CHANGE=$(get_json_field "$PROGRESS_BODY" "body_fat_change")
    WEIGHT_CHANGE=$(get_json_field "$PROGRESS_BODY" "weight_change_kg")
    IS_ON_TRACK=$(get_json_field "$PROGRESS_BODY" "is_on_track")
    echo "  Week Number: $WEEK_NUMBER"
    echo "  Body Fat Change: ${BODY_FAT_CHANGE}%"
    echo "  Weight Change: ${WEIGHT_CHANGE} kg"
    echo "  On Track: $IS_ON_TRACK"
fi
echo ""

# Step 7: View Progress History
echo "Step 7: Viewing progress history..."
HISTORY_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/goals/$GOAL_ID/progress" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$HISTORY_RESPONSE" | tail -n1)
print_result "View Progress History" "200" "$HTTP_CODE"
echo ""

echo "========================================="
echo "User Story 5: Training and Diet Plans"
echo "========================================="
echo ""

# Step 14: Get Training Plan
echo "Step 14: Getting training plan..."
TRAINING_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/goals/$GOAL_ID/training-plan" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$TRAINING_RESPONSE" | tail -n1)
print_result "Get Training Plan" "200" "$HTTP_CODE"
echo ""

# Step 15: Get Diet Plan
echo "Step 15: Getting diet plan..."
DIET_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/goals/$GOAL_ID/diet-plan" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$DIET_RESPONSE" | tail -n1)
print_result "Get Diet Plan" "200" "$HTTP_CODE"
echo ""

echo "========================================="
echo "Error Case Testing"
echo "========================================="
echo ""

# Test: No authentication token
echo "Testing: Access without token..."
NO_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/goals/$GOAL_ID")
HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | tail -n1)
print_result "No Auth Token (401)" "401" "$HTTP_CODE"
echo ""

# Test: Invalid token
echo "Testing: Invalid token..."
INVALID_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/goals/$GOAL_ID" \
  -H "Authorization: Bearer invalid_token_123")
HTTP_CODE=$(echo "$INVALID_TOKEN_RESPONSE" | tail -n1)
print_result "Invalid Auth Token (401)" "401" "$HTTP_CODE"
echo ""

# Test: Invalid body fat target (too low)
echo "Testing: Invalid target body fat (too low)..."
INVALID_TARGET_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/goals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"goal_type\": \"cutting\",
    \"initial_measurement_id\": \"$MEASUREMENT_ID\",
    \"target_body_fat_percentage\": 3.0
  }")
HTTP_CODE=$(echo "$INVALID_TARGET_RESPONSE" | tail -n1)
print_result "Target Too Low (422)" "422" "$HTTP_CODE"
echo ""

# Test: Missing required measurement fields
echo "Testing: Missing required measurement fields..."
MISSING_FIELDS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/measurements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "weight_kg": 90.0,
    "calculation_method": "navy"
  }')
HTTP_CODE=$(echo "$MISSING_FIELDS_RESPONSE" | tail -n1)
print_result "Missing Fields (422)" "422" "$HTTP_CODE"
echo ""

echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    exit 1
fi
