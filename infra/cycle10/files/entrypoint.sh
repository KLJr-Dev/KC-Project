#!/usr/bin/env bash
set -euo pipefail
mkdir -p /var/log/samba /var/lib/samba/private /var/run/samba
exec smbd -F --no-process-group --debug-stdout -d 1
