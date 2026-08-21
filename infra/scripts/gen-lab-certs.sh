#!/usr/bin/env bash
# M7 / v2.0.0 — Generate lab TLS certificates for infra/certs/.
#
# Prefers mkcert (trusted local CA). Falls back to openssl self-signed if
# mkcert is not installed (tls-smoke.sh then uses --cacert / -k as needed).
#
# Output (gitignored PEMs):
#   infra/certs/localhost.pem
#   infra/certs/localhost-key.pem
#
# Security: enables HTTPS for CWE-319 gate; private keys must never be committed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CERT_DIR="${ROOT}/infra/certs"
CERT="${CERT_DIR}/localhost.pem"
KEY="${CERT_DIR}/localhost-key.pem"

mkdir -p "${CERT_DIR}"

if [[ -f "${CERT}" && -f "${KEY}" && "${1:-}" != "--force" ]]; then
  echo "Lab certs already exist at ${CERT_DIR} (pass --force to regenerate)."
  exit 0
fi

if command -v mkcert >/dev/null 2>&1; then
  echo "Generating lab certs with mkcert..."
  # Install local CA if needed (may prompt on first run).
  mkcert -install >/dev/null 2>&1 || true
  mkcert -cert-file "${CERT}" -key-file "${KEY}" localhost 127.0.0.1 ::1
  echo "Wrote ${CERT} and ${KEY} (mkcert)."
  exit 0
fi

echo "mkcert not found — generating openssl self-signed cert (lab only)..."
OPENSSL_BIN="$(command -v openssl)"
"${OPENSSL_BIN}" req -x509 -nodes -newkey rsa:2048 -days 825 \
  -keyout "${KEY}" \
  -out "${CERT}" \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:::1"

chmod 600 "${KEY}"
echo "Wrote ${CERT} and ${KEY} (openssl self-signed)."
echo "Note: browsers will warn until you trust this cert or install mkcert."
echo "      tls-smoke.sh verifies TLS with curl --cacert."
