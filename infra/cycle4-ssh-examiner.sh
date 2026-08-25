#!/usr/bin/env bash
# Cycle-4 SoftDev — examiner dry-run for SSH foothold (F3).
#
# Expects overlay stack:
#   docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ssh.yml up -d --build
#
# Checks:
# - prod compose alone does not publish :2222
# - ssh service is up
# - lab home has user.txt = F3
# - notes.bak and /opt/kc-lab/README exist
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE=(docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.ssh.yml")
EXPECTED_F3='OS{f630d385015225088336b3558ddd7ab3}'

chmod +x "${ROOT}/infra/assert-ssh-unpublished.sh" "${ROOT}/infra/assert-pg-unpublished.sh" 2>/dev/null || true
"${ROOT}/infra/assert-pg-unpublished.sh"
"${ROOT}/infra/assert-ssh-unpublished.sh"

echo "== ssh service =="
"${COMPOSE[@]}" ps ssh >/dev/null
cid="$("${COMPOSE[@]}" ps -q ssh)"
if [[ -z "$cid" ]]; then
  echo "FAIL: ssh container not running (start with prod + ssh overlay)" >&2
  exit 1
fi

echo "== F3 user.txt =="
got="$(docker exec "$cid" cat /home/lab/user.txt | tr -d '\r\n')"
if [[ "$got" != "$EXPECTED_F3" ]]; then
  echo "FAIL: user.txt mismatch: got='$got' expected='$EXPECTED_F3'" >&2
  exit 1
fi
echo "OK: F3 present"

echo "== loot =="
docker exec "$cid" test -f /home/lab/notes.bak
docker exec "$cid" test -f /home/lab/.bash_history
docker exec "$cid" test -f /opt/kc-lab/README
echo "OK: bak + history + /opt/kc-lab/README"

echo "== password auth smoke (optional ssh client) =="
if command -v sshpass >/dev/null 2>&1 && command -v ssh >/dev/null 2>&1; then
  out="$(sshpass -p 'labpass' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    -p 2222 lab@127.0.0.1 'cat ~/user.txt' 2>/dev/null | tr -d '\r\n')"
  if [[ "$out" != "$EXPECTED_F3" ]]; then
    echo "FAIL: ssh login smoke got '$out'" >&2
    exit 1
  fi
  echo "OK: ssh password login on :2222"
else
  echo "SKIP: sshpass/ssh not installed — docker exec checks only"
fi

echo "PASS: cycle-4 SSH examiner dry-run"
