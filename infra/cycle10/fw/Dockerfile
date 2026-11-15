# CYCLE10-SUPPORT — zone firewall for Cycle-10 lab (B1+)
FROM alpine:3.20

RUN apk add --no-cache iptables ip6tables iproute2 bash curl

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# NET_ADMIN required at runtime (compose cap_add)
CMD ["/entrypoint.sh"]
