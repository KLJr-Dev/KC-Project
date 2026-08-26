# Optional lab-host noise (Cycle-5 Blue) — OpenSSH only.
# No kc-agent, no sudo PrivEsc plants, no CTF flags.
# Vulnerable CTF image lives only on frozen branch ctf/shells-privesc.
FROM alpine:3.20

RUN apk add --no-cache openssh-server bash \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash lab \
  && echo 'lab:lab-noise-not-a-plant' | chpasswd \
  && mkdir -p /home/lab /var/run/sshd \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers lab' >> /etc/ssh/sshd_config \
  && chown -R lab:lab /home/lab \
  && chmod 700 /home/lab

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
