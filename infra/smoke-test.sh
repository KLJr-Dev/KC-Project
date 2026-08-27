#!/usr/bin/env bash
# v1.0.0 — Smoke test: health → register → upload → list files
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# C2-F03 — secure prod compose must keep Postgres off the host
"${ROOT}/infra/assert-pg-unpublished.sh"
# C4-F03 — secure prod compose must not publish SSH (overlay-only)
"${ROOT}/infra/assert-ssh-unpublished.sh"

BASE="${BASE_URL:-http://localhost:8080/api}"
EMAIL="smoke-$(date +%s)@test.com"
USERNAME="smoke$(date +%s | tail -c 8)"
TMPFILE="$(mktemp /tmp/kc-smoke-XXXXXX.txt)"
echo "smoke-test-$(date +%s)" > "$TMPFILE"
trap 'rm -f "$TMPFILE"' EXIT

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

echo "Health check → ${BASE}/health"
HEALTH=""
HTTP_CODE=""
BODY=""
for i in $(seq 1 30); do
  HEALTH=$(curl -sS -w "\n%{http_code}" "${BASE}/health" 2>&1) || true
  HTTP_CODE=$(echo "$HEALTH" | tail -1)
  BODY=$(echo "$HEALTH" | sed '$d')
  if [[ "$HTTP_CODE" == "200" ]] && echo "$BODY" | grep -q '"status":"ok"'; then
    break
  fi
  sleep 1
done
if [[ "$HTTP_CODE" != "200" ]]; then
  echo "Response ($HTTP_CODE): $BODY" >&2
  fail "health check returned $HTTP_CODE (backend likely down — check: docker compose -f infra/docker-compose.prod.yml logs backend)"
fi
echo "$BODY" | grep -q '"status":"ok"' || fail "unexpected health body: $BODY"
echo "  OK"

echo "Register..."
REG=$(curl -sS -X POST "${BASE}/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${EMAIL}\",\"username\":\"${USERNAME}\",\"password\":\"Password123!\"}") \
  || fail "register request failed"
TOKEN=$(echo "$REG" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$TOKEN" ]] || fail "no token in response: $REG"
echo "  OK"

echo "Upload file → POST /files"
UPLOAD=$(curl -sS -w "\n%{http_code}" -X POST "${BASE}/files" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@${TMPFILE}" 2>&1) || fail "upload request failed"
UP_HTTP=$(echo "$UPLOAD" | tail -1)
UP_BODY=$(echo "$UPLOAD" | sed '$d')
if [[ "$UP_HTTP" != "201" && "$UP_HTTP" != "200" ]]; then
  echo "Response ($UP_HTTP): $UP_BODY" >&2
  fail "upload returned $UP_HTTP"
fi
FILE_ID=$(echo "$UP_BODY" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
[[ -n "$FILE_ID" ]] || fail "no file id in upload response: $UP_BODY"
echo "  OK (file id=${FILE_ID})"

echo "List files → GET /files"
LIST=$(curl -sS -w "\n%{http_code}" -H "Authorization: Bearer ${TOKEN}" "${BASE}/files" 2>&1) \
  || fail "list files request failed"
LIST_HTTP=$(echo "$LIST" | tail -1)
LIST_BODY=$(echo "$LIST" | sed '$d')
if [[ "$LIST_HTTP" != "200" ]]; then
  echo "Response ($LIST_HTTP): $LIST_BODY" >&2
  fail "list files returned $LIST_HTTP"
fi
echo "$LIST_BODY" | grep -q '"items"' || fail "expected paginated items in response: $LIST_BODY"
echo "$LIST_BODY" | grep -q '"total"' || fail "expected total in paginated response: $LIST_BODY"
echo "  OK"

echo "Demo user login..."
DEMO=$(curl -sS -X POST "${BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@kc.test","password":"UserPass123!"}') \
  || fail "demo user login failed"
echo "$DEMO" | grep -q '"token"' || fail "demo user missing token (run migrations / seed?)"
echo "  OK"

# Cycle-6 Blue — SSRF destination policy + bookmark CSRF (v2.3.0)
"${ROOT}/infra/cycle6-blue-assert.sh"

# Cycle-7 Blue — Ops Documents path confinement (v2.4.0)
"${ROOT}/infra/cycle7-blue-assert.sh"
"${ROOT}/infra/assert-cycle7-unpublished.sh"

echo "Smoke test passed."
