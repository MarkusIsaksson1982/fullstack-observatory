-- Query Preset 6: Create strategic indexes (idempotent)
-- Layer 3: Database - The Full Stack Observatory
-- Safe to run multiple times; uses IF NOT EXISTS

-- Index for priority-based task filtering
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority DESC);

-- Index for status-based filtering across tables
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Composite index for common dashboard query pattern
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status)
    WHERE status IN ('todo', 'in_progress');

-- Update query planner statistics
ANALYZE tasks;
ANALYZE projects;
