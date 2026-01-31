CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
  type VARCHAR(50) NOT NULL CHECK (type IN ('behavior', 'technical', 'product', 'system design')),
  industry VARCHAR(100),
  explanation TEXT NOT NULL,
  examples JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_industry ON questions(industry);
