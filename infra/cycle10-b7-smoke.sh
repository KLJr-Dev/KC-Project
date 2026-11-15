#!/usr/bin/env bash
# SoftDev B7 gate: DMZ published; APP/DATA/CORP/MGMT unpublished.
# Usage: ./infra/cycle10-b7-smoke.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE=(docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.cycle10-lab.yml")

fail() { echo "FAIL: $*" >&2; exit 1; }

"${ROOT}/infra/assert-cycle10-unpublished.sh"

CFG_JSON="$("${COMPOSE[@]}" config --format json)"
python3 - "$CFG_JSON" <<'PY' || fail "B7 compose checks failed"
import json, sys
cfg = json.loads(sys.argv[1])
svcs = cfg["services"]

def ports(name):
    return svcs[name].get("ports") or []

def pub_targets(name):
    out = []
    for p in ports(name):
        # compose config json: published may be str
        pub = p.get("published")
        tgt = p.get("target")
        out.append((str(pub), tgt))
    return out

for s in ["c10-edge", "c10-partners", "c10-honeypot"]:
    if s not in svcs:
        raise SystemExit(f"missing {s}")

edge = pub_targets("c10-edge")
if ("8443", 443) not in [(a, int(b)) for a, b in edge]:
    raise SystemExit(f"edge ports={edge} want 8443→443")

partners = pub_targets("c10-partners")
if ("2122", 22) not in [(a, int(b)) for a, b in partners]:
    raise SystemExit(f"partners ports={partners} want 2122→22")

hp = pub_targets("c10-honeypot")
if ("2223", 2222) not in [(a, int(b)) for a, b in hp]:
    raise SystemExit(f"honeypot ports={hp} want 2223→2222")

# Internal hosts must not publish
for s in ["c10-bastion", "c10-docproc", "c10-db-archive", "c10-integrate", "c10-mail", "c10-files"]:
    if ports(s):
        raise SystemExit(f"{s} must not publish host ports: {ports(s)}")

print("OK: B7 DMZ publish matrix in compose")
PY

if ! docker info >/dev/null 2>&1; then
  echo "OK: B7 compose checks passed (Docker daemon down — skip runtime)"
  exit 0
fi

"${COMPOSE[@]}" up -d --build \
  c10-fw \
  c10-bastion c10-logs c10-backup c10-ws-admin \
  c10-integrate c10-mail c10-files \
  c10-ws-accounting c10-ftp-warehouse c10-mon-legacy \
  c10-db-archive c10-docproc \
  c10-edge c10-partners c10-honeypot

# HTTPS edge holding page + plant comment
code="$(curl -sk -o /tmp/c10-edge.html -w '%{http_code}' https://127.0.0.1:8443/ || true)"
[[ "$code" == "200" ]] || fail "edge HTTPS expected 200 got ${code}"
grep -q 'CYCLE10-PLANT' /tmp/c10-edge.html || fail "edge HTML missing CYCLE10-PLANT comment"

# SFTP port open
nc -z 127.0.0.1 2122 || fail "partners SFTP :2122 not listening"
nc -z 127.0.0.1 2223 || fail "honeypot :2223 not listening"

# Bastion still unpublished
docker inspect -f '{{json .NetworkSettings.Ports}}' c10-bastion | grep -q HostPort \
  && fail "bastion gained HostPort" || true

echo "OK: B7 DMZ — edge:8443 partners:2122 honeypot:2223; internals unpublished"
