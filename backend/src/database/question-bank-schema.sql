-- Question Bank table schema
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    level VARCHAR(10) NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('behavior', 'technical', 'product', 'system design')),
    industry VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_industry ON questions(industry);

-- Insert sample questions
INSERT INTO questions (question, level, type, industry) VALUES 
    ('Tell me about a time when you had to deal with a difficult team member. How did you handle it?', 'medium', 'behavior', 'Software'),
    ('Explain the difference between a stack and a queue data structure.', 'easy', 'technical', 'Software'),
    ('How would you design a scalable notification system for a social media platform?', 'hard', 'system design', 'Software'),
    ('What metrics would you track to measure the success of a new feature launch?', 'medium', 'product', 'Product'),
    ('Describe a situation where you had to learn a new technology quickly to complete a project.', 'medium', 'behavior', 'Technology'),
    ('How would you implement a rate limiting algorithm for an API?', 'hard', 'technical', 'Software'),
    ('Design a URL shortening service like bit.ly.', 'medium', 'system design', 'Software'),
    ('What would you do if your product usage suddenly dropped by 50%?', 'hard', 'product', 'Product'),
    ('Tell me about a time you failed at something. What did you learn?', 'easy', 'behavior', 'General'),
    ('Explain how garbage collection works in your preferred programming language.', 'medium', 'technical', 'Software'),
    ('How would you design a chat application that supports millions of users?', 'hard', 'system design', 'Software'),
    ('Describe your approach to prioritizing features in a product roadmap.', 'medium', 'product', 'Product'),
    ('Give an example of when you had to work with a difficult stakeholder. How did you manage the relationship?', 'medium', 'behavior', 'General'),
    ('What is the difference between SQL and NoSQL databases? When would you use each?', 'easy', 'technical', 'Software'),
    ('Design a recommendation system for an e-commerce platform.', 'hard', 'system design', 'Software');