-- Migration: 001_create_users
-- Layer 3: Database - The Full Stack Observatory
-- Creates the users table with constraints matching the sql.js demo

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add comment for documentation
COMMENT ON TABLE users IS 'Application users with authentication and role data';
COMMENT ON COLUMN users.role IS 'User role: admin, member, guest, etc.';

-- Index for email lookups (already UNIQUE, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
