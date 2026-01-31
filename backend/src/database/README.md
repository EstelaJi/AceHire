# Interview Questions Database

This document describes the database integration for interview questions in the AceHire application.

## Overview

Previously, interview questions were hardcoded in the frontend. Now they are stored in a PostgreSQL database and accessed through REST API endpoints.

## Database Setup

1. Make sure PostgreSQL is running and accessible
2. Set up the database connection in your environment variables:
   - `POSTGRES_URL`: PostgreSQL connection string (default: `postgres://postgres:postgres@localhost:5432/interview_app`)
   - `REDIS_URL`: Redis connection string (default: `redis://localhost:6379`)

3. Initialize the database with:
   ```bash
   npm run db:init
   ```

   This will:
   - Run all pending migrations
   - Seed the database with initial interview questions

## API Endpoints

### Get Questions
- `GET /api/questions` - Get all questions with optional filtering
  - Query parameters:
    - `level`: Filter by difficulty level (easy, medium, hard)
    - `type`: Filter by question type (behavior, technical, product, system design)
    - `industry`: Filter by industry
    - `limit`: Limit number of results (default: 50)
    - `offset`: Offset for pagination

- `GET /api/questions/:id` - Get a specific question by ID

- `GET /api/questions/random` - Get random questions
  - Query parameters:
    - `count`: Number of questions to return (default: 5, max: 50)
    - `level`: Filter by difficulty level
    - `type`: Filter by question type
    - `industry`: Filter by industry

### Create Question
- `POST /api/questions` - Create a new question
  - Request body:
    ```json
    {
      "question": "Your question text",
      "level": "easy|medium|hard",
      "type": "behavior|technical|product|system design",
      "industry": "industry name (optional)",
      "explanation": "Explanation of what the question assesses",
      "examples": ["Example answer 1", "Example answer 2"]
    }
    ```

### Update Question
- `PUT /api/questions/:id` - Update an existing question
  - Request body: Same as create, but all fields are optional

### Delete Question
- `DELETE /api/questions/:id` - Delete a question

## Database Schema

The `interview_questions` table has the following structure:

- `id`: Serial primary key
- `question`: Text content of the question
- `level`: Difficulty level (easy, medium, hard)
- `type`: Question type (behavior, technical, product, system design)
- `industry`: Industry (optional)
- `explanation`: Explanation of what the question assesses
- `examples`: Array of example answers
- `created_at`: Timestamp when the question was created
- `updated_at`: Timestamp when the question was last updated

## Testing

Run the unit tests with:
```bash
npm test
```

The tests will use a separate test database (configured via `TEST_POSTGRES_URL` environment variable).

## Frontend Integration

To integrate with the frontend, update the question fetching logic to use the new API endpoints instead of reading from the hardcoded file.

Example:
```typescript
// Instead of importing from questionsData.ts
const response = await fetch('/api/questions');
const questions = await response.json();
```