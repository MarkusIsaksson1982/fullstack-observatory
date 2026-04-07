# Database Schema Documentation
## Layer 3: Database - The Full Stack Observatory

> This document describes the PostgreSQL schema design, normalization rationale, and indexing strategy for the `fullstack-database` repository.

---

## Entity Relationship Diagram (Text)

```text
+-----------------------------+
|            users            |
+-----------------------------+
| id PK, SERIAL               |
| name TEXT NOT NULL          |
| email TEXT UNIQUE           |
| role TEXT                   |
| created_at TIMESTAMPTZ      |
+-----------+-----------------+
            | 1
            |
            | many
+-----------v-----------------+
|          projects           |
+-----------------------------+
| id PK, SERIAL               |
| name TEXT NOT NULL          |
| owner_id FK -> users.id     |
| status CHECK (...)          |
| created_at TIMESTAMPTZ      |
+-----------+-----------------+
            | 1
            |
            | many
+-----------v-----------------+
|            tasks            |
+-----------------------------+
| id PK, SERIAL               |
| title TEXT NOT NULL         |
| project_id FK -> projects.id|
| assignee_id FK -> users.id  |
| priority CHECK (1-5)        |
| status CHECK (...)          |
| created_at TIMESTAMPTZ      |
+-----------------------------+
```

---

## Normalization Rationale (3NF)

### First Normal Form (1NF)

- All columns contain atomic values.
- Each row is uniquely identifiable by primary key.
- No repeating groups exist within tables.

### Second Normal Form (2NF)

- All non-key attributes depend on the full primary key.
- Example: `tasks.assignee_id` depends on the task itself, not partially on `project_id`.

### Third Normal Form (3NF)

- No transitive dependencies: non-key attributes do not depend on other non-key attributes.
- Example: `projects.owner_id` references `users.id` rather than duplicating user details in projects.

### Why This Matters

1. **Data Integrity**: Prevents anomalies during INSERT/UPDATE/DELETE
2. **Storage Efficiency**: Eliminates redundant data storage
3. **Query Flexibility**: JOINs enable dynamic data composition
4. **Maintainability**: Schema changes propagate predictably

---

## Constraint Strategy

### Primary Keys

- All tables use `SERIAL` auto-incrementing integers for simplicity and performance.
- Alternative: UUIDs for distributed systems, which are not needed for this demo.

### Foreign Keys

```sql
-- projects.owner_id -> users.id
REFERENCES users(id) ON DELETE CASCADE

-- tasks.project_id -> projects.id
REFERENCES projects(id) ON DELETE CASCADE

-- tasks.assignee_id -> users.id
REFERENCES users(id) ON DELETE SET NULL
```

| FK Column | ON DELETE Behavior | Rationale |
|-----------|--------------------|-----------|
| `projects.owner_id` | CASCADE | Delete projects when owner is removed |
| `tasks.project_id` | CASCADE | Delete tasks when project is removed |
| `tasks.assignee_id` | SET NULL | Preserve tasks when assignee leaves and allow reassignment |

### CHECK Constraints

```sql
-- projects.status
CHECK (status IN ('active', 'archived', 'draft'))

-- tasks.priority
CHECK (priority BETWEEN 1 AND 5)

-- tasks.status
CHECK (status IN ('todo', 'in_progress', 'done'))
```

**Why CHECK over ENUM?**

- PostgreSQL ENUM types require schema changes to add values.
- CHECK constraints are more flexible for evolving business rules.
- Application layer can still provide type safety via TypeScript interfaces.

---

## Index Strategy

### Index Creation Philosophy

1. **Start minimal**: Only index columns used in `WHERE`, `JOIN`, or `ORDER BY`
2. **Measure first**: Use `EXPLAIN ANALYZE` before adding indexes
3. **Consider write cost**: Every index slows `INSERT`/`UPDATE`/`DELETE`

### Indexes in This Schema

| Index Name | Table | Columns | Purpose |
|------------|-------|---------|---------|
| `idx_users_email` | users | email | Fast login/lookup by email |
| `idx_projects_owner_id` | projects | owner_id | List projects by owner |
| `idx_projects_status` | projects | status | Filter active/archived projects |
| `idx_tasks_project_id` | tasks | project_id | List tasks by project |
| `idx_tasks_assignee_id` | tasks | assignee_id | List tasks by assignee |
| `idx_tasks_priority_status` | tasks | priority DESC, status | Dashboard queries for high-priority open tasks |
| `idx_tasks_created_at` | tasks | created_at DESC | Recent activity feeds |
| `idx_projects_active` | projects | id, name | Partial index for active projects |

### Partial Index Example

```sql
CREATE INDEX idx_projects_active ON projects(id, name) WHERE status = 'active';

SELECT name FROM projects WHERE status = 'active' ORDER BY name;
```

### When to Add More Indexes

- Query patterns show frequent filtering on a new column.
- `EXPLAIN ANALYZE` shows sequential scans on large tables.
- Read-heavy workloads justify the write overhead.

---

## Query Patterns and Optimization

### Pattern 1: User Dashboard

```sql
SELECT p.*, COUNT(t.id) AS task_count
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
WHERE p.owner_id = $1
GROUP BY p.id;
```

Uses `idx_projects_owner_id` and `idx_tasks_project_id`.

### Pattern 2: Priority Task Queue

```sql
SELECT t.*, p.name AS project
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.priority >= 4
  AND t.status = 'todo'
  AND p.status = 'active'
ORDER BY t.priority DESC;
```

Uses `idx_tasks_priority_status` and `idx_projects_status`.

### Pattern 3: Analytics Aggregation

```sql
SELECT u.name, AVG(completion_pct) AS avg_completion
FROM (
  SELECT project_id,
         100.0 * COUNT(CASE WHEN status = 'done' THEN 1 END) / COUNT(*) AS completion_pct
  FROM tasks
  GROUP BY project_id
) stats
JOIN projects p ON stats.project_id = p.id
JOIN users u ON p.owner_id = u.id
GROUP BY u.name;
```

Benefits from task/project indexes plus fresh planner statistics.

---

## Security Considerations

1. **Principle of Least Privilege**: Application users should have only the required `SELECT`/`INSERT`/`UPDATE` permissions.
2. **Row-Level Security (RLS)**: Consider this for multi-tenant applications; it is not enabled in this demo.
3. **Parameterized Queries**: Always use `$1`, `$2`, etc. to prevent SQL injection.
4. **Audit Columns**: `created_at` tracks data lineage; consider adding `updated_at` for change tracking.

---

## Migration Philosophy

- Sequential numbering (`001_`, `002_`, etc.) ensures deterministic execution order.
- Idempotent operations use `IF NOT EXISTS` where appropriate.
- Each migration should have a corresponding down migration in production workflows.
- Test migrations on staging before production.

---

## Further Reading

- [PostgreSQL Documentation: Data Definition](https://www.postgresql.org/docs/current/ddl.html)
- [Use The Index, Luke!](https://use-the-index-luke.com/) - Practical indexing guide
- [SQL Antipatterns](https://www.sqlantipatterns.com/) - Common mistakes to avoid
- [Layer 2: Backend/APIs](https://markusisaksson1982.github.io/layers/backend-apis/) - How this database is queried
- [Layer 9: Containers](https://markusisaksson1982.github.io/layers/containers/) - Containerizing this schema

---

*Document version: 1.0. Last updated: 2024. Part of The Full Stack Observatory.*
