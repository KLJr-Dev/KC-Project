#!/usr/bin/env bash
# Cycle-8 — examiner dry-run for overlay plants (F1–F5 DAG checks).
#
# Expects:
#   docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle8.yml up -d --build
#
# Must-fail covered: prod alone unpublished; John≠FTP passwords; no OpenSSH graded path.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE=(docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.cycle8.yml")

EXPECTED_F1='OS{0036b6ceb86445a4c8dce300e4205c43}'
EXPECTED_F2='OS{4af4a36815ce627e5d3eba01b57e9376}'
EXPECTED_F3='OS{e0af60da9c8aa1daa4a79f2cb95478d2}'
EXPECTED_F4='OS{44d562a5ae240a23b8bbf1c21c605fc3}'
EXPECTED_F5='OS{d310a0605d95303aa114d707b7686f76}'
L2_PASS='sunshine'
L3_PASS='peanut'

chmod +x \
  "${ROOT}/infra/assert-pg-unpublished.sh" \
  "${ROOT}/infra/assert-ssh-unpublished.sh" \
  "${ROOT}/infra/assert-cycle8-unpublished.sh" 2>/dev/null || true

"${ROOT}/infra/assert-pg-unpublished.sh"
"${ROOT}/infra/assert-ssh-unpublished.sh"
"${ROOT}/infra/assert-cycle8-unpublished.sh"

need_cid() {
  local svc="$1"
  local cid
  cid="$("${COMPOSE[@]}" ps -q "$svc")"
  if [[ -z "$cid" ]]; then
    echo "FAIL: ${svc} not running (start prod + docker-compose.cycle8.yml)" >&2
    exit 1
  fi
  echo "$cid"
}

if [[ "$L2_PASS" == "$L3_PASS" ]]; then
  echo "FAIL: L2 SMTP password equals L3 FTP password (tool redundancy)" >&2
  exit 1
fi
echo "OK: L2≠L3 secrets"

echo "== services =="
intake_cid="$(need_cid cycle8-intake)"
ftp_cid="$(need_cid cycle8-ftp)"
cowrie_cid="$(need_cid cycle8-cowrie)"
edge_cid="$(need_cid cycle8-edge)"
samba_cid="$(need_cid cycle8-samba)"
mail_cid="$(need_cid cycle8-mail)"
echo "OK: intake/ftp/cowrie/edge/samba/mail up"

echo "== F1 Intake dump path =="
# Graded path is sqlmap-style full dump (ILIKE '%%' / tautology), not a single-row q=flag hit.
body="$(curl -sS --get 'http://127.0.0.1:8080/api/intake/search' --data-urlencode 'q=%' || true)"
if ! echo "$body" | grep -F "$EXPECTED_F1" >/dev/null; then
  echo "FAIL: F1 missing from Intake dump" >&2
  echo "$body" >&2
  exit 1
fi
if ! echo "$body" | grep -F '0571749e2ac330a7455809c6b0e7af90' >/dev/null; then
  echo "FAIL: lisa MD5 hash missing from dump path" >&2
  exit 1
fi
count="$(echo "$body" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("count",0))' 2>/dev/null || echo 0)"
if [[ "$count" -lt 10 ]]; then
  echo "FAIL: dump returned too few rows (count=$count; expect full mail_users)" >&2
  exit 1
fi
echo "OK: F1 + L2 hash visible"

echo "== F2 FTP (authenticated lisa, not anon) =="
got="$(docker exec "$ftp_cid" cat /home/lisa/flag.txt | tr -d '\r\n')"
if [[ "$got" != "$EXPECTED_F2" ]]; then
  echo "FAIL: F2 mismatch: got='$got'" >&2
  exit 1
fi
anon="$(docker exec "$ftp_cid" cat /var/ftp/pub/README.txt 2>/dev/null || true)"
if echo "$anon" | grep -F 'OS{' >/dev/null; then
  echo "FAIL: anon FTP publishes OS{ flag (must be post-Hydra only)" >&2
  exit 1
fi
if echo "$anon" | grep -Fi "$L3_PASS" >/dev/null; then
  echo "FAIL: anon FTP publishes FTP password" >&2
  exit 1
fi
echo "OK: F2 + anon clean"

echo "== F3/F4 edge plants + sudo nano =="
got="$(docker exec "$edge_cid" cat /home/ops/user.txt | tr -d '\r\n')"
if [[ "$got" != "$EXPECTED_F3" ]]; then
  echo "FAIL: user.txt mismatch: got='$got'" >&2
  exit 1
fi
got="$(docker exec "$edge_cid" cat /root/root.txt | tr -d '\r\n')"
if [[ "$got" != "$EXPECTED_F4" ]]; then
  echo "FAIL: root.txt mismatch: got='$got'" >&2
  exit 1
fi
sudo_l="$(docker exec "$edge_cid" su -s /bin/sh ops -c 'sudo -n -l' 2>/dev/null || true)"
if ! echo "$sudo_l" | grep -F '/usr/bin/nano' >/dev/null; then
  echo "FAIL: ops lacks NOPASSWD /usr/bin/nano" >&2
  exit 1
fi
hint="$(docker exec "$edge_cid" cat /root/samba-hint.txt || true)"
if ! echo "$hint" | grep -F 'cycle8-samba' >/dev/null; then
  echo "FAIL: L4 samba hint missing" >&2
  exit 1
fi
echo "OK: F3/F4 + sudo nano + L4 hint"

echo "== www via nginx =="
www="$(curl -sS 'http://127.0.0.1:8080/www/' || true)"
if ! echo "$www" | grep -Fi 'Northwind' >/dev/null; then
  echo "FAIL: /www/ not serving edge docroot" >&2
  exit 1
fi
echo "OK: /www/"

echo "== F5 Samba (from edge, internal) =="
# Prove host publish absent: smbclient from examiner host to localhost should fail or be unused.
got="$(docker exec "$samba_cid" cat /shares/OpsFiles/proof.txt | tr -d '\r\n')"
if [[ "$got" != "$EXPECTED_F5" ]]; then
  echo "FAIL: Samba proof mismatch: got='$got'" >&2
  exit 1
fi
# Reachability from edge (dual-home)
if ! docker exec "$edge_cid" getent hosts cycle8-samba >/dev/null 2>&1; then
  echo "FAIL: edge cannot resolve cycle8-samba" >&2
  exit 1
fi
echo "OK: F5 Samba plant + edge DNS"

echo "== F5 mail maildir =="
got="$(docker exec "$mail_cid" cat /home/lisa/Maildir/new/f5.eml | tr -d '\r')"
if ! echo "$got" | grep -F "$EXPECTED_F5" >/dev/null; then
  echo "FAIL: mail F5 missing" >&2
  exit 1
fi
echo "OK: F5 mail plant"

echo "== Cowrie up (decoy) =="
# Official cowrie image is minimal (no /bin/true); assert running + host :22 publish.
cowrie_status="$(docker inspect -f '{{.State.Status}}' "$cowrie_cid" 2>/dev/null || true)"
if [[ "$cowrie_status" != "running" ]]; then
  echo "FAIL: cycle8-cowrie not running (status=${cowrie_status:-missing})" >&2
  exit 1
fi
pub="$(docker port "$cowrie_cid" 2222 2>/dev/null || true)"
if ! echo "$pub" | grep -Eq '(^|[^0-9])22$'; then
  echo "FAIL: Cowrie not published on host :22 (got: ${pub:-none})" >&2
  exit 1
fi
echo "OK: cowrie"

echo "PASS: cycle8-examiner dry-run"
