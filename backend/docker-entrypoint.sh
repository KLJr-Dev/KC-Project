#!/bin/sh
# M8 — drop privileges after ensuring uploads/ is writable by node (CWE-250).
# Named volumes mount as root; chown then exec as node via su-exec.
set -e
mkdir -p /app/uploads
chown -R node:node /app/uploads
exec su-exec node "$@"
