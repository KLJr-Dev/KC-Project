#!/bin/sh
set -eu
# Re-apply password if volume reset
echo -e 'sunshine\nsunshine' | smbpasswd -a -s lisa >/dev/null 2>&1 || true
exec smbd -F --no-process-group
