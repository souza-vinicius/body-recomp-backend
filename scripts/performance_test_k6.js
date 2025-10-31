// Performance Testing Script for T122 using k6
// Tests 100 concurrent users creating goals and logging progress
// Target: <200ms p95 response time

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users for 3 minutes
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    errors: ['rate<0.05'],            // Custom error rate less than 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// Generate unique test data
function generateEmail() {
  return `testuser${Date.now()}${Math.random().toString(36).substring(7)}@example.com`;
}

export default function () {
  const email = generateEmail();
  const password = 'TestPassword123!';
  
  // Step 1: Register user
  let registerRes = http.post(`${BASE_URL}/api/v1/users`, JSON.stringify({
    email: email,
    password: password,
    full_name: 'Load Test User',
    date_of_birth: '1990-01-01',
    gender: 'male',
    height_cm: 175.0,
    preferred_calculation_method: 'navy',
    activity_level: 'moderately_active'
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'RegisterUser' },
  });
  
  check(registerRes, {
    'register status is 201': (r) => r.status === 201,
  }) || errorRate.add(1);
  
  if (registerRes.status !== 201) {
    console.error(`Registration failed: ${registerRes.status} ${registerRes.body}`);
    return;
  }
  
  const userId = JSON.parse(registerRes.body).id;
  sleep(0.5);
  
  // Step 2: Login
  let loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    email: email,
    password: password
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'Login' },
  });
  
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'access token exists': (r) => JSON.parse(r.body).access_token !== undefined,
  }) || errorRate.add(1);
  
  if (loginRes.status !== 200) {
    console.error(`Login failed: ${loginRes.status}`);
    return;
  }
  
  const accessToken = JSON.parse(loginRes.body).access_token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
  sleep(0.5);
  
  // Step 3: Create measurement
  let measurementRes = http.post(`${BASE_URL}/api/v1/measurements`, JSON.stringify({
    weight_kg: 80.0 + Math.random() * 20,
    calculation_method: 'navy',
    waist_cm: 85.0 + Math.random() * 15,
    neck_cm: 36.0 + Math.random() * 4,
    measured_at: new Date().toISOString()
  }), {
    headers: authHeaders,
    tags: { name: 'CreateMeasurement' },
  });
  
  check(measurementRes, {
    'measurement status is 201': (r) => r.status === 201,
    'body fat calculated': (r) => JSON.parse(r.body).calculated_body_fat_percentage > 0,
  }) || errorRate.add(1);
  
  if (measurementRes.status !== 201) {
    console.error(`Measurement creation failed: ${measurementRes.status}`);
    return;
  }
  
  const measurementId = JSON.parse(measurementRes.body).id;
  sleep(0.5);
  
  // Step 4: Create goal
  const goalType = Math.random() > 0.5 ? 'cutting' : 'bulking';
  const goalPayload = {
    goal_type: goalType,
    initial_measurement_id: measurementId,
  };
  
  if (goalType === 'cutting') {
    goalPayload.target_body_fat_percentage = 12.0;
  } else {
    goalPayload.ceiling_body_fat_percentage = 20.0;
  }
  
  let goalRes = http.post(`${BASE_URL}/api/v1/goals`, JSON.stringify(goalPayload), {
    headers: authHeaders,
    tags: { name: 'CreateGoal' },
  });
  
  check(goalRes, {
    'goal status is 201': (r) => r.status === 201,
    'goal has target calories': (r) => JSON.parse(r.body).target_calories > 0,
    'goal has estimated weeks': (r) => JSON.parse(r.body).estimated_weeks_to_goal > 0,
  }) || errorRate.add(1);
  
  if (goalRes.status !== 201) {
    console.error(`Goal creation failed: ${goalRes.status}`);
    return;
  }
  
  const goalId = JSON.parse(goalRes.body).id;
  sleep(1);
  
  // Step 5: Log progress (simulate week 1)
  let progressMeasurementRes = http.post(`${BASE_URL}/api/v1/measurements`, JSON.stringify({
    weight_kg: 79.0 + Math.random() * 20,
    calculation_method: 'navy',
    waist_cm: 84.0 + Math.random() * 15,
    neck_cm: 36.0 + Math.random() * 4,
    measured_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }), {
    headers: authHeaders,
    tags: { name: 'CreateProgressMeasurement' },
  });
  
  if (progressMeasurementRes.status === 201) {
    const progressMeasurementId = JSON.parse(progressMeasurementRes.body).id;
    sleep(0.5);
    
    // Create progress entry
    let progressRes = http.post(
      `${BASE_URL}/api/v1/goals/${goalId}/progress`,
      JSON.stringify({ measurement_id: progressMeasurementId }),
      {
        headers: authHeaders,
        tags: { name: 'LogProgress' },
      }
    );
    
    check(progressRes, {
      'progress status is 201': (r) => r.status === 201,
      'progress has week number': (r) => JSON.parse(r.body).week_number >= 0,
    }) || errorRate.add(1);
  }
  
  sleep(0.5);
  
  // Step 6: Get training plan
  let trainingPlanRes = http.get(`${BASE_URL}/api/v1/goals/${goalId}/training-plan`, {
    headers: authHeaders,
    tags: { name: 'GetTrainingPlan' },
  });
  
  check(trainingPlanRes, {
    'training plan status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(0.5);
  
  // Step 7: Get diet plan
  let dietPlanRes = http.get(`${BASE_URL}/api/v1/goals/${goalId}/diet-plan`, {
    headers: authHeaders,
    tags: { name: 'GetDietPlan' },
  });
  
  check(dietPlanRes, {
    'diet plan status is 200': (r) => r.status === 200,
    'diet plan has calories': (r) => JSON.parse(r.body).daily_calorie_target > 0,
  }) || errorRate.add(1);
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'performance_test_results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n' + indent + '=== Performance Test Summary ===\n\n';
  
  if (data.metrics.http_req_duration) {
    const p95 = data.metrics.http_req_duration.values['p(95)'];
    const avg = data.metrics.http_req_duration.values.avg;
    const max = data.metrics.http_req_duration.values.max;
    
    summary += indent + `Response Times:\n`;
    summary += indent + `  Average: ${avg.toFixed(2)}ms\n`;
    summary += indent + `  P95: ${p95.toFixed(2)}ms ${p95 < 200 ? '✓' : '✗'}\n`;
    summary += indent + `  Max: ${max.toFixed(2)}ms\n\n`;
  }
  
  if (data.metrics.http_reqs) {
    summary += indent + `Total Requests: ${data.metrics.http_reqs.values.count}\n`;
    summary += indent + `Requests/sec: ${data.metrics.http_reqs.values.rate.toFixed(2)}\n\n`;
  }
  
  if (data.metrics.http_req_failed) {
    const failRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += indent + `Failed Requests: ${failRate}% ${failRate < 1 ? '✓' : '✗'}\n\n`;
  }
  
  return summary;
}
