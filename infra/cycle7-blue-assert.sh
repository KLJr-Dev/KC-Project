#!/usr/bin/env bash
# Cycle-7 Blue asserts (v2.4.0): Ops Documents path confined; no F1 plant.
set -euo pipefail

BASE="${BASE_URL:-http://localhost:8080/api}"
F1='OS{777731571165c37aa74d5385406abb51}'
BODY="$(mktemp /tmp/kc-c7-blue-XXXXXX.body)"
trap 'rm -f "$BODY"' EXIT

fail() { echo "FAIL: $1" >&2; exit 1; }

echo "== Cycle-7 Blue assert =="

echo "Login demo_user..."
LOGIN=$(curl -sS -X POST "${BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@kc.test","password":"UserPass123!"}') \
  || fail "login failed"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$TOKEN" ]] || fail "no access token: $LOGIN"
echo "  OK"

echo "Handbook under library root must succeed..."
HCODE=$(curl -sS -o "$BODY" -w '%{http_code}' \
  -H "Authorization: Bearer ${TOKEN}" \
  "${BASE}/ops/documents?path=handbook.txt") || true
[[ "$HCODE" == "200" ]] || fail "expected 200 for handbook.txt, got $HCODE: $(cat "$BODY")"
grep -q 'Northwind Ops' "$BODY" || fail "handbook content missing: $(cat "$BODY")"
grep -q "$F1" "$BODY" && fail "F1 leaked in handbook response"
echo "  OK"

echo "Traversal to plant path must be rejected..."
TCODE=$(curl -sS -o "$BODY" -w '%{http_code}' \
  -H "Authorization: Bearer ${TOKEN}" \
  --get --data-urlencode 'path=../plants/cycle7-f1.txt' \
  "${BASE}/ops/documents") || true
[[ "$TCODE" == "400" || "$TCODE" == "404" ]] \
  || fail "expected 400/404 for ../plants traversal, got $TCODE: $(cat "$BODY")"
grep -q "$F1" "$BODY" && fail "F1 still present in traversal response"
echo "  OK (blocked)"

echo "Dot-dot escape must be rejected..."
DCODE=$(curl -sS -o "$BODY" -w '%{http_code}' \
  -H "Authorization: Bearer ${TOKEN}" \
  --get --data-urlencode 'path=../../etc/passwd' \
  "${BASE}/ops/documents") || true
[[ "$DCODE" == "400" || "$DCODE" == "404" ]] \
  || fail "expected 400/404 for ../../etc/passwd, got $DCODE: $(cat "$BODY")"
grep -qi 'root:' "$BODY" && fail "passwd contents leaked"
echo "  OK (blocked)"

echo "Cycle-7 Blue assert passed."
