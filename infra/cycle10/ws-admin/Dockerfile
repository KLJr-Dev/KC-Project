# Host: ws-admin.northwind.lab — helpdesk workstation (Blue: no password decoys)
FROM alpine:3.20

ARG HELPDESK_SSH_PASSWORD=NwHelpdesk-ChangeMe-2b6c9e!
ENV HELPDESK_SSH_PASSWORD=${HELPDESK_SSH_PASSWORD}

RUN apk add --no-cache openssh-server bash \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash helpdesk \
  && echo "helpdesk:${HELPDESK_SSH_PASSWORD}" | chpasswd \
  && mkdir -p /home/helpdesk/Desktop /home/helpdesk/Documents /var/run/sshd \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers helpdesk' >> /etc/ssh/sshd_config \
  && echo 'Banner /etc/ssh/northwind-banner' >> /etc/ssh/sshd_config \
  && printf '%s\n' \
    'Northwind Traders — ws-admin (helpdesk workstation)' \
    'CORP network only. Not a jump host.' \
    > /etc/ssh/northwind-banner \
  && printf '%s\n' \
    'Todo: reset printer queue · ticket NW-8841 · coffee order' \
    > /home/helpdesk/Desktop/todo.txt \
  && printf '%s\n' \
    'Helpdesk shift notes — MGMT credentials come from vault only.' \
    > /home/helpdesk/Documents/shift-notes.txt \
  && printf '%s\n' \
    'Northwind helpdesk desktop.' \
    > /etc/motd \
  && chown -R helpdesk:helpdesk /home/helpdesk

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
