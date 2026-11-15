# Host: integrate.northwind.lab — cutover / jump host
FROM alpine:3.20

RUN apk add --no-cache openssh-server openssh-client bash curl \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash integrator \
  && echo 'integrator:Passw0rd' | chpasswd \
  && mkdir -p /home/integrator /var/run/sshd /opt/northwind /etc \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers integrator' >> /etc/ssh/sshd_config \
  && echo 'Banner /etc/ssh/northwind-banner' >> /etc/ssh/sshd_config \
  && printf '%s\n' \
    '============================================================' \
    ' Northwind Traders — integrate.northwind.lab' \
    ' Cutover / jump host. MGMT bastion SSH from this box only.' \
    ' Unauthorized use prohibited.' \
    '============================================================' \
    > /etc/ssh/northwind-banner \
  && printf '%s\n' \
    'Northwind Traders — integration host' \
    'Use for Q4 cutover jobs and MGMT access from this box only.' \
    'Document Ops packet path stays on the portal; this host is jump only.' \
    > /opt/northwind/ROLE \
  && printf '%s\n' \
    '------------------------------------------------------------' \
    ' Welcome to integrate.northwind.lab' \
    ' Role file: /opt/northwind/ROLE' \
    ' Bastion: bastion.northwind.lab (from here only)' \
    '------------------------------------------------------------' \
    > /etc/motd \
  && printf '%s\n' \
    'ssh nwadmin@bastion.northwind.lab' \
    'ls /opt/northwind' \
    'cat /opt/northwind/ROLE' \
    'curl -sf http://docproc:9090/health || true' \
    > /home/integrator/.bash_history \
  && printf '%s\n' \
    '#!/bin/sh' \
    '# stub — operators run cutover steps from runbook-q4.txt' \
    'echo "See mail ops runbook + dept/integration/JUMPBOX.txt"' \
    > /opt/northwind/cutover-hint.sh \
  && chmod 755 /opt/northwind/cutover-hint.sh \
  && chown -R integrator:integrator /home/integrator

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
