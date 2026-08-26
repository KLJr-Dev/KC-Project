#!/usr/bin/env bash
# Default prod compose must not publish SSH / lab-host / kc-agent ports.
# Usage: ./infra/assert-ssh-unpublished.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${ROOT}/infra/docker-compose.prod.yml"

CONFIG="$(docker compose -f "$COMPOSE_FILE" config 2>/dev/null)" || {
  echo "FAIL: could not render $COMPOSE_FILE" >&2
  exit 1
}

if echo "$CONFIG" | grep -E 'published: ["'\'']?2222|"2222:|2222:' >/dev/null 2>&1; then
  echo "FAIL: docker-compose.prod.yml publishes host :2222 (SSH must be overlay-only)" >&2
  exit 1
fi

if grep -E "^\s*-\s*['\"]?2222:" "$COMPOSE_FILE" >/dev/null 2>&1; then
  echo "FAIL: $COMPOSE_FILE contains host port mapping for 2222" >&2
  exit 1
fi

if grep -E '^\s*ssh:' "$COMPOSE_FILE" >/dev/null 2>&1; then
  echo "FAIL: $COMPOSE_FILE defines an ssh service (use docker-compose.ssh.yml overlay)" >&2
  exit 1
fi

if grep -E '^\s*lab-host:' "$COMPOSE_FILE" >/dev/null 2>&1; then
  echo "FAIL: $COMPOSE_FILE defines lab-host (use docker-compose.lab-host.yml overlay)" >&2
  exit 1
fi

if echo "$CONFIG" | grep -E 'published: ["'\'']?8787|"8787:|8787:' >/dev/null 2>&1; then
  echo "FAIL: docker-compose.prod.yml publishes host :8787 (kc-agent CTF-only)" >&2
  exit 1
fi

echo "OK: prod compose does not publish SSH :2222 / lab-host / :8787"
