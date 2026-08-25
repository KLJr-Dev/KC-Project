# Cycle-4 SoftDev — OpenSSH lab foothold (user `lab`, no PrivEsc).
FROM alpine:3.20

RUN apk add --no-cache openssh-server bash \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash lab \
  && echo 'lab:labpass' | chpasswd \
  && mkdir -p /home/lab /opt/kc-lab /var/run/sshd \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers lab' >> /etc/ssh/sshd_config

COPY loot/ /home/lab/
COPY opt-kc-lab/ /opt/kc-lab/

RUN chown -R lab:lab /home/lab \
  && chmod 700 /home/lab \
  && chmod 644 /home/lab/user.txt /home/lab/notes.bak /home/lab/.bash_history \
  && chmod 755 /opt/kc-lab \
  && chmod 644 /opt/kc-lab/README

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
