#!/usr/bin/env bash
# Generate RS256 JWT keypair for Nest (never commit the private key).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEYS="${ROOT}/keys"
mkdir -p "$KEYS"
openssl genrsa -out "${KEYS}/jwt-private.pem" 2048
openssl rsa -in "${KEYS}/jwt-private.pem" -pubout -out "${KEYS}/jwt-public.pem"
chmod 600 "${KEYS}/jwt-private.pem"
chmod 644 "${KEYS}/jwt-public.pem"
echo "Wrote ${KEYS}/jwt-private.pem and jwt-public.pem"
