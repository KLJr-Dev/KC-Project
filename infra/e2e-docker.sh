#!/usr/bin/env bash
# v0.8.2 — Run backend e2e suite against Docker PostgreSQL (kc_prod).
# Requires: docker compose prod stack postgres healthy on host :5433.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${ROOT}/infra/docker-compose.prod.yml"

echo "Starting prod postgres (host port 5433 for e2e)..."
docker compose -f "$COMPOSE_FILE" up -d postgres

echo "Waiting for postgres..."
for i in $(seq 1 30); do
  if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres

echo "Running e2e (148 tests) against kc_prod on localhost:5433..."
cd "${ROOT}/backend"
DB_HOST=localhost \
DB_PORT=5433 \
DB_USER=postgres \
DB_PASSWORD=postgres \
DB_NAME=kc_prod \
npm run test:e2e

echo "E2E passed against Docker postgres."
