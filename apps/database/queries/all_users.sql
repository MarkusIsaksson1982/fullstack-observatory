-- Query Preset 1: All users
-- Layer 3: Database - The Full Stack Observatory

SELECT
    id,
    name,
    email,
    role,
    created_at
FROM users
ORDER BY created_at ASC;
