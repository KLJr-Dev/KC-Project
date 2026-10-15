#!/usr/bin/env bash
# Cycle-9 Wave B — reject known-weak compose/.env defaults in secure gate profile.
# Lab day-to-day may keep example defaults (residual). Set REQUIRE_STRONG_SECRETS=1 to fail.
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

found=0
scan_file() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  local w
  for w in "${WEAK[@]}"; do
    if grep -qF "$w" "$f"; then
      echo "WARN: weak default '${w}' present in ${f}" >&2
      found=1
    fi
  done
}

echo "== assert-no-default-secrets =="
scan_file "$ENV_FILE"
scan_file "${ROOT}/infra/.env.example"

if [[ "$found" -eq 1 ]]; then
  if [[ "$REQUIRE" == "1" ]]; then
    echo "FAIL: REQUIRE_STRONG_SECRETS=1 and weak defaults found" >&2
    exit 1
  fi
  echo "OK (warn-only; set REQUIRE_STRONG_SECRETS=1 for gate fail)"
  exit 0
fi

echo "OK (no known weak defaults in scanned files)"
