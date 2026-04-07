# fullstack-database

![Layer Badge](https://img.shields.io/badge/Part_of-The_Full_Stack_Observatory_Layer_3-blue?style=for-the-badge)

> Companion code for **Layer 3 (Database)** of [The Full Stack Observatory](https://markusisaksson1982.github.io/layers/database/)

This repository contains PostgreSQL schema definitions, migration scripts, and seed data matching the schema demonstrated in the sql.js browser console on the layer page.

**Live Demo**: [https://markusisaksson1982.github.io/layers/database/](https://markusisaksson1982.github.io/layers/database/)

---

## Schema Overview (Text-based ERD)

```text
+-----------------+       +-----------------+       +-----------------+
|      users      |       |    projects     |       |      tasks      |
+-----------------+       +-----------------+       +-----------------+
| id PK           |<----+ | id PK           |<----+ | id PK           |
| name NOT NULL   |     | | name NOT NULL   |     | | title NOT NULL  |
| email UNIQUE    |     +-| owner_id FK     |     +-| project_id FK   |
| role            |       | status CHECK    |       | assignee_id FK  |
| created_at      |       | created_at      |       | priority CHECK  |
+-----------------+       +-----------------+       | status CHECK    |
                                                     | created_at      |
                                                     +-----------------+
```

### Tables

| Table | Description | Key Constraints |
|-------|-------------|----------------|
| `users` | Application users | `email` UNIQUE, `name` NOT NULL |
| `projects` | Work projects | `owner_id` FK -> `users`, `status` CHECK |
| `tasks` | Project tasks | `project_id`/`assignee_id` FKs, `priority` 1-5 CHECK |

### CHECK Constraints

- `projects.status IN ('active', 'archived', 'draft')`
- `tasks.priority BETWEEN 1 AND 5`
- `tasks.status IN ('todo', 'in_progress', 'done')`

### Indexes

- `idx_projects_owner_id` for project lookups by owner
- `idx_tasks_project_id` for task lookups by project
- `idx_tasks_assignee_id` for task lookups by assignee
- `idx_tasks_priority_status` for priority and status filtering
- `idx_projects_active` for active-project queries

---

## Quick Setup

### Prerequisites

- PostgreSQL 15+ installed and running
- Bash-compatible shell (Linux/macOS/WSL)

### One-time Setup

```bash
# Clone the repo
git clone https://github.com/MarkusIsaksson1982/fullstack-database.git
cd fullstack-database

# Copy environment config
cp .env.example .env
# Edit .env with your database credentials

# Run setup script (creates DB, runs migrations, seeds data)
./scripts/setup.sh
```

### Reset Database

```bash
# Drop and recreate database with fresh schema + seed data
./scripts/reset.sh
```

### Run Migrations Only

```bash
npx node-pg-migrate up
```

---

## Query Presets

The `queries/` directory contains 8 preset queries matching the layer page console:

1. `all_users.sql` - List all users
2. `active_projects_with_owner.sql` - Active projects joined with owner details
3. `tasks_by_priority.sql` - Tasks ordered by priority (high to low)
4. `overdue_tasks.sql` - Tasks past their implied deadline with project context
5. `user_task_counts.sql` - Aggregated task counts per user
6. `create_indexes.sql` - Strategic index creation script
7. `insert_user.sql` - Parameterized INSERT for new users
8. `complex_join.sql` - Multi-table JOIN with aggregation (analytics query)

---

## Project Structure

```text
fullstack-database/
|-- README.md
|-- package.json
|-- .env.example
|-- migrations/
|   |-- 001_create_users.sql
|   |-- 002_create_projects.sql
|   |-- 003_create_tasks.sql
|   `-- 004_create_indexes.sql
|-- seed/
|   `-- seed.sql
|-- queries/
|   |-- all_users.sql
|   |-- active_projects_with_owner.sql
|   |-- tasks_by_priority.sql
|   |-- overdue_tasks.sql
|   |-- user_task_counts.sql
|   |-- create_indexes.sql
|   |-- insert_user.sql
|   `-- complex_join.sql
|-- scripts/
|   |-- setup.sh
|   `-- reset.sh
`-- docs/
    `-- SCHEMA.md
```

---

## Testing Queries

Connect to your database and run any preset:

```bash
psql "$DATABASE_URL" -f queries/all_users.sql
psql "$DATABASE_URL" -f queries/complex_join.sql
```

Or interactively:

```bash
psql "$DATABASE_URL"
# Then: \i queries/active_projects_with_owner.sql
```

---

## License

MIT © The Full Stack Observatory

## Cross-References

- [Layer 2: Backend/APIs](https://markusisaksson1982.github.io/layers/backend-apis/) - API that queries this schema
- [Layer 9: Containers](https://markusisaksson1982.github.io/layers/containers/) - runs PostgreSQL in Docker
