-- Database Schema for Resume Analyzer (Supabase SQL)

-- 1. Users Table
-- Stores login information and user details
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- In a real app, store hashed passwords, not plain text
    role VARCHAR(50) DEFAULT 'recruiter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Analysis History Table
-- Stores the analysis results linked to a user
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resume_text TEXT, -- The original text content of the resume
    candidate_name VARCHAR(100),
    role_detected VARCHAR(100),
    overall_score INTEGER,
    
    -- Storing the complex nested result objects as JSON
    -- This allows flexibility for the various arrays/objects (strengths, skills, etc.)
    analysis_json JSONB, 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SAMPLE QUERIES --

-- A. Register a new User
-- (To test inserts, let's create a known UUID so we can reference it below)
INSERT INTO users (id, name, email, password_hash, role)
VALUES ('11111111-1111-1111-1111-111111111111', 'HR Manager', 'admin@stark.com', 'hashed_password_123', 'admin');

-- B. Login Query (Find user by email)
SELECT id, name, email, role, password_hash 
FROM users 
WHERE email = 'admin@stark.com';

-- C. Save an Analysis Result
INSERT INTO analyses (user_id, resume_text, candidate_name, role_detected, overall_score, analysis_json)
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    'Resume text content here...', 
    'Alex Morgan', 
    'Senior Software Engineer', 
    88, 
    '{
        "overview": "Sample overview text", 
        "keyStrengths": ["React", "Leadership"], 
        "skillsMatch": {},
        "recommendation": {}
    }'
);

-- D. Fetch History for a User
SELECT id, candidate_name, role_detected, overall_score, created_at 
FROM analyses 
WHERE user_id = '11111111-1111-1111-1111-111111111111' 
ORDER BY created_at DESC;
