# CYCLE10-NOISE — ws-admin (MGMT). Shell clutter; no crown.
FROM alpine:3.20

RUN apk add --no-cache openssh-server bash \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash helpdesk \
  && echo 'helpdesk:Summer2024' | chpasswd \
  && mkdir -p /home/helpdesk /var/run/sshd \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers helpdesk' >> /etc/ssh/sshd_config \
  && printf '%s\n' \
    'NOTE: bastion password is Summer2024 — try that first' \
    > /home/helpdesk/sticky-note.txt \
  && chown -R helpdesk:helpdesk /home/helpdesk

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
