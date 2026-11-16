# Host: integrate.northwind.lab — cutover / jump host (Blue tip)
# Password from INTEGRATE_SSH_PASSWORD — no bash_history spoilers.
FROM alpine:3.20

ARG INTEGRATE_SSH_PASSWORD=NwIntegrate-ChangeMe-4d8e1a!
ENV INTEGRATE_SSH_PASSWORD=${INTEGRATE_SSH_PASSWORD}

RUN apk add --no-cache openssh-server openssh-client bash curl \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash integrator \
  && echo "integrator:${INTEGRATE_SSH_PASSWORD}" | chpasswd \
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
    'Use for cutover jobs and MGMT access from this box only.' \
    > /opt/northwind/ROLE \
  && printf '%s\n' \
    '------------------------------------------------------------' \
    ' Welcome to integrate.northwind.lab' \
    ' Role file: /opt/northwind/ROLE' \
    ' Bastion: bastion.northwind.lab (from here only)' \
    '------------------------------------------------------------' \
    > /etc/motd \
  && printf '%s\n' \
    '#!/bin/sh' \
    'echo "Use vault-issued cutover credentials — see ops runbook."' \
    > /opt/northwind/cutover-hint.sh \
  && chmod 755 /opt/northwind/cutover-hint.sh \
  && chown -R integrator:integrator /home/integrator

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
