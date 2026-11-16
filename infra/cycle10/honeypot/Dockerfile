# Host: honeypot.northwind.lab — published :2223 → :2222
FROM alpine:3.20

RUN apk add --no-cache openssh-server bash \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash tempuser \
  && echo "tempuser:${HP_GUEST_PASSWORD:-NwHpGuest-ChangeMe-3f7a2b!}" | chpasswd \
  && adduser -D -s /bin/bash hpadmin \
  && echo "hpadmin:${HP_ADMIN_PASSWORD:-NwHpAdmin-ChangeMe-5d9c4e!}" | chpasswd \
  && adduser -D -s /bin/bash rootish \
  && echo "rootish:${HP_ROOTISH_PASSWORD:-NwHpRoot-ChangeMe-6e8b1f!}" | chpasswd \
  && mkdir -p /var/run/sshd /opt/remote \
  && printf '%s\n' \
    'Northwind Traders — Remote Access Gateway' \
    'Authorized personnel only. Sessions are monitored.' \
    'Disconnect immediately if you reached this host by mistake.' \
    > /opt/remote/NOTICE \
  && printf '%s\n' \
    '*** Northwind Traders remote access ***' \
    'Authorized use only. Activity may be logged.' \
    > /etc/ssh/northwind-banner \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers tempuser hpadmin rootish' >> /etc/ssh/sshd_config \
  && echo 'Port 2222' >> /etc/ssh/sshd_config \
  && echo 'Banner /etc/ssh/northwind-banner' >> /etc/ssh/sshd_config \
  && printf '%s\n' 'See /opt/remote/NOTICE' > /etc/motd

EXPOSE 2222
CMD ["/usr/sbin/sshd", "-D", "-e"]
