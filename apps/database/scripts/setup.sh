#!/usr/bin/env bash
# scripts/setup.sh
# Layer 3: Database - The Full Stack Observatory
# Creates database, runs migrations, and seeds initial data

set -e

echo "Full Stack Observatory - Layer 3 Database Setup"
echo "=================================================="

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "Loaded environment from .env"
else
    echo "Warning: .env file not found. Using default DATABASE_URL or system defaults."
fi

# Default DATABASE_URL if not set
: "${DATABASE_URL:=postgresql://postgres:postgres@localhost:5432/fullstack_observatory_db}"

# Extract database name from URL for creation
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
echo "Target database: $DB_NAME"

# Create database if it doesn't exist (requires superuser access)
echo "Creating database if not exists..."
psql postgresql://postgres:postgres@localhost:5432/postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql postgresql://postgres:postgres@localhost:5432/postgres -c "CREATE DATABASE $DB_NAME"

# Run migrations using node-pg-migrate
echo "Running migrations..."
npx node-pg-migrate up --database-url "$DATABASE_URL"

# Seed the database
echo "Seeding initial data..."
psql "$DATABASE_URL" -f seed/seed.sql

# Verify setup
echo ""
echo "Setup complete. Verifying data..."
psql "$DATABASE_URL" -c "SELECT 'users' AS table_name, COUNT(*) AS count FROM users UNION ALL SELECT 'projects', COUNT(*) FROM projects UNION ALL SELECT 'tasks', COUNT(*) FROM tasks;"

echo ""
echo "Database ready for Layer 3 of The Full Stack Observatory."
echo "Explore queries in the /queries directory or connect via your app."
