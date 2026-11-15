#!/usr/bin/env bash
# Cycle-10 SoftDev — runtime host inventory dump
#
# Prints OS/version/networks/published ports/key FS paths for every c10-* container.
# SoftDev snapshot committed as infra/cycle10/HOST-INVENTORY.runtime.md
# Spec table: infra/cycle10/HOST-INVENTORY.md
# Usage: ./infra/cycle10-inventory.sh[ > infra/cycle10/HOST-INVENTORY.runtime.md]
set -euo pipefail

CONTAINERS=(
  c10-fw c10-bastion c10-logs c10-backup c10-ws-admin
  c10-integrate c10-mail c10-files c10-ws-accounting c10-ftp-warehouse c10-mon-legacy
  c10-db-archive c10-docproc
  c10-edge c10-partners c10-honeypot
)

echo "# Cycle-10 runtime inventory — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo
for c in "${CONTAINERS[@]}"; do
  if ! docker inspect "$c" >/dev/null 2>&1; then
    echo "## $c — NOT RUNNING"
    echo
    continue
  fi
  img="$(docker inspect -f '{{.Config.Image}}' "$c")"
  nets="$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$c")"
  pubs="$(docker port "$c" 2>/dev/null | tr '\n' ' ' || true)"
  echo "## $c"
  echo "- image: \`$img\`"
  echo "- networks: \`$nets\`"
  echo "- published: \`${pubs:-none}\`"
  docker exec "$c" sh -c '
    echo "- uname: $(uname -a 2>/dev/null || true)"
    if command -v nginx >/dev/null 2>&1; then nginx -v 2>&1 | sed "s/^/- /"; fi
    if command -v psql >/dev/null 2>&1; then psql --version 2>/dev/null | sed "s/^/- /"; fi
    if command -v python3 >/dev/null 2>&1; then python3 --version 2>/dev/null | sed "s/^/- /"; fi
    if command -v smbd >/dev/null 2>&1; then smbd --version 2>/dev/null | head -1 | sed "s/^/- /"; fi
    if [ -f /etc/os-release ]; then . /etc/os-release; echo "- os: $PRETTY_NAME"; fi
    echo "- key paths:"
    for p in /root/crown.txt /root/proof.txt /root/bastion.secret /home/docuser/local.txt \
      /opt/docproc/bin/helper.py /shares/dept /var/mail/northwind /var/sftp/incoming \
      /usr/share/nginx/html/index.html /opt/remote/NOTICE /backup/northwind/README \
      /var/log/northwind/README /opt/northwind/ROLE; do
      if [ -e "$p" ]; then ls -ld "$p" 2>/dev/null | sed "s/^/  - /"; fi
    done
  ' 2>/dev/null || echo "- (exec limited)"
  echo
done
