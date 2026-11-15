#!/usr/bin/env bash
# c10-fw — zone sentinel (FORWARD default DROP)
#
# SoftDev isolation is primarily:
#   - compose NIC membership (who shares which bridge)
#   - internal: true on DATA / CORP / MGMT
#   - bastion INPUT iptables (integrate-only SSH)
#
# This container sits on all five nets. Same-bridge peers do not hit FORWARD.
# Keep DROP policy so accidental L3 routing via fw stays closed.
set -euo pipefail

echo "[c10-fw] applying baseline default-deny forward policy"

iptables -F || true
iptables -X || true
iptables -t nat -F || true

iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD DROP

iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

echo "[c10-fw] baseline ready; sleeping"
exec sleep infinity
