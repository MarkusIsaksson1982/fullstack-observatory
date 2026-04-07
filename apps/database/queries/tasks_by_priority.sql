-- Query Preset 3: Tasks by priority (high to low)
-- Layer 3: Database - The Full Stack Observatory

SELECT
    t.id,
    t.title,
    t.priority,
    t.status,
    p.name AS project_name,
    u.name AS assignee_name
FROM tasks t
INNER JOIN projects p ON t.project_id = p.id
LEFT JOIN users u ON t.assignee_id = u.id
ORDER BY t.priority DESC, t.created_at ASC;
