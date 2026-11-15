#!/usr/bin/env bash
# Cycle-10 SoftDev B9 — reachability probes (insecure tip)
#
# Samples the locked matrix: integrate→bastion allow; non-integrate↛bastion;
# docproc→db-archive allow; host publish only DMZ. Expand as fw FORWARD rules grow.
# Authority: v1.10.0-reachability-matrix.md
# Usage: ./infra/cycle10-reachability.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fail() { echo "FAIL: $*" >&2; exit 1; }

need() { docker inspect "$1" >/dev/null 2>&1 || fail "missing container $1"; }

need c10-bastion
need c10-integrate
need c10-docproc
need c10-db-archive
need c10-ws-admin
need c10-edge

# Host publish matrix — ONLY edge :443
PUB="$(docker port c10-edge 2>/dev/null || true)"
echo "$PUB" | grep -Eq '0\.0\.0\.0:443|:::443' || fail "edge :443 not published to host"
docker port c10-partners 2>/dev/null | grep -q . && fail "partners must not publish ports" || true
docker port c10-honeypot 2>/dev/null | grep -q . && fail "honeypot must not publish ports" || true
docker port c10-bastion 2>/dev/null | grep -q . && fail "bastion must not publish ports" || true
docker port c10-docproc 2>/dev/null | grep -q . && fail "docproc must not publish ports" || true
docker port c10-db-archive 2>/dev/null | grep -q . && fail "db-archive must not publish ports" || true
# Cleartext prod nginx must be down under lab tip
if docker ps --format '{{.Names}}' | grep -qx infra-nginx-1; then
  docker port infra-nginx-1 2>/dev/null | grep -q . && fail "nginx must not publish under lab tip" || true
fi

# docproc → archive DNS + TCP (shared net_data)
docker exec c10-docproc getent hosts db-archive.northwind.lab >/dev/null \
  || fail "docproc cannot resolve db-archive"
docker exec c10-docproc sh -c 'nc -z -w2 db-archive.northwind.lab 5432' \
  || fail "docproc cannot reach db-archive:5432"

# integrate → bastion :22 (allowed)
INT_IP="$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' c10-integrate | awk '{print $1}')"
BAS_IP="$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' c10-bastion | awk '{print $1}')"
docker exec c10-integrate sh -c "nc -z -w3 bastion.northwind.lab 22" \
  || fail "integrate cannot reach bastion:22"

# ws-admin (CORP noise) must NOT reach bastion SSH
if docker exec c10-ws-admin sh -c "nc -z -w2 bastion.northwind.lab 22" 2>/dev/null; then
  fail "ws-admin unexpectedly reached bastion:22"
fi

echo "OK: B9 reachability — edge:443 only; docproc→archive; integrate→bastion; ws-admin↛bastion"
echo "    note: integrate=$INT_IP bastion=$BAS_IP"
