#!/usr/bin/env bash
# Cycle-10 SoftDev B8 gate — graded seed material
#
# Proves: archive mailbox_exports LIVE, mail ops runbook, files JUMPBOX.
# Chains B4 (archive) then checks CORP plants.
# Usage: ./infra/cycle10-b8-smoke.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fail() { echo "FAIL: $*" >&2; exit 1; }

"${ROOT}/infra/cycle10-b4-smoke.sh"

docker exec c10-mail test -f /var/mail/northwind/ops/runbook-q4.txt \
  || fail "mail ops runbook missing"
docker exec c10-mail grep -q 'files.northwind.lab' /var/mail/northwind/ops/runbook-q4.txt \
  || fail "mail runbook missing Samba path"

docker exec c10-files test -f /shares/dept/integration/JUMPBOX.txt \
  || fail "files JUMPBOX missing"
docker exec c10-files grep -q 'Passw0rd' /shares/dept/integration/JUMPBOX.txt \
  || fail "files JUMPBOX missing integrate password"
docker exec c10-files grep -q 'integrator' /shares/dept/integration/JUMPBOX.txt \
  || fail "files JUMPBOX missing integrate user"

docker exec c10-db-archive psql -U archive -d northwind_archive -tAc \
  "SELECT COUNT(*) FROM mailbox_exports WHERE mailbox='ops@northwind.lab';" | grep -qE '^[2-9]' \
  || fail "expected ≥2 ops mailbox_exports rows"

echo "OK: B8 seeds — archive mail export + ops runbook + JUMPBOX"
