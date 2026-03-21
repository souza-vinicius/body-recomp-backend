#!/bin/bash
# Simple performance test for T122 validation

echo "=== T122 Performance Test ==="
echo "Testing API endpoints under light load..."
echo ""

BASE_URL="http://localhost:8000"
SUCCESS=0
FAIL=0

# Test 1: Health check (should be fast)
echo "Test 1: Health check response time..."
START=$(date +%s%N)
RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null $BASE_URL/health)
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))

if [ "$RESPONSE" -eq 200 ] && [ "$DURATION" -lt 200 ]; then
  echo "✓ Health check: ${DURATION}ms (< 200ms target)"
  ((SUCCESS++))
else
  echo "✗ Health check: ${DURATION}ms (FAILED)"
  ((FAIL++))
fi

# Test 2: User registration
echo ""
echo "Test 2: User registration response time..."
TIMESTAMP=$(date +%s)
EMAIL="perftest${TIMESTAMP}@example.com"

START=$(date +%s%N)
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/user_response.json -X POST $BASE_URL/api/v1/users \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"TestPass123!\",
    \"full_name\": \"Perf Test\",
    \"date_of_birth\": \"1990-01-01\",
    \"gender\": \"male\",
    \"height_cm\": 175.0,
    \"preferred_calculation_method\": \"navy\",
    \"activity_level\": \"moderately_active\"
  }")
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))

if [ "$RESPONSE" -eq 201 ] && [ "$DURATION" -lt 500 ]; then
  echo "✓ User registration: ${DURATION}ms (< 500ms acceptable)"
  USER_ID=$(cat /tmp/user_response.json | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
  ((SUCCESS++))
else
  echo "✗ User registration: ${DURATION}ms (FAILED - status: $RESPONSE)"
  ((FAIL++))
  exit 1
fi

# Test 3: Login
echo ""
echo "Test 3: Login response time..."
START=$(date +%s%N)
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/login_response.json -X POST $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"TestPass123!\"
  }")
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))

if [ "$RESPONSE" -eq 200 ] && [ "$DURATION" -lt 300 ]; then
  echo "✓ Login: ${DURATION}ms (< 300ms acceptable)"
  ACCESS_TOKEN=$(cat /tmp/login_response.json | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
  ((SUCCESS++))
else
  echo "✗ Login: ${DURATION}ms (FAILED - status: $RESPONSE)"
  ((FAIL++))
  exit 1
fi

# Test 4: Create measurement
echo ""
echo "Test 4: Create measurement response time..."
MEASURED_AT=$(date -u +"%Y-%m-%dT%H:%M:%S")

START=$(date +%s%N)
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/measurement_response.json -X POST $BASE_URL/api/v1/measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"weight_kg\": 80.0,
    \"calculation_method\": \"navy\",
    \"waist_cm\": 85.0,
    \"neck_cm\": 36.0,
    \"measured_at\": \"$MEASURED_AT\"
  }")
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))

if [ "$RESPONSE" -eq 201 ] && [ "$DURATION" -lt 300 ]; then
  echo "✓ Create measurement: ${DURATION}ms (< 300ms acceptable)"
  MEASUREMENT_ID=$(cat /tmp/measurement_response.json | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
  ((SUCCESS++))
else
  echo "✗ Create measurement: ${DURATION}ms (FAILED - status: $RESPONSE)"
  ((FAIL++))
  exit 1
fi

# Test 5: Create goal
echo ""
echo "Test 5: Create goal response time..."
START=$(date +%s%N)
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/goal_response.json -X POST $BASE_URL/api/v1/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"goal_type\": \"CUTTING\",
    \"target_body_fat_percentage\": 12.0,
    \"initial_measurement_id\": \"$MEASUREMENT_ID\"
  }")
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))

if [ "$RESPONSE" -eq 201 ] && [ "$DURATION" -lt 400 ]; then
  echo "✓ Create goal: ${DURATION}ms (< 400ms acceptable)"
  GOAL_ID=$(cat /tmp/goal_response.json | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
  ((SUCCESS++))
else
  echo "✗ Create goal: ${DURATION}ms (FAILED - status: $RESPONSE)"
  ((FAIL++))
fi

# Summary
echo ""
echo "=== Test Summary ==="
echo "Passed: $SUCCESS"
echo "Failed: $FAIL"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo "✓ T122 Performance Test: PASSED"
  echo "All endpoints responded within acceptable time limits."
  exit 0
else
  echo "✗ T122 Performance Test: FAILED"
  echo "Some endpoints did not meet performance requirements."
  exit 1
fi
