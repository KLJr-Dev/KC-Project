#!/usr/bin/env bash
# CYCLE10-PLANT — bastion: SSH only from integrate.northwind.lab
set -euo pipefail

echo "[c10-bastion] locking sshd to integrate only"

iptables -F INPUT || true
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
# default: drop new SSH until integrate resolves
iptables -A INPUT -p tcp --dport 22 -j DROP
iptables -P INPUT DROP
iptables -P OUTPUT ACCEPT
iptables -P FORWARD DROP

allow_integrate() {
  local ip
  ip="$(getent hosts integrate.northwind.lab 2>/dev/null | awk '{print $1; exit}')"
  if [[ -z "${ip}" ]]; then
    ip="$(getent hosts integrate 2>/dev/null | awk '{print $1; exit}')"
  fi
  if [[ -n "${ip}" ]]; then
    iptables -D INPUT -p tcp --dport 22 -j DROP 2>/dev/null || true
    iptables -C INPUT -p tcp --dport 22 -s "${ip}" -j ACCEPT 2>/dev/null \
      || iptables -I INPUT 3 -p tcp --dport 22 -s "${ip}" -j ACCEPT
    iptables -C INPUT -p tcp --dport 22 -j DROP 2>/dev/null \
      || iptables -A INPUT -p tcp --dport 22 -j DROP
    echo "[c10-bastion] ssh allow ${ip} (integrate)"
    return 0
  fi
  return 1
}

(
  for _ in $(seq 1 60); do
    allow_integrate && break
    sleep 2
  done
) &

echo "[c10-bastion] sshd starting"
exec /usr/sbin/sshd -D -e
