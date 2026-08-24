#!/bin/sh
# v2.1.0 — migrate as DB admin, grant kc_app DML, then drop privileges (CWE-250 / C2-F07).
set -e
mkdir -p /app/uploads
chown -R node:node /app/uploads

if [ -f /app/dist/scripts/migrate-and-grant.js ]; then
  echo "[entrypoint] running migrate-and-grant as admin..."
  DB_ADMIN_USER="${DB_ADMIN_USER:-postgres}" \
  DB_ADMIN_PASSWORD="${DB_ADMIN_PASSWORD:-${DB_PASSWORD}}" \
  node /app/dist/scripts/migrate-and-grant.js
  # Nest must not re-run migrations as the least-priv app role
  export MIGRATIONS_RUN=false
else
  echo "[entrypoint] WARN: migrate-and-grant.js missing; relying on migrationsRun"
fi

exec su-exec node "$@"
