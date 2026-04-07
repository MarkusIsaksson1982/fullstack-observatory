-- Query Preset 7: INSERT new user (parameterized template)
-- Layer 3: Database - The Full Stack Observatory
-- Replace $1, $2, $3 with actual values or use prepared statements

INSERT INTO users (name, email, role, created_at)
VALUES (
    $1,  -- name: TEXT NOT NULL
    $2,  -- email: TEXT UNIQUE
    $3,  -- role: TEXT (optional)
    COALESCE($4, CURRENT_TIMESTAMP)  -- created_at: defaults to now
)
RETURNING id, name, email, role, created_at;

-- Example usage with literal values (uncomment to test):
-- INSERT INTO users (name, email, role)
-- VALUES ('Test User', 'test@observatory.dev', 'member')
-- RETURNING *;
