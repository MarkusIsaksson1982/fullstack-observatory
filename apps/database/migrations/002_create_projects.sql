-- Migration: 002_create_projects
-- Layer 3: Database - The Full Stack Observatory
-- Creates the projects table with FK to users and CHECK constraint on status

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'archived', 'draft')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add comments
COMMENT ON TABLE projects IS 'Work projects owned by users';
COMMENT ON COLUMN projects.status IS 'Project lifecycle state: active, archived, or draft';

-- Index for owner lookups and status filtering
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
