#!/bin/bash
# KC Ops — cleanup stale backup tarballs (root cron).
set -euo pipefail
find /var/tmp -maxdepth 1 -name 'kc-backup-*.tgz' -mtime +7 -delete 2>/dev/null || true
echo "[kc-ops] cleanup ok"
