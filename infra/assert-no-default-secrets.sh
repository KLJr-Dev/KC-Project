#!/usr/bin/env bash
# Reject Cycle-10 plant dictionary on tip always.
# Product .env weak defaults: warn, or fail when REQUIRE_STRONG_SECRETS=1.
# .env.example is always warn-only (documented placeholders).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ENV_FILE:-${ROOT}/infra/.env}"
REQUIRE="${REQUIRE_STRONG_SECRETS:-0}"

WEAK=(
  'kc-change-me-prod'
  'kc-app-change-me'
  'kc-intake-app-change-me'
  'change-me-to-a-long-random-secret'
)

PLANT_GREP=(
  'Welcome1'
  'Summer2024'
  'Passw0rd'
  'OS{c10'
  'CYCLE10-PLANT'
  "echo 'vendor:vendor'"
  "echo 'warehouse:shipit'"
  "printf '%s\\n%s\\n' 'password' 'password'"
  'POSTGRES_PASSWORD=postgres'
  'POSTGRES_PASSWORD: postgres'
)

env_found=0
plant_found=0

scan_env() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  local w
  for w in "${WEAK[@]}"; do
    if grep -qF "$w" "$f"; then
      echo "WARN: weak default '${w}' present in ${f}" >&2
      env_found=1
    fi
  done
}

scan_tree() {
  local dir="$1"
  [[ -d "$dir" ]] || return 0
  local p
  for p in "${PLANT_GREP[@]}"; do
    if grep -R --include='Dockerfile' --include='*.yml' --include='*.sql' --include='*.txt' --include='*.eml' --include='*.sh' --include='*.py' -l -- "$p" "$dir" 2>/dev/null | head -5 | grep -q .; then
      echo "FAIL: plant/weak pattern '${p}' under ${dir}" >&2
      plant_found=1
    fi
  done
}

echo "== assert-no-default-secrets =="
scan_env "$ENV_FILE"
scan_env "${ROOT}/infra/.env.example"
scan_tree "${ROOT}/infra/cycle10"

if [[ "$plant_found" -eq 1 ]]; then
  echo "FAIL: Cycle-10 tip still contains plant/weak secrets" >&2
  exit 1
fi

if [[ "$env_found" -eq 1 ]]; then
  if [[ "$REQUIRE" == "1" ]]; then
    echo "FAIL: REQUIRE_STRONG_SECRETS=1 and weak product defaults in .env" >&2
    exit 1
  fi
  echo "OK (tip plant-clean; product .env warn-only — set REQUIRE_STRONG_SECRETS=1 for env gate)"
  exit 0
fi

echo "OK (no known weak defaults in scanned files)"
