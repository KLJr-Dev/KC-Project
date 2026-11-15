#!/usr/bin/env bash
# SoftDev B2 gate: MANAGEMENT hosts exist; bastion closed from internet.
# Usage: ./infra/cycle10-b2-smoke.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LAB=(docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.cycle10-lab.yml")

fail() { echo "FAIL: $*" >&2; exit 1; }

"${ROOT}/infra/assert-cycle10-unpublished.sh"

# Compose must not publish bastion / mgmt SSH to host
CFG="$("${LAB[@]}" config)"
echo "$CFG" | grep -E 'c10-bastion:' >/dev/null || fail "c10-bastion missing from lab compose"
echo "$CFG" | grep -E 'c10-logs:' >/dev/null || fail "c10-logs missing"
echo "$CFG" | grep -E 'c10-backup:' >/dev/null || fail "c10-backup missing"

# No host port bindings for bastion (published ports block looks like "published:" under ports)
BASTION_BLOCK="$(echo "$CFG" | awk '/^  c10-bastion:/{p=1} p&&/^  [a-z]/{if(!/^  c10-bastion:/) exit} p')"
echo "$BASTION_BLOCK" | grep -E 'published:' >/dev/null && fail "c10-bastion publishes a host port (must be closed from internet)" || true

if ! docker info >/dev/null 2>&1; then
  echo "OK: B2 compose checks passed (Docker daemon down — skip runtime)"
  exit 0
fi

"${LAB[@]}" up -d --build c10-fw c10-bastion c10-logs c10-backup c10-ws-admin

# Runtime: bastion has no PublicPorts
PUB="$(docker inspect -f '{{json .NetworkSettings.Ports}}' c10-bastion)"
echo "$PUB" | grep -E '"HostPort"' >/dev/null && fail "c10-bastion has HostPort mapping: $PUB" || true

# Only on mgmt network
NETS="$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' c10-bastion)"
echo "$NETS" | grep -qw nw_c10_mgmt || fail "bastion not on nw_c10_mgmt (got: $NETS)"
echo "$NETS" | grep -Eq 'nw_c10_(dmz|app)' && fail "bastion attached to non-MGMT zone: $NETS" || true

docker exec c10-bastion test -f /root/crown.txt || fail "crown placeholder missing"
docker exec c10-logs test -f /var/log/northwind/README || fail "logs stub missing"
docker exec c10-backup test -f /backup/northwind/README || fail "backup stub missing"

echo "OK: B2 MANAGEMENT — bastion unpublished, MGMT-only, stubs up"
