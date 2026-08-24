#!/usr/bin/env bash
# C2-F03 / v2.1.0 — prod compose must not publish Postgres to the host.
# Usage: from repo root or infra/: ./assert-pg-unpublished.sh
# Does not start containers — validates compose config only.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${ROOT}/infra/docker-compose.prod.yml"

# Render config without requiring a running daemon for the assert itself.
CONFIG="$(docker compose -f "$COMPOSE_FILE" config 2>/dev/null)" || {
  echo "FAIL: could not render $COMPOSE_FILE" >&2
  exit 1
}

# postgres service must not map host 5433 (e2e overlay is separate).
if echo "$CONFIG" | grep -A40 'postgres:' | grep -E 'published: ["'\'']?5433|"5433:|5433:' >/dev/null 2>&1; then
  echo "FAIL: docker-compose.prod.yml publishes Postgres on host :5433" >&2
  exit 1
fi

# Also reject classic short syntax if present in raw file (belt + suspenders).
if grep -E "^\s*-\s*['\"]?5433:5432" "$COMPOSE_FILE" >/dev/null 2>&1; then
  echo "FAIL: $COMPOSE_FILE contains host port mapping 5433:5432" >&2
  exit 1
fi

echo "OK: prod compose does not publish Postgres :5433"
