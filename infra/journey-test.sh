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

echo "Seeded public share (share-1 API)..."
SHARE_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "${BASE}/sharing/public/share-1")
[[ "$SHARE_CODE" == "200" ]] || { echo "FAIL: share-1 public download (got ${SHARE_CODE})"; exit 1; }
echo "  OK"

echo "Frontend share landing page (/share/share-1)..."
curl -sf "${APP}/share/share-1" | grep -q 'Download' || { echo "FAIL: share landing page"; exit 1; }
echo "  OK"

echo "Moderator pending queue (API)..."
PENDING=$(curl -sS -H "Authorization: Bearer ${MOD_TOKEN}" "${BASE}/files")
echo "$PENDING" | grep -q 'pending-doc' || { echo "FAIL: seeded pending file missing"; exit 1; }
echo "  OK"

echo "Admin system-wide files (API)..."
FILE_COUNT=$(curl -sS -H "Authorization: Bearer ${ADMIN_TOKEN}" "${BASE}/files" | grep -o '"id"' | wc -l | tr -d ' ')
[[ "$FILE_COUNT" -ge 4 ]] || { echo "FAIL: expected >= 4 seeded files (got ${FILE_COUNT})"; exit 1; }
echo "  OK (${FILE_COUNT} files)"

echo "User files scoped in API (IDOR still returns all)..."
ALL_FILES=$(curl -sS -H "Authorization: Bearer ${USER_TOKEN}" "${BASE}/files")
echo "$ALL_FILES" | grep -q 'other-user-secret' || { echo "FAIL: IDOR baseline — other user file missing from API"; exit 1; }
echo "  OK (API returns all files — product UI filters client-side)"

echo "Journey test passed (3 roles + demo seed + share landing)."
