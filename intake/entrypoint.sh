#!/bin/bash
# CYCLE8: Intake entrypoint — wait for Postgres, seed kc_intake, run uvicorn.
set -euo pipefail

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_ADMIN_USER="${DB_ADMIN_USER:-postgres}"
DB_ADMIN_PASSWORD="${DB_ADMIN_PASSWORD:-kc-change-me-prod}"
INTAKE_DB="${INTAKE_DB_NAME:-kc_intake}"

echo "intake: waiting for postgres at ${DB_HOST}:${DB_PORT}..."
i=0
until PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d postgres -c 'SELECT 1' >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "intake: postgres not ready" >&2
    exit 1
  fi
  sleep 1
done

echo "intake: ensuring database ${INTAKE_DB}..."
PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d postgres -tc \
  "SELECT 1 FROM pg_database WHERE datname='${INTAKE_DB}'" | grep -q 1 \
  || PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d postgres \
    -c "CREATE DATABASE ${INTAKE_DB};"

echo "intake: applying seed..."
PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d "$INTAKE_DB" -f /app/seed/seed.sql

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
