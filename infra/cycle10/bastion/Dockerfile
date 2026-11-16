# Cycle-10 Blue — bastion (MGMT jump host)
# Password via BASTION_SSH_PASSWORD. Entrypoint INPUT: SSH from integrate only.
# Least privilege: no broad sudo; operator shell only.
FROM alpine:3.20

ARG BASTION_SSH_PASSWORD=NwBastion-ChangeMe-9f3a2c!
ENV BASTION_SSH_PASSWORD=${BASTION_SSH_PASSWORD}

RUN apk add --no-cache openssh-server bash shadow iptables iproute2 \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash nwadmin \
  && echo "nwadmin:${BASTION_SSH_PASSWORD}" | chpasswd \
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
  && chmod 700 /home/nwadmin /root

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
