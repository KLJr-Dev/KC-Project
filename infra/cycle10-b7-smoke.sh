#!/usr/bin/env bash
# Cycle-10 SoftDev B7 gate — DMZ publish matrix (HTTPS-only)
#
# Proves: edge :443 HTTPS + Stage-0 HTML comment · partners/honeypot unpublished
# · internal LIVE hosts unpublished · prod nginx :8080 reset under lab overlay.
# Authority: ADR-039 · topology DMZ · assert-cycle10-unpublished.sh
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
    return svcs.get(name, {}).get("ports") or []

def pub_targets(name):
    out = []
    for p in ports(name):
        pub = p.get("published")
        tgt = p.get("target")
        out.append((str(pub), int(tgt) if tgt is not None else None))
    return out

for s in ["c10-edge", "c10-partners", "c10-honeypot"]:
    if s not in svcs:
        raise SystemExit(f"missing {s}")

edge = pub_targets("c10-edge")
if ("443", 443) not in edge:
    raise SystemExit(f"edge ports={edge} want 443→443")

if ports("c10-partners"):
    raise SystemExit(f"partners must not publish host ports: {ports('c10-partners')}")
if ports("c10-honeypot"):
    raise SystemExit(f"honeypot must not publish host ports: {ports('c10-honeypot')}")

# Prod nginx cleartext must be reset under lab overlay
if ports("nginx"):
    raise SystemExit(f"nginx must not publish under lab tip: {ports('nginx')}")

# Internal hosts must not publish
for s in ["c10-bastion", "c10-docproc", "c10-db-archive", "c10-integrate", "c10-mail", "c10-files",
          "c10-ws-admin", "c10-mon-legacy", "c10-ftp-warehouse", "c10-ws-accounting",
          "c10-logs", "c10-backup"]:
    if ports(s):
        raise SystemExit(f"{s} must not publish host ports: {ports(s)}")

print("OK: B7 DMZ — only edge 443→443 published")
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
  c10-edge c10-partners c10-honeypot \
  nginx

# HTTPS edge holding page + plant comment
code="$(curl -sk -o /tmp/c10-edge.html -w '%{http_code}' https://127.0.0.1:443/ || true)"
[[ "$code" == "200" ]] || fail "edge HTTPS :443 expected 200 got ${code}"
grep -q '/staff-access/' /tmp/c10-edge.html || fail "edge HTML missing /staff-access/ discovery comment"

# Former noise publishes must be closed
nc -z 127.0.0.1 2122 2>/dev/null && fail "partners must not listen on host :2122" || true
nc -z 127.0.0.1 2223 2>/dev/null && fail "honeypot must not listen on host :2223" || true
nc -z 127.0.0.1 8080 2>/dev/null && fail "prod nginx must not listen on host :8080 under lab tip" || true
nc -z 127.0.0.1 8443 2>/dev/null && fail "legacy edge :8443 must not listen" || true

# Bastion still unpublished
docker inspect -f '{{json .NetworkSettings.Ports}}' c10-bastion | grep -q HostPort \
  && fail "bastion gained HostPort" || true

echo "OK: B7 DMZ — edge:443 only; partners/honeypot/nginx unpublished"
