# Database Setup

## Prerequisites

Make sure PostgreSQL is running and the database connection is configured in `.env`:

```env
POSTGRES_URL=postgres://postgres:postgres@localhost:5432/interview_app
```

## Initialization Commands

### Initialize Database (Create Tables and Seed Data)

This command will:
1. Create the `interview_questions` table
2. Migrate all existing hardcoded questions to the database

```bash
npm run init-db
```

### Individual Steps

If you want to run the steps separately:

#### 1. Create Tables

```bash
npm run migrate
```

This executes the SQL migration script to create the `interview_questions` table.

#### 2. Seed Data

```bash
npm run seed
```

This migrates all hardcoded questions from `frontend/src/home/questionsData.ts` to the database.

## Database Schema

The `interview_questions` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Primary key |
| question | TEXT | The interview question |
| level | VARCHAR(20) | Difficulty: easy, medium, or hard |
| type | VARCHAR(50) | Type: behavior, technical, product, or system design |
| industry | VARCHAR(100) | Industry category (optional) |
| explanation | TEXT | Explanation of what the question assesses |
| examples | JSONB | Array of example answers |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## API Endpoints

### Get All Questions

```bash
curl http://localhost:4000/api/questions
```

### Get Questions by Level

```bash
curl http://localhost:4000/api/questions?level=easy
```

### Get Questions by Type

```bash
curl http://localhost:4000/api/questions?type=technical
```

### Create New Question

```bash
curl -X POST http://localhost:4000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your greatest strength?",
    "level": "easy",
    "type": "behavior",
    "industry": "general",
    "explanation": "This question assesses self-awareness and confidence.",
    "examples": ["Example answer 1", "Example answer 2"]
  }'
```

## Troubleshooting

### Connection Refused

If you see "Connection refused" error:
1. Make sure PostgreSQL is running
2. Check the connection string in `.env`
3. Verify the database exists

### Table Already Exists

The migration script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. The seed script uses `ON CONFLICT DO UPDATE`, so it will update existing questions instead of creating duplicates.
