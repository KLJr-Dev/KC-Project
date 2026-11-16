# Host: ws-accounting.northwind.lab
FROM alpine:3.20

RUN apk add --no-cache openssh-server bash \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash ledger \
  && echo "ledger:${LEDGER_SSH_PASSWORD:-NwLedger-ChangeMe-9b4e2a!}" | chpasswd \
  && mkdir -p /home/ledger /var/run/sshd \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && echo 'AllowUsers ledger' >> /etc/ssh/sshd_config \
  && printf '%s\n' 'Q1 spreadsheets — local workstation only' > /home/ledger/README \
  && chown -R ledger:ledger /home/ledger

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
