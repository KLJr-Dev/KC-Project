#!/bin/bash
# KC Ops — nightly inventory / backup helper (lab host).
# Scheduled via sudo for elevated archive access.
# INTENTIONAL CTF plant: file is lab-writable while listed in sudoers (Cycle-5 PrivEsc).
set -euo pipefail

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="/var/tmp/kc-backup-${STAMP}.tgz"

echo "[kc-ops] backup start ${STAMP}"
tar -czf "${DEST}" /var/opt/kc /opt/kc-ops 2>/dev/null || true
echo "[kc-ops] wrote ${DEST}"
echo "[kc-ops] backup done"
