-- Query Preset 8: Complex join with aggregation (analytics query)
-- Layer 3: Database - The Full Stack Observatory
-- Combines all 3 tables with filtering, grouping, and computed fields

WITH project_stats AS (
    SELECT
        project_id,
        COUNT(*) AS task_count,
        COUNT(CASE WHEN status = 'done' THEN 1 END) AS done_count,
        ROUND(100.0 * COUNT(CASE WHEN status = 'done' THEN 1 END) / COUNT(*), 1) AS completion_pct
    FROM tasks
    GROUP BY project_id
),
owner_summary AS (
    SELECT
        u.id AS owner_id,
        u.name AS owner_name,
        COUNT(p.id) AS projects_owned,
        COUNT(t.id) AS tasks_assigned
    FROM users u
    LEFT JOIN projects p ON u.id = p.owner_id
    LEFT JOIN tasks t ON p.id = t.project_id AND t.assignee_id = u.id
    GROUP BY u.id, u.name
)
SELECT
    p.id AS project_id,
    p.name AS project_name,
    p.status AS project_status,
    ps.task_count,
    ps.done_count,
    ps.completion_pct,
    o.name AS owner_name,
    os.tasks_assigned AS owner_direct_tasks,
    ARRAY_AGG(DISTINCT t.status) FILTER (WHERE t.id IS NOT NULL) AS task_statuses
FROM projects p
INNER JOIN users o ON p.owner_id = o.id
LEFT JOIN project_stats ps ON p.id = ps.project_id
LEFT JOIN owner_summary os ON o.id = os.owner_id
LEFT JOIN tasks t ON p.id = t.project_id
WHERE p.status != 'archived'
GROUP BY
    p.id,
    p.name,
    p.status,
    ps.task_count,
    ps.done_count,
    ps.completion_pct,
    o.name,
    os.tasks_assigned,
    p.created_at
ORDER BY ps.completion_pct ASC NULLS LAST, p.created_at DESC;
