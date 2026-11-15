# CYCLE10-PLANT — integrate (CORP+APP dual-home). SoftDev B3.
# Sole host attached to net_mgmt besides bastion/SUPPORT — enforces integrate→bastion only.
FROM alpine:3.20

RUN apk add --no-cache openssh-server openssh-client bash curl \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash integrator \
  && echo 'integrator:corp-integrate-b3' | chpasswd \
  && mkdir -p /home/integrator /var/run/sshd /opt/northwind \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers integrator' >> /etc/ssh/sshd_config \
  && printf '%s\n' \
    '# CYCLE10-PLANT — integrate.northwind.lab' \
    '# Dual-home: net_app + net_corp (+ net_mgmt NIC = fw-approved bastion path).' \
    '# Not an IP router. Bastion SSH only from this host.' \
    > /opt/northwind/ROLE \
  && chown -R integrator:integrator /home/integrator

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
