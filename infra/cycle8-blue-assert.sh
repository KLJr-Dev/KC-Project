#!/usr/bin/env bash
# Cycle-8 Blue asserts (v2.5.0+): Intake parameterized via Nest BFF; no graded flags in search.
# Cycle-9: no HTTP /health — liveness is login + authed search. C9 graded flags live on
# onboarding/SIEM routes (see cycle9-examiner.sh); search/wildcard must stay clean here.
set -euo pipefail

BASE="${BASE_URL:-http://localhost:8080/api}"
INTAKE_BASE="${INTAKE_BASE:-${BASE}/intake}"
# Frozen Red flags — must not appear on hardened tip (archive: ctf/v1.5.0).
C8_FLAGS=(
  'OS{0036b6ceb86445a4c8dce300e4205c43}'
  'OS{4af4a36815ce627e5d3eba01b57e9376}'
  'OS{e0af60da9c8aa1daa4a79f2cb95478d2}'
  'OS{44d562a5ae240a23b8bbf1c21c605fc3}'
  'OS{d310a0605d95303aa114d707b7686f76}'
)
BODY="$(mktemp /tmp/kc-c8-blue-XXXXXX.body)"
trap 'rm -f "$BODY"' EXIT

fail() { echo "FAIL: $1" >&2; exit 1; }

assert_no_flags_or_hash() {
  local label="$1"
  local content="$2"
  grep -q password_hash <<<"$content" && fail "${label}: password_hash leaked"
  for flag in "${C8_FLAGS[@]}"; do
    grep -qF "$flag" <<<"$content" && fail "${label}: graded flag leaked ($flag)"
  done
  if grep -qF 'OS{' <<<"$content"; then
    fail "${label}: unexpected OS{ token in response"
  fi
}

auth_get() {
  local url="$1"
  shift
  curl -sS -o "$BODY" -w '%{http_code}' \
    -H "Authorization: Bearer ${TOKEN}" \
    "$@" "$url"
}

echo "== Cycle-8 Blue assert =="

echo "Login demo_user (BFF gate)..."
LOGIN=$(curl -sS -X POST "${BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@kc.test","password":"UserPass123!"}') \
  || fail "login failed"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$TOKEN" ]] || fail "no access token: $LOGIN"
echo "  OK"

echo "GET /api/intake/health must be gone..."
HCODE=$(curl -sS -o "$BODY" -w '%{http_code}' "${INTAKE_BASE}/health") || true
[[ "$HCODE" == "404" ]] || fail "expected 404 for intake /health, got $HCODE: $(cat "$BODY")"
echo "  OK"

echo "Legitimate search (lisa) must succeed without sensitive fields..."
SCODE=$(auth_get "${INTAKE_BASE}/search" --get --data-urlencode 'q=lisa') || true
[[ "$SCODE" == "200" ]] || fail "expected 200 for lisa search, got $SCODE: $(cat "$BODY")"
grep -q '"username":"lisa"' "$BODY" || fail "lisa row missing: $(cat "$BODY")"
assert_no_flags_or_hash "lisa search" "$(cat "$BODY")"
echo "  OK"

echo "SQLi-style probes must not dump flags or hashes..."
for payload in "%" "%25" "' OR '1'='1" "x' UNION SELECT null,null,null,null--"; do
  PCODE=$(auth_get "${INTAKE_BASE}/search" --get --data-urlencode "q=${payload}") || true
  [[ "$PCODE" == "200" || "$PCODE" == "400" || "$PCODE" == "500" ]] \
    || fail "unexpected HTTP $PCODE for payload=${payload}: $(cat "$BODY")"
  assert_no_flags_or_hash "payload=${payload}" "$(cat "$BODY")"
  grep -q '"sql"' "$BODY" && fail "SQL error body leaked for payload=${payload}"
done
echo "  OK (no leak)"

echo "Wildcard search must be bounded (<=50 rows)..."
WCODE=$(auth_get "${INTAKE_BASE}/search" --get --data-urlencode 'q=%') || true
[[ "$WCODE" == "200" ]] || fail "expected 200 for wildcard search, got $WCODE: $(cat "$BODY")"
COUNT=$(sed -n 's/.*"count":\([0-9]*\).*/\1/p' "$BODY" | head -1)
[[ -n "$COUNT" && "$COUNT" -le 50 ]] || fail "expected count <= 50, got: $(cat "$BODY")"
assert_no_flags_or_hash "wildcard search" "$(cat "$BODY")"
echo "  OK (count=${COUNT})"

echo "Removed decoy service-accounts endpoint must not return creds..."
DCODE=$(auth_get "${INTAKE_BASE}/admin/service-accounts") || true
# Unmapped BFF path → Nest 404; unauthed would be 401 — we always send Bearer.
[[ "$DCODE" == "404" || "$DCODE" == "405" ]] \
  || fail "expected 404/405 for decoy service-accounts, got $DCODE: $(cat "$BODY")"
echo "  OK (${DCODE})"

echo "Cycle-8 Blue assert passed."
