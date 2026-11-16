#!/usr/bin/env bash
# Cycle-10 Blue asserts (v2.10.0+): F01–F05 + Defense Ops + tip hygiene.
# Red plant prover remains cycle10-examiner.sh on ctf/v1.10.0 — do not use as Blue gate.
set -euo pipefail

BASE="${BASE_URL:-https://127.0.0.1/api}"
CURL_OPTS=(-sk)
BODY="$(mktemp /tmp/kc-c10-blue-XXXXXX.body)"
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
  curl "${CURL_OPTS[@]}" -o "$BODY" -w '%{http_code}' -X "$method" \
    -H "Authorization: Bearer ${TOKEN}" \
    "$@" "$url"
}

echo "== Cycle-10 Blue assert =="

echo "F01: public access-request must be pending (not moderator)..."
CODE=$(curl "${CURL_OPTS[@]}" -o "$BODY" -w '%{http_code}' -X POST "${BASE}/access-requests" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"blue-assert-$(date +%s)@example.com\",\"username\":\"blueassert\",\"password\":\"BlueAssert123!x\",\"reason\":\"blue\"}")
[[ "$CODE" == "201" || "$CODE" == "200" ]] || fail "access-requests HTTP $CODE: $(cat "$BODY")"
grep -qi 'moderator' "$BODY" && fail "access-requests returned moderator"
grep -qi 'pending' "$BODY" || fail "access-requests missing pending status: $(cat "$BODY")"
assert_no_os_flag "access-requests"
echo "  OK"

echo "Login employee..."
LOGIN=$(curl "${CURL_OPTS[@]}" -X POST "${BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@kc.test","password":"UserPass123!"}') \
  || fail "login failed"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$TOKEN" ]] || fail "no access token: $LOGIN"
echo "  OK"

echo "W06: plain user packets must be 403..."
CODE=$(auth_code GET "${BASE}/packets")
[[ "$CODE" == "403" ]] || fail "packets as user expected 403 got $CODE"
echo "  OK"

echo "D01: user audit-logs must be 403..."
CODE=$(auth_code GET "${BASE}/admin/audit-logs")
[[ "$CODE" == "403" ]] || fail "audit-logs as user expected 403 got $CODE"
echo "  OK"

echo "D02: user alerts must be 403..."
CODE=$(auth_code GET "${BASE}/admin/alerts")
[[ "$CODE" == "403" ]] || fail "alerts as user expected 403 got $CODE"
echo "  OK"

echo "Login admin..."
LOGIN=$(curl "${CURL_OPTS[@]}" -X POST "${BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@kc.test","password":"AdminPass123!"}') \
  || fail "admin login failed"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$TOKEN" ]] || fail "no admin token: $LOGIN"
echo "  OK"

echo "D01: admin audit-logs 200..."
CODE=$(auth_code GET "${BASE}/admin/audit-logs")
[[ "$CODE" == "200" ]] || fail "audit-logs as admin expected 200 got $CODE"
assert_no_os_flag "audit-logs"
echo "  OK"

echo "D02: admin alerts 200..."
CODE=$(auth_code GET "${BASE}/admin/alerts")
[[ "$CODE" == "200" ]] || fail "alerts as admin expected 200 got $CODE"
assert_no_os_flag "alerts"
echo "  OK"

echo "F01 admin: list access-requests 200..."
CODE=$(auth_code GET "${BASE}/admin/access-requests?status=pending")
[[ "$CODE" == "200" ]] || fail "admin access-requests expected 200 got $CODE"
echo "  OK"

if command -v docker >/dev/null 2>&1 && docker inspect c10-docproc >/dev/null 2>&1; then
  echo "F03: docproc non-root / no sudoers / no bastion.secret..."
  UID_NAME=$(docker exec c10-docproc id -un 2>/dev/null || true)
  [[ "$UID_NAME" == "docuser" || "$UID_NAME" == "1000" ]] || \
    [[ "$(docker exec c10-docproc id -u)" != "0" ]] || fail "docproc still root"
  docker exec c10-docproc test ! -f /etc/sudoers.d/docuser || fail "docproc sudoers present"
  docker exec c10-docproc test ! -f /root/bastion.secret || fail "bastion.secret still present"
  docker exec c10-docproc test ! -f /root/proof.txt || fail "proof.txt still present"
  echo "  OK"

  echo "F04: docproc must not be on net_data..."
  NETS=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' c10-docproc)
  echo "$NETS" | grep -q 'net_data' && fail "docproc still on net_data: $NETS"
  echo "  OK"
fi

if command -v docker >/dev/null 2>&1 && docker inspect c10-bastion >/dev/null 2>&1; then
  echo "F05: bastion no crown flag / no sudoers..."
  docker exec c10-bastion sh -c 'test ! -f /root/crown.txt || ! grep -qE "OS\{" /root/crown.txt' \
    || fail "bastion crown OS{ still present"
  docker exec c10-bastion test ! -f /etc/sudoers.d/nwadmin || fail "bastion sudoers present"
  echo "  OK"
fi

echo "W01: no staff-access HTML comment on edge index..."
if command -v docker >/dev/null 2>&1 && docker inspect c10-edge >/dev/null 2>&1; then
  docker exec c10-edge sh -c 'grep -q "staff-access" /usr/share/nginx/html/index.html' \
    && fail "edge index still contains staff-access gift" || true
fi
echo "  OK"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -x "${ROOT}/infra/assert-no-default-secrets.sh" ]]; then
  echo "Secrets dictionary..."
  REQUIRE_STRONG_SECRETS="${REQUIRE_STRONG_SECRETS:-1}" \
    "${ROOT}/infra/assert-no-default-secrets.sh" || fail "secrets assert"
fi

echo "== Cycle-10 Blue assert OK =="
