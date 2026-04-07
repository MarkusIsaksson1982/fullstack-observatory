-- Migration: 003_create_tasks
-- Layer 3: Database - The Full Stack Observatory
-- Creates the tasks table with FKs to projects/users and CHECK constraints

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add comments
COMMENT ON TABLE tasks IS 'Project tasks with assignment and priority tracking';
COMMENT ON COLUMN tasks.priority IS 'Task priority: 1=lowest, 5=highest';
COMMENT ON COLUMN tasks.status IS 'Task progress state: todo, in_progress, or done';

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
