# Cycle-10 SoftDev B1 — zone firewall (SUPPORT)
#
# Host: fw.northwind.lab
# Role: iptables FORWARD default-deny across DMZ/APP/DATA/CORP/MGMT NICs.
# Bridges ≠ allowlist (ADR-039). Rules evolve as segments appear (B2–B9).
# Marker: CYCLE10-SUPPORT
#
# Runtime: requires cap_add NET_ADMIN (+ NET_RAW) in compose.
# @see entrypoint.sh · docs/security/Cycle-10/Dev/v1.10.0-reachability-matrix.md
FROM alpine:3.20

RUN apk add --no-cache iptables ip6tables iproute2 bash curl

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
