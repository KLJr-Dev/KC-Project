#!/bin/sh
# v2.1.0 — migrate as DB admin, grant kc_app DML, then drop privileges (CWE-250 / C2-F07).
set -e
mkdir -p /app/uploads
# Migrate runs as root and seeds files under /app/uploads. Make the mount
# world-writable first (named volumes + userns can leave node-only ownership
# that even container-root cannot write). Then chown for the node runtime.
chmod 0777 /app/uploads 2>/dev/null || true

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

chown -R node:node /app/uploads 2>/dev/null || true
exec su-exec node "$@"
