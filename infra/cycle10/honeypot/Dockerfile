# CYCLE10-DECOY — honeypot (DMZ). SoftDev B7 — SSH decoy timebox.
FROM alpine:3.20

RUN apk add --no-cache openssh-server bash \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash decoy \
  && echo 'decoy:guest' | chpasswd \
  && adduser -D -s /bin/bash hpadmin \
  && echo 'hpadmin:admin' | chpasswd \
  && adduser -D -s /bin/bash rootish \
  && echo 'rootish:Summer2024' | chpasswd \
  && mkdir -p /var/run/sshd /opt/honeypot \
  && printf '%s\n' \
    'CYCLE10-DECOY — no graded path. Timebox and move on.' \
    > /opt/honeypot/NOTICE \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers decoy hpadmin rootish' >> /etc/ssh/sshd_config \
  && echo 'Port 2222' >> /etc/ssh/sshd_config

EXPOSE 2222
CMD ["/usr/sbin/sshd", "-D", "-e"]
