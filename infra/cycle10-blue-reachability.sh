#!/usr/bin/env bash
# Cycle-10 Blue reachability — v2.10.0 matrix (plants closed).
set -euo pipefail

fail() { echo "FAIL: $*" >&2; exit 1; }

echo "== Cycle-10 Blue reachability =="

# Host publish: 443 + optional 80 redirect only
for p in 2122 2223 8080 8443 5432 22 9090; do
  if nc -z 127.0.0.1 "$p" 2>/dev/null; then
    fail "unexpected host listener on :$p"
  fi
done
nc -z 127.0.0.1 443 2>/dev/null || fail "edge :443 not listening"

if docker inspect c10-docproc >/dev/null 2>&1; then
  NETS=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' c10-docproc)
  echo "$NETS" | grep -q 'net_data' && fail "docproc still on net_data"
  # docproc must not reach archive
  if docker exec c10-docproc sh -c 'nc -z -w 2 db-archive 5432' 2>/dev/null; then
    fail "docproc can reach db-archive:5432"
  fi
  echo "  OK docproc ↛ archive"
fi

if docker inspect c10-bastion >/dev/null 2>&1 && docker inspect c10-integrate >/dev/null 2>&1; then
  docker exec c10-integrate sh -c 'nc -z -w 3 bastion 22' \
    || fail "integrate cannot reach bastion:22"
  if docker inspect c10-ws-admin >/dev/null 2>&1; then
    if docker exec c10-ws-admin sh -c 'nc -z -w 2 bastion 22' 2>/dev/null; then
      fail "ws-admin can reach bastion:22"
    fi
  fi
  echo "  OK bastion integrate-only"
fi

echo "== Blue reachability OK =="
