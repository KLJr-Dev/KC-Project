# Cycle-5 CTF — lab host (SSH + PrivEsc + decoys). kc-agent added in P4.
FROM alpine:3.20

RUN apk add --no-cache openssh-server bash sudo iputils curl gcc musl-dev \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash lab \
  && echo 'lab:4r98esfeb7' | chpasswd \
  && mkdir -p /home/lab /opt/kc-ops /opt/kc-lab /var/opt/kc /var/run/sshd /root \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers lab' >> /etc/ssh/sshd_config

# Primary PrivEsc: NOPASSWD backup helper (intentionally writable by lab)
COPY ops/backup.sh /opt/kc-ops/backup.sh
COPY ops/cleanup.sh /opt/kc-ops/cleanup.sh
COPY ops/kc-ops /etc/sudoers.d/kc-ops
COPY ops/root-crontab /etc/crontabs/root
COPY loot/home/ /home/lab/
COPY loot/user.txt /var/opt/kc/user.txt
COPY loot/root.txt /root/root.txt
COPY loot/opt-kc-lab-README /opt/kc-lab/README
COPY ops/kc-version.c /tmp/kc-version.c
COPY entrypoint.sh /entrypoint.sh

RUN chown root:root /etc/sudoers.d/kc-ops \
  && chmod 440 /etc/sudoers.d/kc-ops \
  && chown lab:lab /opt/kc-ops/backup.sh \
  && chmod 775 /opt/kc-ops/backup.sh \
  && chown root:root /opt/kc-ops/cleanup.sh \
  && chmod 755 /opt/kc-ops/cleanup.sh \
  && chown -R lab:lab /home/lab \
  && chmod 700 /home/lab \
  && chown lab:lab /var/opt/kc /var/opt/kc/user.txt \
  && chmod 755 /var/opt/kc \
  && chmod 640 /var/opt/kc/user.txt \
  && chown root:root /root/root.txt \
  && chmod 600 /root/root.txt \
  && chmod 755 /opt/kc-lab \
  && chmod 644 /opt/kc-lab/README \
  && gcc -O2 -o /usr/local/bin/kc-version /tmp/kc-version.c \
  && rm -f /tmp/kc-version.c \
  && chown root:root /usr/local/bin/kc-version \
  && chmod 4755 /usr/local/bin/kc-version \
  && chmod 755 /entrypoint.sh \
  && apk del gcc musl-dev \
  && visudo -c

EXPOSE 22 8787
ENTRYPOINT ["/entrypoint.sh"]
