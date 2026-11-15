# Cycle-10 SoftDev B2 — bastion (MGMT LIVE crown)
#
# Host: bastion.northwind.lab
# Hard gates: no host publish · SSH only from integrate (entrypoint iptables)
# SSH password matches /root/bastion.secret on docproc (root-only file).
# Crown: /root/crown.txt. Sticky-note Summer2024 on ws-admin is NOISE (wrong).
# Marker: CYCLE10-PLANT
#
# @see entrypoint.sh · HOST-INVENTORY.md · cycle-10-decisions.md §B10–11
FROM alpine:3.20

RUN apk add --no-cache openssh-server bash shadow iptables iproute2 \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash nwadmin \
  && echo 'nwadmin:Welcome1' | chpasswd \
  && mkdir -p /home/nwadmin /var/run/sshd /root \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers nwadmin' >> /etc/ssh/sshd_config \
  && printf '%s\n' \
    '============================================================' \
    ' Northwind Traders — bastion.northwind.lab (MGMT)' \
    ' Access only from integrate.northwind.lab' \
    '============================================================' \
    > /etc/ssh/northwind-banner \
  && echo 'Banner /etc/ssh/northwind-banner' >> /etc/ssh/sshd_config \
  && printf '%s\n' 'MGMT bastion — authorized cutover operators only.' > /etc/motd \
  && chown -R nwadmin:nwadmin /home/nwadmin \
  && chmod 700 /home/nwadmin \
  && printf '%s\n' 'OS{c10crown000000000000000000000001}' > /root/crown.txt \
  && chmod 600 /root/crown.txt \
  && chown root:root /root/crown.txt

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
