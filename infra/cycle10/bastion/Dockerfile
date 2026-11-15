# CYCLE10-PLANT — bastion (MGMT crown). SoftDev B2/B3.
# SSH :22 accepts ONLY from integrate (iptables). Stub password ≠ graded secret.
FROM alpine:3.20

RUN apk add --no-cache openssh-server bash shadow iptables iproute2 \
  && ssh-keygen -A \
  && adduser -D -s /bin/bash nwadmin \
  && echo 'nwadmin:B2-stub-replace-at-B8' | chpasswd \
  && mkdir -p /home/nwadmin /var/run/sshd /root \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
  && echo 'AllowUsers nwadmin' >> /etc/ssh/sshd_config \
  && chown -R nwadmin:nwadmin /home/nwadmin \
  && chmod 700 /home/nwadmin \
  && printf '%s\n' 'CYCLE10-CROWN-PLACEHOLDER' > /root/crown.txt \
  && chmod 600 /root/crown.txt \
  && chown root:root /root/crown.txt

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
