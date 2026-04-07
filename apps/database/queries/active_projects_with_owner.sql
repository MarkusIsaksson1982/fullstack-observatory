-- Query Preset 2: Active projects with owner details
-- Layer 3: Database - The Full Stack Observatory

SELECT
    p.id AS project_id,
    p.name AS project_name,
    p.status,
    p.created_at AS project_started,
    u.id AS owner_id,
    u.name AS owner_name,
    u.email AS owner_email
FROM projects p
INNER JOIN users u ON p.owner_id = u.id
WHERE p.status = 'active'
ORDER BY p.created_at DESC;
