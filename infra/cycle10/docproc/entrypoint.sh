#!/bin/bash
# Start document helper as the container user (non-root image).
set -euo pipefail
mkdir -p /opt/docproc/inbox
echo "[c10-docproc] starting helper on :9090"
exec python3 /opt/docproc/bin/helper.py
