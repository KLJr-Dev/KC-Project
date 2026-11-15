#!/usr/bin/env bash
# Cycle-10 SoftDev B5 gate — docproc LIVE OS
#
# Proves: helper /health · local.txt/proof.txt/bastion.secret · sudo find PrivEsc
# · db-archive DNS from docproc (net_data NIC). Chains B4 smoke.
# Authority: ADR-039 · box-plan · infra/cycle10/docproc/
# Usage: ./infra/cycle10-b5-smoke.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE=(docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.cycle10-lab.yml")

fail() { echo "FAIL: $*" >&2; exit 1; }

"${ROOT}/infra/cycle10-b4-smoke.sh"

CFG_JSON="$("${COMPOSE[@]}" config --format json)"
python3 - "$CFG_JSON" <<'PY' || fail "B5 compose checks failed"
import json, sys
cfg = json.loads(sys.argv[1])
s = cfg["services"].get("c10-docproc")
if not s:
    raise SystemExit("missing c10-docproc")
nets = s.get("networks") or {}
keys = set(nets.keys()) if isinstance(nets, dict) else set(nets)
if keys != {"net_app", "net_data"}:
    raise SystemExit(f"docproc nets={keys} want net_app+net_data")
if s.get("ports"):
    raise SystemExit("docproc must not publish host ports")
print("OK: B5 docproc topology in compose")
PY

if ! docker info >/dev/null 2>&1; then
  echo "OK: B5 compose checks passed (Docker daemon down — skip runtime)"
  exit 0
fi

"${COMPOSE[@]}" up -d --build c10-docproc c10-db-archive

# helper health
ok=0
for _ in $(seq 1 30); do
  if docker exec c10-docproc wget -qO- http://127.0.0.1:9090/health 2>/dev/null | grep -q docproc-helper; then
    ok=1
    break
  fi
  # busybox wget may be missing — use python
  if docker exec c10-docproc python3 -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:9090/health').read().decode())" 2>/dev/null | grep -q docproc-helper; then
    ok=1
    break
  fi
  sleep 1
done
[[ "$ok" == "1" ]] || fail "docproc helper /health not up"

docker exec c10-docproc test -f /home/docuser/local.txt || fail "local.txt missing"
docker exec c10-docproc test -f /root/proof.txt || fail "proof.txt missing"
docker exec c10-docproc test -f /root/bastion.secret || fail "bastion.secret missing"

# Hard gate: foothold user can read local, cannot read root proofs / shadow / sudoers
docker exec -u docuser c10-docproc grep -q 'OS{c10local' /home/docuser/local.txt \
  || fail "docuser cannot read local.txt"
if docker exec -u docuser c10-docproc cat /root/proof.txt >/dev/null 2>&1; then
  fail "docuser must not read /root/proof.txt without PrivEsc"
fi
if docker exec -u docuser c10-docproc cat /root/bastion.secret >/dev/null 2>&1; then
  fail "docuser must not read /root/bastion.secret without PrivEsc"
fi
if docker exec -u docuser c10-docproc cat /etc/shadow >/dev/null 2>&1; then
  fail "docuser must not read /etc/shadow"
fi
if docker exec -u docuser c10-docproc cat /etc/sudoers >/dev/null 2>&1; then
  fail "docuser must not read /etc/sudoers"
fi
if docker exec -u docuser c10-docproc ls /root >/dev/null 2>&1; then
  fail "docuser must not list /root"
fi

# PrivEsc path: sudo find → GTFOBins id → then root proofs readable via find -exec
docker exec -u docuser c10-docproc sudo /usr/bin/find /etc/passwd -exec id \; 2>/dev/null | grep -q 'uid=0' \
  || fail "sudo find PrivEsc smoke failed"
docker exec -u docuser c10-docproc sudo /usr/bin/find /root/proof.txt -exec cat {} \; 2>/dev/null \
  | grep -q 'OS{c10proof' || fail "PrivEsc cannot read proof.txt"

# archive reachable from docproc (DATA NIC exception)
docker exec c10-docproc getent hosts db-archive >/dev/null \
  || fail "docproc cannot resolve db-archive"

echo "OK: B5 docproc — helper, proofs, PrivEsc gates, archive DNS"
