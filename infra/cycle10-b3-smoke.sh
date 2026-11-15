#!/usr/bin/env bash
# Cycle-10 SoftDev B3 gate — CORPORATE zone
#
# Proves: integrate dual-homes net_app+net_corp+net_mgmt; mail/files/workstations
# exist; corp hosts must NOT attach net_mgmt. Chains B2 smoke first.
# Authority: ADR-039 · topology · cycle10-b2-smoke.sh
# Usage: ./infra/cycle10-b3-smoke.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE=(docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.cycle10-lab.yml")

fail() { echo "FAIL: $*" >&2; exit 1; }

"${ROOT}/infra/cycle10-b2-smoke.sh"

CFG_JSON="$("${COMPOSE[@]}" config --format json)"

python3 - "$CFG_JSON" <<'PY' || fail "B3 compose network checks failed"
import json, sys
cfg = json.loads(sys.argv[1])
svcs = cfg["services"]
needed = [
    "c10-integrate", "c10-mail", "c10-files",
    "c10-ws-accounting", "c10-ftp-warehouse", "c10-mon-legacy",
]
for s in needed:
    if s not in svcs:
        raise SystemExit(f"missing {s}")

def nets(name):
    n = svcs[name].get("networks") or {}
    return set(n.keys()) if isinstance(n, dict) else set(n)

integ = nets("c10-integrate")
if not {"net_app", "net_corp", "net_mgmt"} <= integ:
    raise SystemExit(f"integrate nets={integ} want app+corp+mgmt")

for s in ["c10-mail", "c10-files", "c10-ws-accounting", "c10-ftp-warehouse", "c10-mon-legacy", "c10-ws-admin"]:
    if "net_mgmt" in nets(s):
        raise SystemExit(f"{s} must not attach net_mgmt (got {nets(s)})")
print("OK: B3 network topology in compose")
PY

if ! docker info >/dev/null 2>&1; then
  echo "OK: B3 compose checks passed (Docker daemon down — skip runtime)"
  exit 0
fi

"${COMPOSE[@]}" up -d --build \
  c10-fw c10-bastion c10-logs c10-backup c10-ws-admin \
  c10-integrate c10-mail c10-files \
  c10-ws-accounting c10-ftp-warehouse c10-mon-legacy

docker exec c10-integrate getent hosts bastion >/dev/null \
  || fail "integrate cannot resolve bastion"

# corp-only mail should not see bastion DNS on shared mgmt
if docker exec c10-mail getent hosts bastion >/dev/null 2>&1; then
  fail "mail unexpectedly resolves bastion"
fi

echo "OK: B3 CORPORATE — integrate dual-home + bastion path; workstations off MGMT"
