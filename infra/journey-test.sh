#!/usr/bin/env bash
# v1.0.0 — Role journey smoke: demo user, moderator, admin
set -euo pipefail

BASE="${BASE_URL:-http://localhost:8080/api}"
APP="${APP_URL:-http://localhost:8080}"

login() {
  local email="$1" pass="$2"
  local body
  body=$(curl -sS -X POST "${BASE}/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"${email}\",\"password\":\"${pass}\"}")
  echo "$body" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
}

echo "Demo user login..."
USER_TOKEN=$(login 'user@kc.test' 'UserPass123!')
[[ -n "$USER_TOKEN" ]] || { echo "FAIL: user login"; exit 1; }
echo "  OK"

echo "Demo mod login..."
MOD_TOKEN=$(login 'mod@kc.test' 'ModPass123!')
[[ -n "$MOD_TOKEN" ]] || { echo "FAIL: mod login"; exit 1; }
echo "  OK"

echo "Demo admin login..."
ADMIN_TOKEN=$(login 'admin@kc.test' 'AdminPass123!')
[[ -n "$ADMIN_TOKEN" ]] || { echo "FAIL: admin login"; exit 1; }
echo "  OK"

echo "Admin stats..."
STATS=$(curl -sS -w "\n%{http_code}" -H "Authorization: Bearer ${ADMIN_TOKEN}" "${BASE}/admin/stats")
[[ $(echo "$STATS" | tail -1) == "200" ]] || { echo "FAIL: admin stats"; exit 1; }
echo "  OK"

DEMO_SHARE_TOKEN="${DEMO_SHARE_TOKEN:-c8f3a1e9b72d4f06a5e18c903d6b47e2f1a0c9d8b7e6f5a4938271605f4e3d2c}"

echo "Seeded public share (unguessable demo token API)..."
SHARE_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "${BASE}/sharing/public/${DEMO_SHARE_TOKEN}")
[[ "$SHARE_CODE" == "200" ]] || { echo "FAIL: demo public download (got ${SHARE_CODE})"; exit 1; }
echo "  OK"

echo "Legacy share-1 must not work..."
LEGACY_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "${BASE}/sharing/public/share-1")
[[ "$LEGACY_CODE" == "404" ]] || { echo "FAIL: share-1 should be 404 (got ${LEGACY_CODE})"; exit 1; }
echo "  OK"

echo "Frontend share landing page..."
curl -sf "${APP}/share/${DEMO_SHARE_TOKEN}" | grep -q 'Download' || { echo "FAIL: share landing page"; exit 1; }
echo "  OK"

echo "Moderator pending queue (API)..."
PENDING=$(curl -sS -H "Authorization: Bearer ${MOD_TOKEN}" "${BASE}/files")
echo "$PENDING" | grep -q 'pending-doc' || { echo "FAIL: seeded pending file missing"; exit 1; }
echo "  OK"

echo "Admin system-wide files (API)..."
FILE_COUNT=$(curl -sS -H "Authorization: Bearer ${ADMIN_TOKEN}" "${BASE}/files" | grep -o '"id"' | wc -l | tr -d ' ')
[[ "$FILE_COUNT" -ge 4 ]] || { echo "FAIL: expected >= 4 seeded files (got ${FILE_COUNT})"; exit 1; }
echo "  OK (${FILE_COUNT} files)"

echo "User files scoped to owner (no IDOR)..."
USER_FILES=$(curl -sS -H "Authorization: Bearer ${USER_TOKEN}" "${BASE}/files")
echo "$USER_FILES" | grep -q 'other-user-secret' && { echo "FAIL: IDOR — other user file visible to user"; exit 1; }
echo "$USER_FILES" | grep -q 'welcome' || { echo "FAIL: user should see own welcome file"; exit 1; }
IDOR_CODE=$(curl -sS -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${USER_TOKEN}" "${BASE}/files/9104")
[[ "$IDOR_CODE" == "403" ]] || { echo "FAIL: expected 403 on other-user file (got ${IDOR_CODE})"; exit 1; }
echo "  OK (list scoped; cross-user get denied)"

echo "Journey test passed (3 roles + demo seed + share landing + ownership)."
