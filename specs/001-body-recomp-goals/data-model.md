# Data Model: Body Recomposition Goal Tracking

**Feature**: Body Recomposition Goal Tracking  
**Date**: 2025-10-23  
**Status**: Complete

## Overview

This document defines the data entities, relationships, and validation rules for the body recomposition tracking system. All entities support multi-tenancy through user_id foreign keys and enforce data isolation at the database and API layers.

---

## Entity Relationship Diagram

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│   BodyMeasurement   │
└─────────────────────┘

       │ 1:N
       │
┌──────▼───────┐
│     Goal     │
└──────┬───────┘
       │
       ├─ 1:N ──┬──────────────┐
       │        │              │
┌──────▼─────┐ ┌▼──────────┐ ┌▼─────────┐
│  Progress  │ │  Training │ │   Diet   │
│   Entry    │ │    Plan   │ │   Plan   │
└────────────┘ └───────────┘ └──────────┘
```

---

## Entities

### 1. User

Represents a registered user of the system.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | String(255) | UNIQUE, NOT NULL, INDEX | User's email (login) |
| hashed_password | String(255) | NOT NULL | bcrypt hashed password |
| full_name | String(255) | NOT NULL | User's full name |
| date_of_birth | Date | NOT NULL | For age calculation |
| gender | Enum | NOT NULL | 'male' or 'female' |
| height_cm | Decimal(5,2) | NOT NULL, CHECK > 0 | Height in centimeters |
| preferred_calculation_method | Enum | NOT NULL | 'navy', '3_site', '7_site' |
| activity_level | Enum | NOT NULL | Activity multiplier category |
| created_at | Timestamp | NOT NULL, DEFAULT NOW() | Account creation |
| updated_at | Timestamp | NOT NULL, DEFAULT NOW() | Last profile update |

**Enums**:
- **Gender**: `male`, `female`
- **CalculationMethod**: `navy`, `3_site`, `7_site`
- **ActivityLevel**: `sedentary`, `lightly_active`, `moderately_active`, `very_active`, `extremely_active`

**Validation Rules**:
- Email must be valid format
- Height: 120 cm ≤ height ≤ 250 cm
- Date of birth: Age must be 13-120 years
- Password: Minimum 8 characters (enforced at API layer before hashing)

**Relationships**:
- One User → Many Goals
- One User → Many BodyMeasurements

**Indexes**:
- PRIMARY KEY on id
- UNIQUE INDEX on email
- INDEX on created_at (for admin queries)

---

### 2. BodyMeasurement

A snapshot of user's body measurements at a specific point in time.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY → User.id, NOT NULL, INDEX | Owner of measurement |
| weight_kg | Decimal(5,2) | NOT NULL, CHECK > 0 | Weight in kilograms |
| calculation_method | Enum | NOT NULL | Method used for this measurement |
| waist_cm | Decimal(5,2) | NULL | Waist circumference (Navy, 3-site, 7-site) |
| neck_cm | Decimal(5,2) | NULL | Neck circumference (Navy) |
| hip_cm | Decimal(5,2) | NULL | Hip circumference (Navy - women) |
| chest_mm | Decimal(5,2) | NULL | Chest skinfold (3-site, 7-site) |
| abdomen_mm | Decimal(5,2) | NULL | Abdomen skinfold (3-site, 7-site) |
| thigh_mm | Decimal(5,2) | NULL | Thigh skinfold (3-site, 7-site) |
| tricep_mm | Decimal(5,2) | NULL | Tricep skinfold (3-site, 7-site) |
| suprailiac_mm | Decimal(5,2) | NULL | Suprailiac skinfold (3-site, 7-site) |
| midaxillary_mm | Decimal(5,2) | NULL | Midaxillary skinfold (7-site) |
| subscapular_mm | Decimal(5,2) | NULL | Subscapular skinfold (7-site) |
| calculated_body_fat_percentage | Decimal(4,2) | NOT NULL, CHECK >= 3 AND <= 50 | Calculated BF% |
| notes | Text | NULL | Optional user notes |
| measured_at | Timestamp | NOT NULL, INDEX | When measurement taken |
| created_at | Timestamp | NOT NULL, DEFAULT NOW() | When record created |

**Validation Rules by Method**:

**Navy Method**:
- Required: waist_cm, neck_cm, height (from User)
- Required (women only): hip_cm
- Weight: 30 kg ≤ weight ≤ 300 kg
- Circumferences: 10 cm ≤ value ≤ 200 cm

**3-Site Skinfold**:
- Required: chest_mm, abdomen_mm, thigh_mm (men) OR tricep_mm, suprailiac_mm, thigh_mm (women)
- Weight: 30 kg ≤ weight ≤ 300 kg
- Skinfolds: 1 mm ≤ value ≤ 70 mm

**7-Site Skinfold**:
- Required: chest_mm, midaxillary_mm, tricep_mm, subscapular_mm, abdomen_mm, suprailiac_mm, thigh_mm
- Weight: 30 kg ≤ weight ≤ 300 kg
- Skinfolds: 1 mm ≤ value ≤ 70 mm

**Calculated Body Fat**:
- 3% ≤ body_fat_percentage ≤ 50%
- Calculated server-side using formulas from research.md

**Relationships**:
- Many BodyMeasurements → One User
- One BodyMeasurement → Zero or One ProgressEntry

**Indexes**:
- PRIMARY KEY on id
- INDEX on user_id, measured_at (for time-series queries)
- INDEX on user_id, created_at

**Business Rules**:
- calculation_method must match User.preferred_calculation_method at creation time
- Only measurements required for selected method should be populated (others NULL)
- measured_at cannot be in the future

---

### 3. Goal

Represents a user's body recomposition goal (cutting or bulking).

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY → User.id, NOT NULL, INDEX | Goal owner |
| goal_type | Enum | NOT NULL | 'cutting' or 'bulking' |
| status | Enum | NOT NULL, DEFAULT 'active' | Goal lifecycle status |
| initial_measurement_id | UUID | FOREIGN KEY → BodyMeasurement.id, NOT NULL | Starting measurement |
| initial_body_fat_percentage | Decimal(4,2) | NOT NULL | Starting body fat % |
| target_body_fat_percentage | Decimal(4,2) | NULL | Target BF% (cutting only) |
| ceiling_body_fat_percentage | Decimal(4,2) | NULL | Max BF% (bulking only) |
| initial_weight_kg | Decimal(5,2) | NOT NULL | Starting weight |
| target_calories | Integer | NOT NULL, CHECK > 0 | Daily calorie target |
| estimated_weeks_to_goal | Integer | NULL | Projected duration |
| started_at | Timestamp | NOT NULL, DEFAULT NOW() | Goal start date |
| completed_at | Timestamp | NULL | Goal completion date |
| created_at | Timestamp | NOT NULL, DEFAULT NOW() | Record creation |
| updated_at | Timestamp | NOT NULL, DEFAULT NOW() | Last update |

**Enums**:
- **GoalType**: `cutting`, `bulking`
- **GoalStatus**: `active`, `completed`, `abandoned`

**Validation Rules**:
- Cutting goals: target_body_fat_percentage < initial_body_fat_percentage
- Cutting goals: target_body_fat_percentage ≥ 8% (men) or ≥ 15% (women)
- Bulking goals: ceiling_body_fat_percentage > initial_body_fat_percentage
- Bulking goals: ceiling_body_fat_percentage ≤ 30%
- Only one active goal per user_id at a time (enforced at application layer)
- Either target_body_fat_percentage OR ceiling_body_fat_percentage must be set (not both)
- target_calories: 1200-5000 (reasonable calorie range)

**Calculated Fields** (not stored, computed at query time):
- current_body_fat_percentage: From latest ProgressEntry or initial_measurement
- progress_percentage: ((initial_bf - current_bf) / (initial_bf - target_bf)) × 100 (cutting)
- weeks_elapsed: (NOW() - started_at) / 7 days
- is_on_track: Compare actual progress to estimated_weeks_to_goal

**Relationships**:
- Many Goals → One User
- One Goal → One BodyMeasurement (initial)
- One Goal → Many ProgressEntries
- One Goal → Zero or One TrainingPlan
- One Goal → Zero or One DietPlan

**Indexes**:
- PRIMARY KEY on id
- INDEX on user_id, status (to find active goals)
- INDEX on user_id, started_at

**Business Rules**:
- Only one goal can have status='active' per user
- When completed_at is set, status must be 'completed'
- initial_measurement_id must belong to same user_id

---

### 4. ProgressEntry

Weekly measurement log tracking progress toward a goal.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| goal_id | UUID | FOREIGN KEY → Goal.id, NOT NULL, INDEX | Associated goal |
| measurement_id | UUID | FOREIGN KEY → BodyMeasurement.id, NOT NULL, UNIQUE | Weekly measurement |
| week_number | Integer | NOT NULL, CHECK > 0 | Week # since goal start |
| body_fat_percentage | Decimal(4,2) | NOT NULL | BF% at this checkpoint |
| weight_kg | Decimal(5,2) | NOT NULL | Weight at this checkpoint |
| body_fat_change | Decimal(4,2) | NOT NULL | Change from previous week |
| weight_change_kg | Decimal(4,2) | NOT NULL | Weight change from previous |
| is_on_track | Boolean | NOT NULL | Meeting expected progress? |
| notes | Text | NULL | System or user notes |
| logged_at | Timestamp | NOT NULL, INDEX | When logged |
| created_at | Timestamp | NOT NULL, DEFAULT NOW() | Record creation |

**Validation Rules**:
- week_number must be sequential for a given goal_id
- body_fat_percentage: 3% ≤ value ≤ 50%
- weight_kg: 30 kg ≤ weight ≤ 300 kg
- body_fat_change: -5% ≤ change ≤ 5% (prevent outliers)
- weight_change_kg: -10 kg ≤ change ≤ 10 kg (prevent outliers)

**Calculated Fields**:
- body_fat_change: Computed from previous ProgressEntry.body_fat_percentage
- weight_change_kg: Computed from previous ProgressEntry.weight_kg
- is_on_track: Based on goal type and expected rate of change
  - Cutting: Expected -0.125% to -0.25% BF per week
  - Bulking: Expected +0.025% to +0.075% BF per week

**Relationships**:
- Many ProgressEntries → One Goal
- One ProgressEntry → One BodyMeasurement

**Indexes**:
- PRIMARY KEY on id
- INDEX on goal_id, week_number (for time-series queries)
- UNIQUE on measurement_id (each measurement used once)

**Business Rules**:
- measurement_id must belong to same user as goal_id
- logged_at should be ~7 days after previous entry (enforced as warning, not hard constraint)
- Cannot create ProgressEntry for completed goal

---

### 5. TrainingPlan

Exercise recommendations for a specific goal.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| goal_id | UUID | FOREIGN KEY → Goal.id, NOT NULL, UNIQUE | Associated goal |
| plan_details | JSONB | NOT NULL | Structured training recommendations |
| workout_frequency | Integer | NOT NULL, CHECK > 0 | Sessions per week |
| primary_focus | String(100) | NOT NULL | e.g., "Strength training + cardio" |
| notes | Text | NULL | Additional guidance |
| created_at | Timestamp | NOT NULL, DEFAULT NOW() | Plan generation date |
| updated_at | Timestamp | NOT NULL, DEFAULT NOW() | Last modification |

**JSONB Structure for plan_details**:
```json
{
  "strength_training": {
    "frequency": 3,
    "exercises": [
      {
        "name": "Compound lifts (squat, deadlift, bench)",
        "sets": "3-4",
        "reps": "6-12",
        "rest": "2-3 minutes"
      }
    ],
    "progression": "Increase weight when hitting top of rep range"
  },
  "cardio": {
    "frequency": 2,
    "type": "LISS or HIIT",
    "duration": "20-30 minutes",
    "intensity": "Zone 2 for fat burning"
  },
  "rest_days": 2,
  "deload_week": "Every 4-6 weeks reduce volume by 40%"
}
```

**Validation Rules**:
- workout_frequency: 2-7 sessions per week
- plan_details must be valid JSON
- goal_id must be unique (one plan per goal)

**Templates by Goal Type**:

**Cutting**:
- Strength: 3-4x/week (preserve muscle)
- Cardio: 2-3x/week (increase deficit)
- Emphasis: Maintain strength, moderate volume

**Bulking**:
- Strength: 4-6x/week (progressive overload)
- Cardio: 1-2x/week (cardiovascular health)
- Emphasis: Increase volume and intensity

**Relationships**:
- One TrainingPlan → One Goal
- One Goal → Zero or One TrainingPlan

**Indexes**:
- PRIMARY KEY on id
- UNIQUE INDEX on goal_id

**Business Rules**:
- Automatically generated when goal is created (P5 feature)
- Can be updated based on progress adjustments
- plan_details validated against JSON schema at application layer

---

### 6. DietPlan

Nutritional guidelines for a specific goal.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| goal_id | UUID | FOREIGN KEY → Goal.id, NOT NULL, UNIQUE | Associated goal |
| daily_calorie_target | Integer | NOT NULL, CHECK > 0 | Total daily calories |
| protein_grams | Integer | NOT NULL, CHECK > 0 | Daily protein target |
| carbs_grams | Integer | NOT NULL, CHECK > 0 | Daily carbs target |
| fat_grams | Integer | NOT NULL, CHECK > 0 | Daily fat target |
| meal_timing | JSONB | NULL | Optional meal schedule |
| guidelines | Text | NOT NULL | Nutritional advice |
| created_at | Timestamp | NOT NULL, DEFAULT NOW() | Plan generation date |
| updated_at | Timestamp | NOT NULL, DEFAULT NOW() | Last modification |

**Validation Rules**:
- daily_calorie_target: 1200-5000 calories
- protein_grams: 50-400g
- carbs_grams: 50-800g
- fat_grams: 20-200g
- Macro calories should approximately match total: (protein × 4) + (carbs × 4) + (fat × 9) ≈ daily_calorie_target ± 50

**Calculation Logic** (from research.md):

**Cutting**:
- Protein: 2.2-2.6g per kg bodyweight
- Fat: 20-25% of calories
- Carbs: Remaining calories

**Bulking**:
- Protein: 1.8-2.2g per kg bodyweight
- Fat: 25-30% of calories
- Carbs: Remaining calories

**JSONB Structure for meal_timing** (optional):
```json
{
  "meals_per_day": 3,
  "pre_workout": "30-60 minutes before: 20-40g carbs",
  "post_workout": "Within 2 hours: 20-40g protein, 40-80g carbs",
  "meal_distribution": {
    "breakfast": 30,
    "lunch": 35,
    "dinner": 35
  }
}
```

**Relationships**:
- One DietPlan → One Goal
- One Goal → Zero or One DietPlan

**Indexes**:
- PRIMARY KEY on id
- UNIQUE INDEX on goal_id

**Business Rules**:
- Automatically generated when goal is created (P5 feature)
- Recalculated when goal.target_calories changes
- Updated as user's weight changes (TDEE adjustment)

---

## Database Schema SQL

### Create Enums

```sql
CREATE TYPE gender AS ENUM ('male', 'female');
CREATE TYPE calculation_method AS ENUM ('navy', '3_site', '7_site');
CREATE TYPE activity_level AS ENUM ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active');
CREATE TYPE goal_type AS ENUM ('cutting', 'bulking');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'abandoned');
```

### Create Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender NOT NULL,
    height_cm DECIMAL(5,2) NOT NULL CHECK (height_cm >= 120 AND height_cm <= 250),
    preferred_calculation_method calculation_method NOT NULL,
    activity_level activity_level NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Body measurements table
CREATE TABLE body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg >= 30 AND weight_kg <= 300),
    calculation_method calculation_method NOT NULL,
    waist_cm DECIMAL(5,2) CHECK (waist_cm IS NULL OR (waist_cm >= 10 AND waist_cm <= 200)),
    neck_cm DECIMAL(5,2) CHECK (neck_cm IS NULL OR (neck_cm >= 10 AND neck_cm <= 200)),
    hip_cm DECIMAL(5,2) CHECK (hip_cm IS NULL OR (hip_cm >= 10 AND hip_cm <= 200)),
    chest_mm DECIMAL(5,2) CHECK (chest_mm IS NULL OR (chest_mm >= 1 AND chest_mm <= 70)),
    abdomen_mm DECIMAL(5,2) CHECK (abdomen_mm IS NULL OR (abdomen_mm >= 1 AND abdomen_mm <= 70)),
    thigh_mm DECIMAL(5,2) CHECK (thigh_mm IS NULL OR (thigh_mm >= 1 AND thigh_mm <= 70)),
    tricep_mm DECIMAL(5,2) CHECK (tricep_mm IS NULL OR (tricep_mm >= 1 AND tricep_mm <= 70)),
    suprailiac_mm DECIMAL(5,2) CHECK (suprailiac_mm IS NULL OR (suprailiac_mm >= 1 AND suprailiac_mm <= 70)),
    midaxillary_mm DECIMAL(5,2) CHECK (midaxillary_mm IS NULL OR (midaxillary_mm >= 1 AND midaxillary_mm <= 70)),
    subscapular_mm DECIMAL(5,2) CHECK (subscapular_mm IS NULL OR (subscapular_mm >= 1 AND subscapular_mm <= 70)),
    calculated_body_fat_percentage DECIMAL(4,2) NOT NULL CHECK (calculated_body_fat_percentage >= 3 AND calculated_body_fat_percentage <= 50),
    notes TEXT,
    measured_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_body_measurements_user_measured ON body_measurements(user_id, measured_at DESC);
CREATE INDEX idx_body_measurements_user_created ON body_measurements(user_id, created_at DESC);

-- Goals table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type goal_type NOT NULL,
    status goal_status NOT NULL DEFAULT 'active',
    initial_measurement_id UUID NOT NULL REFERENCES body_measurements(id),
    initial_body_fat_percentage DECIMAL(4,2) NOT NULL,
    target_body_fat_percentage DECIMAL(4,2) CHECK (target_body_fat_percentage IS NULL OR (target_body_fat_percentage >= 3 AND target_body_fat_percentage <= 50)),
    ceiling_body_fat_percentage DECIMAL(4,2) CHECK (ceiling_body_fat_percentage IS NULL OR (ceiling_body_fat_percentage >= 3 AND ceiling_body_fat_percentage <= 50)),
    initial_weight_kg DECIMAL(5,2) NOT NULL,
    target_calories INTEGER NOT NULL CHECK (target_calories >= 1200 AND target_calories <= 5000),
    estimated_weeks_to_goal INTEGER,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT goal_target_xor_ceiling CHECK (
        (goal_type = 'cutting' AND target_body_fat_percentage IS NOT NULL AND ceiling_body_fat_percentage IS NULL) OR
        (goal_type = 'bulking' AND target_body_fat_percentage IS NULL AND ceiling_body_fat_percentage IS NOT NULL)
    )
);

CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_goals_user_started ON goals(user_id, started_at DESC);

-- Progress entries table
CREATE TABLE progress_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    measurement_id UUID NOT NULL UNIQUE REFERENCES body_measurements(id),
    week_number INTEGER NOT NULL CHECK (week_number > 0),
    body_fat_percentage DECIMAL(4,2) NOT NULL CHECK (body_fat_percentage >= 3 AND body_fat_percentage <= 50),
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg >= 30 AND weight_kg <= 300),
    body_fat_change DECIMAL(4,2) NOT NULL CHECK (body_fat_change >= -5 AND body_fat_change <= 5),
    weight_change_kg DECIMAL(4,2) NOT NULL CHECK (weight_change_kg >= -10 AND weight_change_kg <= 10),
    is_on_track BOOLEAN NOT NULL,
    notes TEXT,
    logged_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_progress_entries_goal_week ON progress_entries(goal_id, week_number);
CREATE UNIQUE INDEX idx_progress_entries_measurement ON progress_entries(measurement_id);

-- Training plans table
CREATE TABLE training_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL UNIQUE REFERENCES goals(id) ON DELETE CASCADE,
    plan_details JSONB NOT NULL,
    workout_frequency INTEGER NOT NULL CHECK (workout_frequency >= 2 AND workout_frequency <= 7),
    primary_focus VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_training_plans_goal ON training_plans(goal_id);

-- Diet plans table
CREATE TABLE diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL UNIQUE REFERENCES goals(id) ON DELETE CASCADE,
    daily_calorie_target INTEGER NOT NULL CHECK (daily_calorie_target >= 1200 AND daily_calorie_target <= 5000),
    protein_grams INTEGER NOT NULL CHECK (protein_grams >= 50 AND protein_grams <= 400),
    carbs_grams INTEGER NOT NULL CHECK (carbs_grams >= 50 AND carbs_grams <= 800),
    fat_grams INTEGER NOT NULL CHECK (fat_grams >= 20 AND fat_grams <= 200),
    meal_timing JSONB,
    guidelines TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_diet_plans_goal ON diet_plans(goal_id);
```

---

## State Transitions

### Goal Status Transitions

```
┌─────────┐
│ active  │ ──────────────┐
└────┬────┘               │
     │                    │
     │ (target reached)   │ (user cancels)
     │                    │
     ▼                    ▼
┌───────────┐      ┌─────────────┐
│ completed │      │  abandoned  │
└───────────┘      └─────────────┘
```

**Transitions**:
- `active` → `completed`: When body_fat_percentage reaches target/ceiling
- `active` → `abandoned`: User manually ends goal without reaching target
- No transitions out of `completed` or `abandoned` (terminal states)

---

## Data Validation Summary

| Entity | Key Validations |
|--------|----------------|
| User | Email unique, age 13-120, height 120-250cm, password 8+ chars |
| BodyMeasurement | Method-specific required fields, BF% 3-50%, weight 30-300kg |
| Goal | One active per user, target/ceiling based on type, safe BF% limits |
| ProgressEntry | Sequential weeks, reasonable change rates, BF% 3-50% |
| TrainingPlan | 2-7 sessions/week, valid JSON structure |
| DietPlan | Calories 1200-5000, macros match calorie total ± 50 |

---

## Performance Considerations

1. **Indexes**: All foreign keys indexed for join performance
2. **Time-series queries**: Composite indexes on (user_id, measured_at/created_at)
3. **Active goal lookup**: Index on (user_id, status) for fast active goal retrieval
4. **Partitioning**: Consider partitioning by created_at if table exceeds 10M rows (future optimization)
5. **JSONB**: GIN indexes on JSONB columns if querying plan_details becomes common

---

## Security & Privacy

1. **Row-Level Security (RLS)**: Enable PostgreSQL RLS policies
   - Users can only see/modify their own data
   - Policies enforce user_id = current_user_id
2. **Encryption at Rest**: Enable PostgreSQL transparent data encryption
3. **Audit Logging**: Log all INSERT/UPDATE/DELETE operations to audit table
4. **Data Export**: Support GDPR export of all user data
5. **Data Deletion**: CASCADE delete ensures clean removal of all related data

---

**Data Model Status**: ✅ Complete - Ready for contract generation and implementation.
