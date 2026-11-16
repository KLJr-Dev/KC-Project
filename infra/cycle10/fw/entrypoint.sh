#!/usr/bin/env bash
# c10-fw — zone sentinel (FORWARD default DROP + documented Blue allows)
#
# SoftDev isolation:
#   - compose NIC membership (who shares which bridge)
#   - internal: true on DATA / CORP / MGMT
#   - bastion INPUT iptables (integrate-only SSH)
#   - no APP→DATA dual-home on docproc (Blue)
#
# Same-bridge peers do not hit FORWARD. This policy blocks accidental L3
# routing via the fw multi-homed host. Explicit ACCEPTs document the
# intended Blue matrix for any traffic that is routed.
set -euo pipefail

echo "[c10-fw] applying Blue default-deny forward policy"

iptables -F || true
iptables -X || true
iptables -t nat -F || true

iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD DROP

# Return traffic for allowed flows
iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Blue matrix (routed cross-zone only — dual-home exceptions removed on tip):
#   DMZ/APP edge→portal|api and api→docproc stay same-bridge (L2) — no FORWARD
#   integrate→bastion:22 enforced on bastion INPUT (not FORWARD)
#   APP→DATA: DENY (no ACCEPT; docproc not on net_data)
#   Internet→non-443: DENY at host publish layer (sole :443)

# Drop anything else explicitly logged once (rate-limited) for ops visibility
iptables -A FORWARD -m limit --limit 5/min -j LOG --log-prefix "c10-fw-DROP " --log-level 4
iptables -A FORWARD -j DROP

echo "[c10-fw] Blue matrix ready; sleeping"
exec sleep infinity
