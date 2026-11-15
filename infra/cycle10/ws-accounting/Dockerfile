# CYCLE10-NOISE — ws-accounting (CORP). No graded secrets.
FROM alpine:3.20

RUN apk add --no-cache openssh-server bash \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash ledger \
  && echo 'ledger:Account1ng!' | chpasswd \
  && mkdir -p /home/ledger /var/run/sshd \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && echo 'AllowUsers ledger' >> /etc/ssh/sshd_config \
  && printf '%s\n' 'Q1 spreadsheets — nothing for bastion' > /home/ledger/README \
  && chown -R ledger:ledger /home/ledger

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
