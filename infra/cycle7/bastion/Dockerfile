# Cycle-7 — real SSH bastion (F3 user / F4 root via sudo find GTFO).
# CWE-269: NOPASSWD /usr/bin/find — intentional tip; Blue removes overlay plants.
FROM alpine:3.20

RUN apk add --no-cache openssh-server bash sudo curl findutils \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash lab \
  && echo 'lab:labpass' | chpasswd \
  && mkdir -p /home/lab /opt/northwind /root /var/run/sshd \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers lab' >> /etc/ssh/sshd_config \
  && echo 'lab ALL=(root) NOPASSWD: /usr/bin/find' > /etc/sudoers.d/lab-find \
  && chmod 440 /etc/sudoers.d/lab-find

COPY loot/user.txt /home/lab/user.txt
COPY loot/bash_history /home/lab/.bash_history
COPY opt-northwind/ /opt/northwind/
COPY root/root.txt /root/root.txt
COPY root/ops-intranet.txt /root/ops-intranet.txt

RUN chown -R lab:lab /home/lab \
  && chmod 700 /home/lab \
  && chmod 644 /home/lab/user.txt /home/lab/.bash_history \
  && chmod 755 /opt/northwind \
  && chmod 644 /opt/northwind/README \
  && chmod 600 /root/root.txt /root/ops-intranet.txt

# Jump hostname `cycle7-jump` resolves via Docker DNS on network cycle7_internal.

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]