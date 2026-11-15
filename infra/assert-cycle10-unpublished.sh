#!/usr/bin/env bash
# Cycle-10 — prod-alone unpublished assert (SoftDev / Blue gate).
#
# Ensures docker-compose.prod.yml never defines Cycle-10 lab services, zone
# networks, or CYCLE10 plant markers. Lab hosts live only in:
#   infra/docker-compose.cycle10-lab.yml + infra/cycle10/
#
# Authority: ADR-039 · docs/security/Cycle-10/Dev/cycle-10-decisions.md
# Usage: ./infra/assert-cycle10-unpublished.sh
# Wired later into smoke alongside cycle6–9 blue asserts.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${ROOT}/infra/docker-compose.prod.yml"

fail() { echo "FAIL: $*" >&2; exit 1; }

# Lab services use c10-* prefix (prod already has Docker network name "edge")
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
