#!/usr/bin/env bash
# scripts/reset.sh
# Layer 3: Database - The Full Stack Observatory
# Drops and recreates database with fresh schema + seed data

set -e

echo "RESET WARNING: This will DROP and RECREATE your database."
echo "=============================================================="
read -p "Type 'RESET' to confirm: " CONFIRM

if [ "$CONFIRM" != "RESET" ]; then
    echo "Reset cancelled."
    exit 1
fi

# Load environment
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

: "${DATABASE_URL:=postgresql://postgres:postgres@localhost:5432/fullstack_observatory_db}"
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

echo "Dropping database: $DB_NAME"
psql postgresql://postgres:postgres@localhost:5432/postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "Recreating database..."
psql postgresql://postgres:postgres@localhost:5432/postgres -c "CREATE DATABASE $DB_NAME;"

echo "Running fresh migrations..."
npx node-pg-migrate up --database-url "$DATABASE_URL"

echo "Seeding data..."
psql "$DATABASE_URL" -f seed/seed.sql

echo ""
echo "Reset complete."
psql "$DATABASE_URL" -c "SELECT 'users' AS table_name, COUNT(*) AS count FROM users UNION ALL SELECT 'projects', COUNT(*) FROM projects UNION ALL SELECT 'tasks', COUNT(*) FROM tasks;"
