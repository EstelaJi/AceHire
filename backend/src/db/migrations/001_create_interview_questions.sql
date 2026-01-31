-- 创建面试问题表
CREATE TABLE IF NOT EXISTS interview_questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    level VARCHAR(10) NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('behavior', 'technical', 'product', 'system design')),
    industry VARCHAR(50),
    explanation TEXT NOT NULL,
    examples TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_interview_questions_updated_at 
    BEFORE UPDATE ON interview_questions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();