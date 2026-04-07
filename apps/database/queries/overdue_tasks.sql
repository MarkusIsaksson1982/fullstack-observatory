-- Query Preset 4: Overdue tasks (todo/in_progress on active projects, older than 7 days)
-- Layer 3: Database - The Full Stack Observatory
-- Note: Uses interval arithmetic for "overdue" detection

SELECT
    t.id,
    t.title,
    t.priority,
    t.status,
    t.created_at AS task_created,
    p.name AS project_name,
    u.name AS assignee_name,
    CURRENT_TIMESTAMP - t.created_at AS age
FROM tasks t
INNER JOIN projects p ON t.project_id = p.id
LEFT JOIN users u ON t.assignee_id = u.id
WHERE t.status IN ('todo', 'in_progress')
    AND p.status = 'active'
    AND t.created_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY t.created_at ASC;
