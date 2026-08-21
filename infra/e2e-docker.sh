#!/usr/bin/env bash
# v2.0.0 — Run backend e2e suite against Docker PostgreSQL (kc_prod).
# Publishes :5433 only via docker-compose.e2e.yml overlay (not default prod).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${ROOT}/infra/docker-compose.prod.yml"
E2E_OVERLAY="${ROOT}/infra/docker-compose.e2e.yml"

echo "Starting prod postgres with e2e host port 5433..."
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
DB_PASSWORD="${DB_PASSWORD:-kc-change-me-prod}"

echo "Running e2e against kc_prod on localhost:5433..."
cd "${ROOT}/backend"
DB_HOST=localhost \
DB_PORT=5433 \
DB_USER=postgres \
DB_PASSWORD="$DB_PASSWORD" \
DB_NAME=kc_prod \
JWT_SECRET=test-e2e-jwt-secret \
JWT_EXPIRES_IN=1h \
npm run test:e2e

echo "E2E passed against Docker postgres."
