#!/usr/bin/env bash
# v1.1.0 — Run CTF-mode e2e against Docker PostgreSQL on :5433.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${ROOT}/infra/docker-compose.prod.yml"
E2E_OVERLAY="${ROOT}/infra/docker-compose.e2e.yml"

echo "Starting postgres for CTF e2e (host :5433)..."
docker compose -f "$COMPOSE_FILE" -f "$E2E_OVERLAY" up -d postgres

echo "Waiting for postgres..."
for i in $(seq 1 30); do
  if docker compose -f "$COMPOSE_FILE" -f "$E2E_OVERLAY" exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker compose -f "$COMPOSE_FILE" -f "$E2E_OVERLAY" exec -T postgres pg_isready -U postgres

DB_PASSWORD="${DB_PASSWORD:-}"
if [[ -z "$DB_PASSWORD" && -f "${ROOT}/infra/.env" ]]; then
  # shellcheck disable=SC1091
  set -a
  # shellcheck source=/dev/null
  source "${ROOT}/infra/.env"
  set +a
fi
DB_PASSWORD="${DB_PASSWORD:-postgres}"

echo "Running CTF e2e (CTF_MODE=true) against kc_prod on localhost:5433..."
cd "${ROOT}/backend"
DB_HOST=localhost \
DB_PORT=5433 \
DB_USER=postgres \
DB_PASSWORD="$DB_PASSWORD" \
DB_NAME=kc_prod \
npm run test:e2e:ctf

echo "CTF e2e passed."
