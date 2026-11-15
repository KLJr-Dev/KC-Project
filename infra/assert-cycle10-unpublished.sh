#!/usr/bin/env bash
# Prod compose alone must not publish Cycle-10 lab ports / services.
# Usage: ./infra/assert-cycle10-unpublished.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${ROOT}/infra/docker-compose.prod.yml"

fail() { echo "FAIL: $*" >&2; exit 1; }

# Lab services use c10-* prefix (prod already has network name "edge")
for svc in c10-fw c10-bastion c10-docproc c10-integrate c10-mail c10-files \
  c10-db-archive c10-edge c10-partners c10-honeypot c10-ws-accounting \
  c10-ftp-warehouse c10-mon-legacy c10-ws-admin c10-logs c10-backup; do
  if grep -E "^[[:space:]]*${svc}:" "$COMPOSE_FILE" >/dev/null 2>&1; then
    fail "docker-compose.prod.yml defines ${svc} (use docker-compose.cycle10-lab.yml)"
  fi
done

for net in net_dmz net_app net_data net_corp net_mgmt nw_c10_; do
  if grep -E "${net}" "$COMPOSE_FILE" >/dev/null 2>&1; then
    fail "docker-compose.prod.yml references ${net} (lab overlay only)"
  fi
done

if grep -E 'cycle10/|CYCLE10-' "$COMPOSE_FILE" >/dev/null 2>&1; then
  fail "docker-compose.prod.yml references cycle10 plants"
fi

echo "OK: prod compose does not define Cycle-10 lab services/networks"
