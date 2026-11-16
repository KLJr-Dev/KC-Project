#!/usr/bin/env bash
# Lab CA + Postgres server cert for dbnet TLS (showcase).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/certs/db"
mkdir -p "$OUT"
openssl req -x509 -newkey rsa:2048 -nodes -days 825 \
  -keyout "${OUT}/ca.key" -out "${OUT}/ca.crt" \
  -subj "/CN=Northwind Lab DB CA"
openssl req -newkey rsa:2048 -nodes \
  -keyout "${OUT}/server.key" -out "${OUT}/server.csr" \
  -subj "/CN=postgres"
openssl x509 -req -in "${OUT}/server.csr" -CA "${OUT}/ca.crt" -CAkey "${OUT}/ca.key" \
  -CAcreateserial -out "${OUT}/server.crt" -days 825
chmod 600 "${OUT}/ca.key" "${OUT}/server.key"
rm -f "${OUT}/server.csr"
echo "Wrote DB TLS material under ${OUT}"
