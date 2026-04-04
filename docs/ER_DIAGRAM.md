# CyberSimulator Database Schema

## ER Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                     DB                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     USERS        │       │    SCENARIOS     │       │   USER_PROGRESS  │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ username         │       │ title            │       │ user_id (FK)     │─────┐
│ email            │       │ description      │       │ scenario_id (FK) │─────┼────┐
│ password_hash    │       │ environment      │       │ level_id         │     │    │
│ created_at       │       │ threat_type      │       │ completed        │     │    │
│ updated_at       │       │ threat_level     │       │ score            │     │    │
└────────┬─────────┘       │ difficulty       │       │ attempts         │     │    │
         │                 │ created_at       │       │ completed_at     │     │    │
         │                 └────────┬─────────┘       └──────────────────┘     │    │
         │                          │                                          │    │
         │                 ┌────────┴─────────┐                                │    │
         │                 │     LEVELS       │                                │    │
         │                 ├──────────────────┤                                │    │
         │                 │ id (PK)          │                                │    │
         │                 │ scenario_id (FK) │────────────────────────────────┘    │
         │                 │ level_number     │                                     │
         │                 │ title            │                                     │
         │                 │ description      │                                     │
         │                 │ attack_type      │                                     │
         │                 │ sandbox_type     │                                     │
         │                 │ theory_content   │                                     │
         │                 │ correct_action   │                                     │
         │                 └──────────────────┘                                     │
         │                                                                          │
         │                 ┌──────────────────┐       ┌──────────────────┐          │
         │                 │   ATTACK_TYPES   │       │ USER_ACHIEVEMENTS│          │
         │                 ├──────────────────┤       ├──────────────────┤          │
         │                 │ id (PK)          │       │ id (PK)          │          │
         └────────────────►│ name             │       │ user_id (FK)     │──────────┘
                           │ cwe_code         │       │ achievement_id   │
                           │ description      │       │ earned_at        │
                           │ icon             │       └──────────────────┘
                           └──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│   ACHIEVEMENTS   │       │   LEAGUES        │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ name             │       │ name             │
│ description      │       │ min_score        │
│ icon             │       │ max_score        │
│ badge_color      │       │ description      │
└──────────────────┘       └──────────────────┘
```

## Tables

### USERS
|  Column  | Type | Constraints |    Description    |
|----------|------|-------------|-------------------|
| id       | UUID | PK          | Unique identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL | User login |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| current_league_id | UUID | FK | Current user league |
| total_score | INTEGER | DEFAULT 0 | Total earned score |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration date |
| updated_at | TIMESTAMP | | Last update |

### SCENARIOS
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PK | Scenario identifier |
| title | VARCHAR(100) | NOT NULL | Display title |
| description | TEXT | | Full description |
| environment | VARCHAR(50) | NOT NULL | Environment type |
| threat_type | VARCHAR(50) | | Main threat type |
| threat_level | VARCHAR(20) | | LOW/MEDIUM/HIGH/CRITICAL |
| difficulty | VARCHAR(20) | | Easy/Medium/Hard |
| icon | VARCHAR(10) | | Emoji icon |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation date |

### LEVELS
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| scenario_id | VARCHAR(50) | FK | Parent scenario |
| level_number | INTEGER | NOT NULL | Order number |
| title | VARCHAR(100) | NOT NULL | Level title |
| description | TEXT | | Level description |
| attack_type | VARCHAR(50) | | Attack category |
| sandbox_type | VARCHAR(50) | | Sandbox container |
| theory_content | TEXT | | Educational content |
| correct_action | TEXT | | Correct solution |
| points | INTEGER | DEFAULT 10 | Points for completion |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation date |

### USER_PROGRESS
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK | User reference |
| scenario_id | VARCHAR(50) | FK | Scenario reference |
| level_id | UUID | FK | Level reference |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| score | INTEGER | DEFAULT 0 | Earned score |
| attempts | INTEGER | DEFAULT 0 | Attempt count |
| completed_at | TIMESTAMP | | Completion time |

### ATTACK_TYPES
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PK | Attack identifier |
| name | VARCHAR(100) | NOT NULL | Display name |
| cwe_code | VARCHAR(20) | | CWE reference |
| description | TEXT | | Full description |
| icon | VARCHAR(10) | | Emoji icon |
| risk_level | VARCHAR(20) | | Risk assessment |

### ACHIEVEMENTS
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Achievement name |
| description | TEXT | | How to earn |
| icon | VARCHAR(10) | | Badge icon |
| badge_color | VARCHAR(20) | | Badge color |
| criteria | JSONB | | Earn criteria |
| points_reward | INTEGER | DEFAULT 0 | Bonus points |

### LEAGUES
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(50) | NOT NULL | League name |
| min_score | INTEGER | NOT NULL | Min score to enter |
| max_score | INTEGER | | Max score for league |
| description | TEXT | | League description |
| icon | VARCHAR(10) | | League icon |

### USER_ACHIEVEMENTS
|     Column     |    Type   |  Constraints  |      Description      |
|----------------|-----------|---------------|-----------------------|
|       id       |    UUID   |       PK      |    Unique identifier  |
|    user_id     |    UUID   |       FK      |     User reference    |
| achievement_id |    UUID   |       FK      | Achievement reference |
|   earned_at    | TIMESTAMP | DEFAULT NOW() |       Earn date        

## Indexes

```sql
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_scenario ON user_progress(scenario_id);
CREATE INDEX idx_levels_scenario ON levels(scenario_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
```

## Relationships

- USERS 1:N USER_PROGRESS
- SCENARIOS 1:N LEVELS
- LEVELS 1:N USER_PROGRESS
- USERS 1:N USER_ACHIEVEMENTS
- ACHIEVEMENTS 1:N USER_ACHIEVEMENTS
- USERS N:1 LEAGUES
