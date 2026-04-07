-- Migration: 004_create_indexes
-- Layer 3: Database - The Full Stack Observatory
-- Strategic indexes for query performance (matching layer page demo)

-- Composite index for priority + status filtering (common in task queries)
CREATE INDEX IF NOT EXISTS idx_tasks_priority_status ON tasks(priority DESC, status);

-- Index for created_at sorting (analytics, recent items)
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Partial index for active projects only (optimizes active project queries)
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(id, name) WHERE status = 'active';

-- Index for overdue task detection (open tasks on older projects)
CREATE INDEX IF NOT EXISTS idx_tasks_todo_project ON tasks(project_id, status)
    WHERE status IN ('todo', 'in_progress');

-- Update statistics after index creation
ANALYZE users;
ANALYZE projects;
ANALYZE tasks;
