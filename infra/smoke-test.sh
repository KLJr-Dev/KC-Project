#!/usr/bin/env bash
# v0.7.3 — Smoke test against compose stack on localhost:8080
set -euo pipefail

BASE="${BASE_URL:-http://localhost:8080/api}"
EMAIL="smoke-$(date +%s)@test.com"

echo "Health check..."
curl -sf "${BASE}/health" | grep -q '"status":"ok"'

echo "Register..."
REG=$(curl -sf -X POST "${BASE}/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${EMAIL}\",\"username\":\"smokeuser\",\"password\":\"pass\"}")
TOKEN=$(echo "$REG" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
test -n "$TOKEN"

echo "Smoke test passed."
