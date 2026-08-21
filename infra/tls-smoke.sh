#!/usr/bin/env bash
# M7 / v2.0.0 — TLS smoke gate (required before tag).
#
# Prereq:
#   ./infra/scripts/gen-lab-certs.sh
#   docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.tls.yml up -d --build
#
# Checks:
#   1) https://127.0.0.1:8443/api/health → 200 + status ok
#   2) HTTP :8080 redirects to HTTPS :8443
#   3) Strict-Transport-Security present on HTTPS response
#   4) Register over HTTPS sets Secure refresh cookie
#
# Security: proves CWE-319 transport + Secure cookie posture for the TLS profile.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BASE_HTTPS="${BASE_URL:-https://127.0.0.1:8443/api}"
BASE_HTTP="${HTTP_BASE_URL:-http://127.0.0.1:8080}"
CERT="${ROOT}/certs/localhost.pem"

CURL_TLS=(curl -sS --connect-timeout 5 --max-time 30)
if [[ -f "${CERT}" ]]; then
  CURL_TLS+=(--cacert "${CERT}")
else
  echo "WARN: ${CERT} missing — using curl -k (run ./infra/scripts/gen-lab-certs.sh)" >&2
  CURL_TLS+=(-k)
fi

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

echo "TLS health → ${BASE_HTTPS}/health"
HEALTH=""
HTTP_CODE=""
BODY=""
for i in $(seq 1 40); do
  HEALTH=$("${CURL_TLS[@]}" -w "\n%{http_code}" "${BASE_HTTPS}/health" 2>&1) || true
  HTTP_CODE=$(echo "${HEALTH}" | tail -1)
  BODY=$(echo "${HEALTH}" | sed '$d')
  if [[ "${HTTP_CODE}" == "200" ]] && echo "${BODY}" | grep -q '"status":"ok"'; then
    break
  fi
  sleep 1
done
[[ "${HTTP_CODE}" == "200" ]] || fail "TLS health returned ${HTTP_CODE}: ${BODY}"
echo "${BODY}" | grep -q '"status":"ok"' || fail "unexpected health body: ${BODY}"
echo "  OK"

echo "HSTS header on HTTPS..."
HDRS=$("${CURL_TLS[@]}" -D - -o /dev/null "${BASE_HTTPS}/health")
echo "${HDRS}" | grep -qi '^strict-transport-security:' || fail "missing Strict-Transport-Security"
echo "  OK"

echo "HTTP → HTTPS redirect (${BASE_HTTP}/api/health)..."
LOC=$(curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' "${BASE_HTTP}/api/health" || true)
CODE=$(echo "${LOC}" | awk '{print $1}')
URL=$(echo "${LOC}" | cut -d' ' -f2-)
[[ "${CODE}" == "301" || "${CODE}" == "302" ]] || fail "expected redirect, got ${CODE}"
echo "${URL}" | grep -q 'https://' || fail "redirect target not HTTPS: ${URL}"
echo "${URL}" | grep -q ':8443' || fail "redirect target missing :8443: ${URL}"
echo "  OK (${CODE} → ${URL})"

EMAIL="tls-smoke-$(date +%s)@test.com"
USER="tls$(date +%s | tail -c 6)"
CJ="$(mktemp /tmp/kc-tls-cj-XXXXXX)"
HDRF="$(mktemp /tmp/kc-tls-hdrs-XXXXXX)"
trap 'rm -f "${CJ}" "${HDRF}"' EXIT

echo "Register over HTTPS (Secure cookie)..."
REG=$("${CURL_TLS[@]}" -c "${CJ}" -b "${CJ}" -D "${HDRF}" -X POST "${BASE_HTTPS}/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${EMAIL}\",\"username\":\"${USER}\",\"password\":\"Password123!\"}")
echo "${REG}" | grep -q '"token"' || fail "register missing access token: ${REG}"
if echo "${REG}" | grep -q '"refreshToken"'; then
  fail "refreshToken must not appear in JSON body"
fi
grep -i 'set-cookie:' "${HDRF}" | grep -i 'kc_refresh' | grep -qi 'secure' || fail "kc_refresh missing Secure flag"
grep -i 'set-cookie:' "${HDRF}" | grep -i 'kc_refresh' | grep -qi 'httponly' || fail "kc_refresh missing HttpOnly"
echo "  OK"

echo "TLS smoke passed."
