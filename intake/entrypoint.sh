#!/bin/bash
# Intake entrypoint — admin seed, grant least-priv role, drop to non-root uvicorn.
set -euo pipefail

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_ADMIN_USER="${DB_ADMIN_USER:-postgres}"
DB_ADMIN_PASSWORD="${DB_ADMIN_PASSWORD:-kc-change-me-prod}"
INTAKE_DB="${INTAKE_DB_NAME:-kc_intake}"
INTAKE_DB_USER="${INTAKE_DB_USER:-kc_intake_app}"
INTAKE_DB_PASSWORD="${INTAKE_DB_PASSWORD:-kc-intake-app-change-me}"

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

echo "intake: ensuring least-priv role ${INTAKE_DB_USER}..."
PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d "$INTAKE_DB" -v ON_ERROR_STOP=1 <<-EOSQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${INTAKE_DB_USER}') THEN
    CREATE ROLE ${INTAKE_DB_USER} LOGIN PASSWORD '${INTAKE_DB_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE;
  ELSE
    ALTER ROLE ${INTAKE_DB_USER} WITH LOGIN PASSWORD '${INTAKE_DB_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE;
  END IF;
END
\$\$;
GRANT CONNECT ON DATABASE ${INTAKE_DB} TO ${INTAKE_DB_USER};
GRANT USAGE ON SCHEMA public TO ${INTAKE_DB_USER};
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${INTAKE_DB_USER};
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${INTAKE_DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${INTAKE_DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${INTAKE_DB_USER};
EOSQL

EXPORT_ROOT="${EXPORT_ROOT:-/app/exports}"
[[ -d "${EXPORT_ROOT}/9302" && -d "${EXPORT_ROOT}/9303" ]] \
  || { echo "intake: missing export packages under ${EXPORT_ROOT}" >&2; exit 1; }
echo "intake: export tree OK"

# Drop privileges for uvicorn (CWE-250).
if [[ "$(id -u)" -eq 0 ]]; then
  chown -R intake:intake /app/exports /app/private 2>/dev/null || true
  exec gosu intake uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
fi
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
