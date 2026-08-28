#!/usr/bin/env bash
# Prod compose alone must not publish Cycle-8 overlay ports / services.
# Usage: ./infra/assert-cycle8-unpublished.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${ROOT}/infra/docker-compose.prod.yml"

CONFIG="$(docker compose -f "$COMPOSE_FILE" config 2>/dev/null)" || {
  echo "FAIL: could not render $COMPOSE_FILE" >&2
  exit 1
}

fail_published() {
  local port="$1"
  if echo "$CONFIG" | grep -E "published: [\"']?${port}[\"']?|\"${port}:|${port}:" >/dev/null 2>&1; then
    echo "FAIL: docker-compose.prod.yml publishes host :${port} (Cycle-8 overlay-only)" >&2
    exit 1
  fi
  if grep -E "^\s*-\s*['\"]?${port}:" "$COMPOSE_FILE" >/dev/null 2>&1; then
    echo "FAIL: $COMPOSE_FILE contains host port mapping for ${port}" >&2
    exit 1
  fi
}

fail_published 21
fail_published 22

for port in $(seq 30000 30009); do
  fail_published "$port"
done

for svc in cycle8-ftp cycle8-cowrie cycle8-edge cycle8-samba cycle8-mail cycle8-intake; do
  if grep -E "^\s*${svc}:" "$COMPOSE_FILE" >/dev/null 2>&1; then
    echo "FAIL: $COMPOSE_FILE defines ${svc} (use docker-compose.cycle8.yml overlay)" >&2
    exit 1
  fi
done

echo "OK: prod compose does not publish Cycle-8 :21 / :22 / PASV 30000-30009 or cycle8-* services"
