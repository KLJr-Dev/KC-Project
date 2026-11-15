# CYCLE10-PLANT — partners SFTP (DMZ). SoftDev B7 — side door; cannot skip web gate.
FROM alpine:3.20

RUN apk add --no-cache openssh-server openssh-sftp-server bash \
  && ssh-keygen -A \
  && adduser -D -s /sbin/nologin vendor \
  && echo 'vendor:partner-sftp-b7' | chpasswd \
  && mkdir -p /var/sftp/incoming /var/run/sshd \
  && chown root:root /var/sftp \
  && chmod 755 /var/sftp \
  && chown vendor:vendor /var/sftp/incoming \
  && printf '%s\n' 'CYCLE10-PLANT partners.northwind.lab — SFTP drop only' \
    > /var/sftp/incoming/README

COPY sshd_config /etc/ssh/sshd_config

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
