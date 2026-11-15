#!/usr/bin/env bash
# Run helper as docuser; keep root for sudo PrivEsc path.
set -euo pipefail
chown -R docuser:docuser /opt/docproc/inbox
echo "[c10-docproc] starting helper as docuser on :9090"
exec su -s /bin/bash docuser -c "python3 /opt/docproc/bin/helper.py"
