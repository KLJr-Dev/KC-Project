#!/usr/bin/env bash
# Cycle-9 Blue asserts (v2.6.0+): onboarding IDOR / hop spoof / export PT / SIEM closed.
# Red plant prover remains cycle9-examiner.sh on ctf/v1.6.0 — do not use it as Blue gate.
set -euo pipefail

BASE="${BASE_URL:-http://localhost:8080/api}"
INTAKE_BASE="${INTAKE_BASE:-${BASE}/intake}"
BODY="$(mktemp /tmp/kc-c9-blue-XXXXXX.body)"
trap 'rm -f "$BODY"' EXIT

fail() { echo "FAIL: $1" >&2; exit 1; }

assert_no_os_flag() {
  local label="$1"
  if grep -qE 'OS\{[0-9a-fA-F]{32}\}' "$BODY"; then
    fail "${label}: graded OS{ flag leaked: $(head -c 200 "$BODY")"
  fi
}

auth_code() {
  local method="$1"
  local url="$2"
  shift 2
  curl -sS -o "$BODY" -w '%{http_code}' -X "$method" \
    -H "Authorization: Bearer ${TOKEN}" \
    "$@" "$url"
}

echo "== Cycle-9 Blue assert =="

echo "Login employee..."
LOGIN=$(curl -sS -X POST "${BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@kc.test","password":"UserPass123!"}') \
  || fail "login failed"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$TOKEN" ]] || fail "no access token: $LOGIN"
echo "  OK"

echo "F01: foreign onboarding GET must be 403..."
CODE=$(auth_code GET "${INTAKE_BASE}/onboarding-requests/9301") || true
[[ "$CODE" == "403" ]] || fail "expected 403 IDOR, got $CODE: $(cat "$BODY")"
assert_no_os_flag "F01"
echo "  OK"

echo "F02: client X-User-Role spoof must not approve..."
CODE=$(auth_code PUT "${INTAKE_BASE}/onboarding-requests/9302/status" \
  -H 'Content-Type: application/json' \
  -H 'X-User-Role: moderator' \
  -H 'X-User-Id: 9001' \
  -d '{"status":"approved"}') || true
[[ "$CODE" == "403" ]] || fail "expected 403 spoof, got $CODE: $(cat "$BODY")"
assert_no_os_flag "F02"
echo "  OK"

echo "F04: export traversal must not leave package dir..."
CODE=$(auth_code GET \
  "${INTAKE_BASE}/onboarding-requests/9303/export?file=../../private/onboarding-export.flag") || true
[[ "$CODE" == "403" || "$CODE" == "400" || "$CODE" == "404" ]] \
  || fail "expected 403/400/404 traversal, got $CODE: $(cat "$BODY")"
assert_no_os_flag "F04"
echo "  OK (${CODE})"

echo "F05: employee SIEM events must be 403..."
CODE=$(auth_code GET "${INTAKE_BASE}/security/events") || true
[[ "$CODE" == "403" ]] || fail "expected 403 SIEM, got $CODE: $(cat "$BODY")"
assert_no_os_flag "F05"
echo "  OK"

echo "F06: honeypot must be gone (404)..."
CODE=$(auth_code GET "${INTAKE_BASE}/v1/internal/debug") || true
[[ "$CODE" == "404" ]] || fail "expected 404 honeypot, got $CODE: $(cat "$BODY")"
echo "  OK"

echo "Login moderator for export happy path..."
MLOGIN=$(curl -sS -X POST "${BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"mod@kc.test","password":"ModPass123!"}') \
  || fail "mod login failed"
MTOKEN=$(echo "$MLOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$MTOKEN" ]] || fail "no mod token: $MLOGIN"

echo "Mod in-tree export must succeed..."
CODE=$(curl -sS -o "$BODY" -w '%{http_code}' \
  -H "Authorization: Bearer ${MTOKEN}" \
  "${INTAKE_BASE}/onboarding-requests/9303/export?file=package.json") || true
[[ "$CODE" == "200" ]] || fail "expected 200 mod export, got $CODE: $(cat "$BODY")"
assert_no_os_flag "mod export"
echo "  OK"

echo "Mod traversal still blocked..."
CODE=$(curl -sS -o "$BODY" -w '%{http_code}' \
  -H "Authorization: Bearer ${MTOKEN}" \
  "${INTAKE_BASE}/onboarding-requests/9303/export?file=../../private/onboarding-export.flag") || true
[[ "$CODE" == "400" || "$CODE" == "404" ]] \
  || fail "expected 400/404 mod traversal, got $CODE: $(cat "$BODY")"
assert_no_os_flag "mod traversal"
echo "  OK (${CODE})"

echo "Cycle-9 Blue assert passed."
