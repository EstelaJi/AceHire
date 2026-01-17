-- Create interview_questions table
CREATE TABLE IF NOT EXISTS interview_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('behavior', 'technical', 'product', 'system design')),
    industry VARCHAR(100),
    explanation TEXT NOT NULL,
    examples JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_level ON interview_questions(level);
CREATE INDEX IF NOT EXISTS idx_questions_type ON interview_questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_industry ON interview_questions(industry);
