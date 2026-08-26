#!/bin/sh
# Cycle-5 lab-host: kc-agent (lab) + sshd.
set -eu
su -s /bin/sh lab -c 'python3 /opt/kc-agent/agent.py' &
exec /usr/sbin/sshd -D -e
