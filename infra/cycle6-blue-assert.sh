#!/usr/bin/env bash
# Cycle-6 Blue asserts (v2.3.0): SSRF prize blocked + bookmark CSRF required; no plants.
set -euo pipefail

BASE="${BASE_URL:-http://localhost:8080/api}"
F1='OS{764e3877d12346b2f82978063872b4fe}'
F2='OS{919efee8674b0ad10774bd5233c70d76}'
JAR="$(mktemp /tmp/kc-c6-blue-XXXXXX.jar)"
trap 'rm -f "$JAR"' EXIT

fail() { echo "FAIL: $1" >&2; exit 1; }

echo "== Cycle-6 Blue assert =="

echo "Login demo_user..."
LOGIN=$(curl -sS -c "$JAR" -b "$JAR" -X POST "${BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@kc.test","password":"UserPass123!"}') \
  || fail "login failed"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$TOKEN" ]] || fail "no access token: $LOGIN"
echo "  OK"

echo "SSRF to loopback prize must fail (expect 400)..."
CODE=$(curl -sS -o /tmp/kc-c6-blue-prev.body -w '%{http_code}' -X POST "${BASE}/preview" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{"url":"http://127.0.0.1:4000/internal/cycle6-flag"}') || true
[[ "$CODE" == "400" ]] || fail "expected 400 for loopback preview, got $CODE: $(cat /tmp/kc-c6-blue-prev.body)"
grep -q "$F1" /tmp/kc-c6-blue-prev.body && fail "F1 still present in preview response"
echo "  OK (blocked)"

echo "Internal prize route must be gone..."
ICODE=$(curl -sS -o /tmp/kc-c6-blue-int.body -w '%{http_code}' \
  "http://127.0.0.1:4000/internal/cycle6-flag" 2>/dev/null || echo "000")
# From host, Nest may not be published — treat connection fail as OK for publish posture.
# Via Preview already proves policy; if reachable, expect not 200 with F1.
if [[ "$ICODE" == "200" ]]; then
  grep -q "$F1" /tmp/kc-c6-blue-int.body && fail "F1 still served on /internal/cycle6-flag"
fi
echo "  OK (route absent or unpublished)"

echo "Bookmark save without CSRF must be 403..."
BCODE=$(curl -sS -o /tmp/kc-c6-blue-bm.body -w '%{http_code}' -c "$JAR" -b "$JAR" \
  -X POST "${BASE}/auth/bookmarks" \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com/c6-blue"}') || true
[[ "$BCODE" == "403" ]] || fail "expected 403 without CSRF, got $BCODE: $(cat /tmp/kc-c6-blue-bm.body)"
grep -q "$F2" /tmp/kc-c6-blue-bm.body && fail "F2 still present"
echo "  OK (403)"

echo "Bookmark save with CSRF succeeds without proof plant..."
OK=$(curl -sS -c "$JAR" -b "$JAR" -X POST "${BASE}/auth/bookmarks" \
  -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -d '{"url":"https://example.com/c6-blue-ok"}') \
  || fail "bookmark save with CSRF failed"
echo "$OK" | grep -q "$F2" && fail "F2 still in save response: $OK"
echo "$OK" | grep -q '"message"' || fail "unexpected save body: $OK"
echo "  OK"

echo "Cycle-6 Blue assert passed."
