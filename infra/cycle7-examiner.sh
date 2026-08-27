#!/usr/bin/env bash
# Cycle-7 — examiner dry-run stub for overlay plants (F2–F5).
#
# Expects:
#   docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle7.yml up -d --build
#
# Checks plant presence via docker exec (not a full interactive player path).
# F1 (LFI) is covered by product smoke / manual Bearer curl — see ground truth.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE=(docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.cycle7.yml")

EXPECTED_F2='OS{0362720305fcd3c72f09b034404b931e}'
EXPECTED_F3='OS{0060cf7cb47a5ed38b3248f0341b766a}'
EXPECTED_F4='OS{a82695d1063fad40ca2472b6dab29015}'
EXPECTED_F5='OS{a0cdd819aad20e6eec0fb56134fdb8f0}'

chmod +x \
  "${ROOT}/infra/assert-pg-unpublished.sh" \
  "${ROOT}/infra/assert-ssh-unpublished.sh" \
  "${ROOT}/infra/assert-cycle7-unpublished.sh" 2>/dev/null || true

"${ROOT}/infra/assert-pg-unpublished.sh"
"${ROOT}/infra/assert-ssh-unpublished.sh"
"${ROOT}/infra/assert-cycle7-unpublished.sh"

need_cid() {
  local svc="$1"
  local cid
  cid="$("${COMPOSE[@]}" ps -q "$svc")"
  if [[ -z "$cid" ]]; then
    echo "FAIL: ${svc} not running (start prod + docker-compose.cycle7.yml)" >&2
    exit 1
  fi
  echo "$cid"
}

echo "== services =="
ftp_cid="$(need_cid cycle7-ftp)"
bastion_cid="$(need_cid cycle7-bastion)"
cowrie_cid="$(need_cid cycle7-cowrie)"
jump_cid="$(need_cid cycle7-jump)"
echo "OK: ftp/bastion/cowrie/jump up"

echo "== F2 FTP loot =="
got="$(docker exec "$ftp_cid" cat /var/ftp/pub/loot.txt | tr -d '\r')"
if ! echo "$got" | grep -F "$EXPECTED_F2" >/dev/null; then
  echo "FAIL: F2 missing from loot.txt" >&2
  exit 1
fi
if ! echo "$got" | grep -F 'labpass' >/dev/null; then
  echo "FAIL: SSH password breadcrumb missing from loot.txt" >&2
  exit 1
fi
echo "OK: F2 + cred breadcrumb"

echo "== F3 user.txt =="
got="$(docker exec "$bastion_cid" cat /home/lab/user.txt | tr -d '\r\n')"
if [[ "$got" != "$EXPECTED_F3" ]]; then
  echo "FAIL: user.txt mismatch: got='$got'" >&2
  exit 1
fi
echo "OK: F3"

echo "== F4 root.txt + sudo find =="
got="$(docker exec "$bastion_cid" cat /root/root.txt | tr -d '\r\n')"
if [[ "$got" != "$EXPECTED_F4" ]]; then
  echo "FAIL: root.txt mismatch: got='$got'" >&2
  exit 1
fi
sudo_l="$(docker exec "$bastion_cid" su -s /bin/sh lab -c 'sudo -n -l' 2>/dev/null || true)"
if ! echo "$sudo_l" | grep -F '/usr/bin/find' >/dev/null; then
  echo "FAIL: lab lacks NOPASSWD /usr/bin/find" >&2
  exit 1
fi
echo "OK: F4 + sudo find"

echo "== F5 jump (from bastion, internal) =="
# Reach jump only via bastion→internal net (proves dual-home).
body="$(docker exec "$bastion_cid" curl -fsS -u 'nwops:Ops1ntranet' http://cycle7-jump:8080/)"
if ! echo "$body" | grep -F "$EXPECTED_F5" >/dev/null; then
  echo "FAIL: F5 missing from jump intranet" >&2
  exit 1
fi
# Jump must not be published on the host.
if docker port "$jump_cid" 2>/dev/null | grep -E '8080' >/dev/null; then
  echo "FAIL: cycle7-jump publishes a host port" >&2
  exit 1
fi
echo "OK: F5 via bastion→jump; jump unpublished"

echo "== Cowrie decoy listener =="
docker inspect -f '{{.State.Running}}' "$cowrie_cid" | grep -q true
echo "OK: cowrie running (decoy — not graded)"

echo "PASS: cycle-7 examiner dry-run (overlay plants)"
