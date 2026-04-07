-- Query Preset 5: User task counts (aggregation)
-- Layer 3: Database - The Full Stack Observatory

SELECT
    u.id AS user_id,
    u.name,
    u.role,
    COUNT(t.id) AS total_tasks,
    COUNT(CASE WHEN t.status = 'done' THEN 1 END) AS completed,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) AS in_progress,
    COUNT(CASE WHEN t.status = 'todo' THEN 1 END) AS todo,
    ROUND(AVG(t.priority), 2) AS avg_priority
FROM users u
LEFT JOIN tasks t ON u.id = t.assignee_id
GROUP BY u.id, u.name, u.role
ORDER BY total_tasks DESC, u.name ASC;
