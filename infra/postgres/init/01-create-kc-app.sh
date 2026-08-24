#!/bin/bash
# v2.1.0 — create least-priv app role on first Postgres init (C2-F07).
# Only runs when the data directory is empty. migrate-and-grant also ensures
# the role exists on every backend start (covers pre-existing volumes).
set -euo pipefail

APP_USER="${DB_APP_USER:-kc_app}"
APP_PASSWORD="${DB_APP_PASSWORD:-${DB_PASSWORD:-}}"
ADMIN_DB="${POSTGRES_DB:-kc_prod}"

if [[ -z "$APP_PASSWORD" ]]; then
  echo "01-create-kc-app: DB_APP_PASSWORD/DB_PASSWORD empty — skip app role"
  exit 0
fi

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$ADMIN_DB" <<-EOSQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${APP_USER}') THEN
    CREATE ROLE ${APP_USER} LOGIN PASSWORD '${APP_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE;
  ELSE
    ALTER ROLE ${APP_USER} WITH LOGIN PASSWORD '${APP_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE;
  END IF;
END
\$\$;
GRANT CONNECT ON DATABASE ${ADMIN_DB} TO ${APP_USER};
GRANT USAGE ON SCHEMA public TO ${APP_USER};
EOSQL

echo "01-create-kc-app: ensured role ${APP_USER}"
