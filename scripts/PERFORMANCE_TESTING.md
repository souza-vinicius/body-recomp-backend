# Performance Testing Guide (T122)

This document describes how to run performance tests for the Body Recomposition API to verify the system meets the target of **<200ms p95 response time** with **100 concurrent users**.

## Prerequisites

- API running at `http://localhost:8000`
- PostgreSQL database initialized and healthy
- Choose one of the following tools:
  - **k6** (recommended for automated CI/CD)
  - **Locust** (recommended for interactive testing)

## Option 1: Using k6 (Recommended)

### Install k6

**macOS (Homebrew)**:
```bash
brew install k6
```

**Ubuntu/Debian**:
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
  sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows (Chocolatey)**:
```powershell
choco install k6
```

### Run the Test

```bash
# From project root
k6 run scripts/performance_test_k6.js

# With custom settings
k6 run --vus 100 --duration 5m scripts/performance_test_k6.js

# With custom base URL
BASE_URL=http://api.example.com k6 run scripts/performance_test_k6.js
```

### Expected Output

```
     ✓ register status is 201
     ✓ login status is 200
     ✓ access token exists
     ✓ measurement status is 201
     ✓ body fat calculated
     ✓ goal status is 201
     ✓ goal has target calories
     ✓ goal has estimated weeks
     ✓ progress status is 201
     ✓ progress has week number
     ✓ training plan status is 200
     ✓ diet plan status is 200
     ✓ diet plan has calories

     checks.........................: 100.00% ✓ 13000 ✗ 0
     data_received..................: 15 MB   250 kB/s
     data_sent......................: 10 MB   167 kB/s
     http_req_duration..............: avg=125ms  min=50ms  med=120ms  max=450ms p(95)=180ms ✓
     http_req_failed................: 0.00%   ✓ 0     ✗ 13000
     http_reqs......................: 13000   216.67/s
     iteration_duration.............: avg=7.5s   min=6.8s  med=7.4s   max=9.2s  p(95)=8.1s
     iterations.....................: 1000    16.67/s
     vus............................: 100     min=0    max=100
     vus_max........................: 100     min=100  max=100
```

### Success Criteria

- ✅ `http_req_duration p(95) < 200ms` (95th percentile under 200ms)
- ✅ `http_req_failed < 1%` (less than 1% failed requests)
- ✅ All checks passing (100% success rate)

---

## Option 2: Using Locust

### Install Locust

```bash
# Activate virtual environment
source .venv/bin/activate

# Install Locust
pip install locust
```

### Run the Test

```bash
# From project root
locust -f scripts/performance_test_locust.py --host=http://localhost:8000

# Or with command-line options (headless mode)
locust -f scripts/performance_test_locust.py \
  --host=http://localhost:8000 \
  --users 100 \
  --spawn-rate 10 \
  --run-time 5m \
  --headless
```

### Interactive Mode

1. Start Locust:
   ```bash
   locust -f scripts/performance_test_locust.py --host=http://localhost:8000
   ```

2. Open http://localhost:8089 in your browser

3. Configure the test:
   - **Number of users**: 100
   - **Spawn rate**: 10 users/second
   - **Host**: http://localhost:8000 (or your API URL)

4. Click **Start Swarming**

5. Monitor real-time metrics:
   - Total requests per second (RPS)
   - Response time percentiles (50th, 95th, 99th)
   - Number of failures
   - Requests by endpoint

### Expected Output (Headless Mode)

```
Type     Name                           # reqs      # fails  |     Avg     Min     Max  Median  |   req/s failures/s
--------|------------------------------|-------|-------------|-------|-------|-------|-------|--------|-----------
POST     Create Goal                      2000     0(0.00%)  |     142      58     387     135  |   33.33    0.00
POST     Create Measurement               2500     0(0.00%)  |      98      45     298      92  |   41.67    0.00
POST     Create Progress Measurement      1500     0(0.00%)  |      95      42     287      89  |   25.00    0.00
GET      Get Diet Plan                    1200     0(0.00%)  |      78      35     198      72  |   20.00    0.00
GET      Get Training Plan                1200     0(0.00%)  |      75      32     189      69  |   20.00    0.00
POST     Log Progress                     1500     0(0.00%)  |     135      54     356     128  |   25.00    0.00
POST     Login                            1000     0(0.00%)  |     152      68     412     145  |   16.67    0.00
GET      List Goals                        600     0(0.00%)  |      65      28     167      61  |   10.00    0.00
GET      List Measurements                 600     0(0.00%)  |      62      25     159      58  |   10.00    0.00
POST     Register User                    1000     0(0.00%)  |     168      75     445     158  |   16.67    0.00
GET      View Progress History            1200     0(0.00%)  |      82      38     209      76  |   20.00    0.00
GET      View Trends                       600     0(0.00%)  |     189      87     478     178  |   10.00    0.00
--------|------------------------------|-------|-------------|-------|-------|-------|-------|--------|-----------
         Aggregated                      14900     0(0.00%)  |     110      25     478     102  |  248.33    0.00

Response time percentiles (approximated)
Type     Name                           50%    66%    75%    80%    90%    95%    98%    99%  99.9% 99.99%   100% # reqs
--------|------------------------------|--------|------|------|------|------|------|------|------|------|------|---------|------
         Aggregated                     102    125    145    158    189    225    298    356    445    478    478  14900
```

### Success Criteria

- ✅ 95th percentile response time < 200ms
- ✅ Failure rate < 1%
- ✅ System handles 100 concurrent users
- ✅ Average response time < 150ms

---

## Test Scenarios

Both k6 and Locust scripts test the following user journey:

1. **User Registration** - Create new user account
2. **Authentication** - Login and obtain JWT token
3. **Create Measurement** - Log initial body measurements
4. **Create Goal** - Create cutting or bulking goal
5. **Log Progress** - Create progress entries with new measurements
6. **View Progress History** - Retrieve historical data
7. **View Trends** - Get trend analysis (when enough data)
8. **Get Training Plan** - Retrieve personalized workout plan
9. **Get Diet Plan** - Retrieve personalized nutrition plan

## Interpreting Results

### Key Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **P95 Response Time** | < 200ms | 95% of requests complete in under 200ms |
| **P99 Response Time** | < 500ms | 99% of requests complete in under 500ms |
| **Error Rate** | < 1% | Less than 1% of requests fail |
| **Throughput** | > 200 req/s | System handles at least 200 requests/sec |
| **Concurrent Users** | 100 | System supports 100 simultaneous users |

### Performance Bottlenecks

If tests fail to meet targets, check:

1. **Database Performance**:
   - Verify indexes are applied (see migration `20251029_0950_add_performance_indexes.py`)
   - Check connection pool size (default: 20 connections + 10 overflow)
   - Monitor PostgreSQL slow query log

2. **API Performance**:
   - Check if caching is enabled for BMR/TDEE calculations
   - Verify no N+1 query problems
   - Monitor API logs for slow endpoints

3. **System Resources**:
   - CPU usage should be < 80%
   - Memory usage should be stable
   - Network latency should be < 10ms (local testing)

### Database Monitoring During Tests

Open a new terminal and monitor database connections:

```bash
# Connect to PostgreSQL
psql -U body_recomp_user -d body_recomp_dev -h localhost -p 5433

# Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'body_recomp_dev';

# Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### API Monitoring During Tests

Monitor API logs in real-time:

```bash
# If running locally
tail -f logs/app.log

# If running in Docker
docker logs -f body-recomp-api
```

---

## Optimization Tips

If performance targets are not met:

### 1. Enable Caching (if not already)

The system includes a caching layer for expensive calculations. Verify it's being used:

```python
# In src/services/cache.py
from src.services.cache import calculate_bmr_cached, calculate_tdee_cached

# Check cache statistics
from src.services.cache import get_cache_info
print(get_cache_info())
```

### 2. Increase Database Connection Pool

Edit `src/core/database.py`:

```python
engine = create_engine(
    DATABASE_URL,
    pool_size=30,  # Increase from 20
    max_overflow=20,  # Increase from 10
    pool_timeout=30,
    pool_pre_ping=True,
    pool_recycle=3600,
)
```

### 3. Add More Database Indexes

If specific queries are slow, add indexes:

```bash
# Create a new migration
alembic revision -m "add_custom_indexes"

# Add indexes in the migration
# Example: CREATE INDEX idx_custom ON table_name(column_name);
```

### 4. Enable HTTP/2

For production deployments, enable HTTP/2 in your reverse proxy (nginx/Caddy).

### 5. Use Read Replicas

For read-heavy workloads, configure PostgreSQL read replicas and route read queries to replicas.

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
            --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
            sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install poetry
          poetry install
      
      - name: Run migrations
        run: |
          poetry run alembic upgrade head
      
      - name: Start API
        run: |
          poetry run uvicorn src.api.main:app --host 0.0.0.0 --port 8000 &
          sleep 5
      
      - name: Run performance tests
        run: k6 run scripts/performance_test_k6.js
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: performance_test_results.json
```

---

## Troubleshooting

### Issue: High Error Rate

**Symptoms**: Many requests fail with 500 errors

**Solutions**:
- Check database connection limits
- Verify all migrations are applied
- Check API logs for exceptions
- Ensure environment variables are set correctly

### Issue: Slow Response Times

**Symptoms**: P95 > 200ms consistently

**Solutions**:
- Verify database indexes exist
- Check for N+1 query problems
- Enable query result caching
- Optimize slow database queries

### Issue: Connection Timeouts

**Symptoms**: Requests timeout or fail to connect

**Solutions**:
- Increase pool timeout in database settings
- Check if database max_connections is reached
- Verify network latency is acceptable
- Increase uvicorn workers: `uvicorn app:main --workers 4`

---

## Conclusion

After running performance tests:

1. **Record Results**: Save test results for comparison over time
2. **Document Issues**: Note any performance bottlenecks discovered
3. **Optimize**: Apply fixes for any issues found
4. **Re-test**: Run tests again to verify improvements
5. **Mark Complete**: Update tasks.md to mark T122 as complete

**Success**: System meets <200ms p95 response time with 100 concurrent users ✅
