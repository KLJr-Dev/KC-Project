#!/usr/bin/env bash
# SoftDev B4 gate: db-archive on internal net_data; unpublished.
# Usage: ./infra/cycle10-b4-smoke.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE=(docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.cycle10-lab.yml")

fail() { echo "FAIL: $*" >&2; exit 1; }

"${ROOT}/infra/cycle10-b3-smoke.sh"

CFG_JSON="$("${COMPOSE[@]}" config --format json)"
python3 - "$CFG_JSON" <<'PY' || fail "B4 compose checks failed"
import json, sys
cfg = json.loads(sys.argv[1])
s = cfg["services"].get("c10-db-archive")
if not s:
    raise SystemExit("missing c10-db-archive")
nets = s.get("networks") or {}
keys = set(nets.keys()) if isinstance(nets, dict) else set(nets)
if keys != {"net_data"}:
    raise SystemExit(f"db-archive nets={keys} want only net_data")
ports = s.get("ports") or []
if ports:
    raise SystemExit(f"db-archive must not publish host ports: {ports}")
print("OK: B4 db-archive topology in compose")
PY

if ! docker info >/dev/null 2>&1; then
  echo "OK: B4 compose checks passed (Docker daemon down — skip runtime)"
  exit 0
fi

"${COMPOSE[@]}" up -d --build c10-db-archive
# wait healthy
for i in $(seq 1 30); do
  st="$(docker inspect -f '{{.State.Health.Status}}' c10-db-archive 2>/dev/null || echo starting)"
  [[ "$st" == "healthy" ]] && break
  sleep 2
done
[[ "$(docker inspect -f '{{.State.Health.Status}}' c10-db-archive)" == "healthy" ]] \
  || fail "db-archive not healthy"

docker exec c10-db-archive psql -U archive -d northwind_archive -c \
  "SELECT tag FROM service_accounts WHERE tag='LIVE' LIMIT 1;" | grep -q LIVE \
  || fail "LIVE service_accounts stub missing"

echo "OK: B4 DATA — db-archive healthy on net_data (unpublished)"
