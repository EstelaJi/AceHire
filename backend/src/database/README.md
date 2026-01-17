# Database Setup Guide

This guide will help you set up the database and migrate interview questions from the hardcoded file to PostgreSQL.

## Prerequisites

1. PostgreSQL 12+ installed and running
2. Database `interview_app` created (or update `POSTGRES_URL` in `.env`)

## Setup Steps

### 1. Create Database Table

Run the following command to create the `interview_questions` table:

```bash
# Using default configuration
npm run db:create-table

# Or with custom database URL
POSTGRES_URL="postgres://user:password@host:5432/dbname" npm run db:create-table
```

### 2. Seed Data from Frontend File

Import questions from `frontend/src/home/questionsData.ts` into the database:

```bash
npm run db:seed
```

This script will:
- Parse the TypeScript file containing hardcoded questions
- Clear any existing data in the table
- Insert all questions into the database
- Show a summary of the import

## API Endpoints

After setup, you can access the questions through these API endpoints:

### Get All Questions

```http
GET /api/questions
```

**Query Parameters:**
- `level` (optional): Filter by difficulty level (`easy`, `medium`, `hard`)
- `type` (optional): Filter by question type (`behavior`, `technical`, `product`, `system design`)
- `industry` (optional): Filter by industry
- `search` (optional): Search in question text or explanation

**Example:**
```http
GET /api/questions?level=easy&type=technical
```

### Get Single Question

```http
GET /api/questions/:id
```

## Database Schema

The `interview_questions` table has the following structure:

| Column | Type | Description |
|--------|------|------------|
| id | SERIAL PRIMARY KEY | Auto-incrementing ID |
| question_text | TEXT | The interview question |
| level | VARCHAR(20) | Difficulty level (easy/medium/hard) |
| type | VARCHAR(50) | Question type |
| industry | VARCHAR(100) | Industry category (optional) |
| explanation | TEXT | Explanation of the question |
| examples | JSONB | Array of example answers |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Indexes

The following indexes are created for better query performance:
- `idx_questions_level` on `level`
- `idx_questions_type` on `type`
- `idx_questions_industry` on `industry`

## Troubleshooting

### Table Already Exists
If you get an error about the table already existing, it's safe - the script uses `CREATE TABLE IF NOT EXISTS`.

### Connection Issues
Ensure PostgreSQL is running and the connection URL in `.env` is correct:
```env
POSTGRES_URL=postgres://postgres:postgres@localhost:5432/interview_app
```

### Import Failed
Check that the frontend file exists at:
`../../frontend/src/home/questionsData.ts`
