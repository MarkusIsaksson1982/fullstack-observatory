-- Seed Data: Layer 3 Database - The Full Stack Observatory
-- Matches EXACT data shown in sql.js browser console demo
-- 5 users, 4 projects, 12 tasks

-- Clear existing data (safe for reset operations)
DELETE FROM tasks;
DELETE FROM projects;
DELETE FROM users;

-- Reset sequences to avoid conflicts
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;

-- USERS (5 records)
INSERT INTO users (name, email, role, created_at) VALUES
    ('Alex Rivera', 'alex@observatory.dev', 'admin', '2024-01-15 09:00:00+00'),
    ('Sam Chen', 'sam@observatory.dev', 'maintainer', '2024-02-03 14:30:00+00'),
    ('Jordan Lee', 'jordan@observatory.dev', 'member', '2024-02-20 11:15:00+00'),
    ('Taylor Kim', 'taylor@observatory.dev', 'contributor', '2024-03-01 08:45:00+00'),
    ('Morgan Blake', 'morgan@observatory.dev', 'member', '2024-03-10 16:20:00+00');

-- PROJECTS (4 records)
INSERT INTO projects (name, owner_id, status, created_at) VALUES
    ('Observatory Dashboard', 1, 'active', '2024-02-01 09:00:00+00'),
    ('API Gateway Refactor', 2, 'active', '2024-02-03 10:00:00+00'),
    ('Mobile App Prototype', 3, 'draft', '2024-02-05 14:00:00+00'),
    ('Legacy System Archive', 5, 'archived', '2024-01-20 08:00:00+00');

-- TASKS (12 records)
INSERT INTO tasks (title, project_id, assignee_id, priority, status, created_at) VALUES
    -- Observatory Dashboard tasks (project_id=1)
    ('Design dashboard wireframes', 1, 1, 5, 'done', '2024-02-01 10:00:00+00'),
    ('Implement auth middleware', 1, 2, 4, 'done', '2024-02-02 09:30:00+00'),
    ('Add real-time metrics panel', 1, 3, 3, 'in_progress', '2024-02-04 11:00:00+00'),

    -- API Gateway Refactor tasks (project_id=2)
    ('Audit existing endpoints', 2, 2, 4, 'done', '2024-02-03 11:00:00+00'),
    ('Implement rate limiting', 2, 1, 5, 'in_progress', '2024-02-05 09:00:00+00'),
    ('Add request logging', 2, 4, 2, 'todo', '2024-02-06 14:00:00+00'),
    ('Write integration tests', 2, 3, 3, 'todo', '2024-02-07 10:00:00+00'),

    -- Mobile App Prototype tasks (project_id=3)
    ('Research React Native options', 3, 3, 3, 'in_progress', '2024-02-05 15:00:00+00'),
    ('Create user flow diagrams', 3, 1, 4, 'todo', '2024-02-06 09:00:00+00'),
    ('Setup CI/CD pipeline', 3, 2, 2, 'todo', '2024-02-07 11:00:00+00'),

    -- Legacy System Archive tasks (project_id=4)
    ('Export user data to cold storage', 4, 5, 5, 'done', '2024-01-21 09:00:00+00'),
    ('Decommission old servers', 4, NULL, 1, 'done', '2024-01-25 16:00:00+00');
