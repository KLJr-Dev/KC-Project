#!/usr/bin/env bash
# CYCLE10-SUPPORT — Cycle-10 zone fw
# SoftDev evolves rules as segments come up (B1–B9).
set -euo pipefail

echo "[c10-fw] applying baseline default-deny forward policy"

iptables -F || true
iptables -X || true
iptables -t nat -F || true

iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD DROP

iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# B3: integrate→bastion via bastion INPUT + integrate net_mgmt NIC.
# B5: docproc→db-archive via shared net_data NIC (compose exception).
# Later:
#   edge → portal/api
#   api → intake/worker/db/redis/objects/docproc

echo "[c10-fw] baseline ready (B5 docproc); sleeping"
exec sleep infinity
