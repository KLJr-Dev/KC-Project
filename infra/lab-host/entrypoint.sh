#!/bin/sh
# Cycle-5 lab-host: sshd (kc-agent starts here in P4).
set -eu
exec /usr/sbin/sshd -D -e
