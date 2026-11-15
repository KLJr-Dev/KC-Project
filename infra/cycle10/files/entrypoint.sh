#!/usr/bin/env bash
# Cycle-10 — files Samba foreground entrypoint (smbd 4.19; no legacy -S flag)
set -euo pipefail
mkdir -p /var/log/samba /var/lib/samba/private /var/run/samba
exec smbd -F --no-process-group --debug-stdout -d 1
