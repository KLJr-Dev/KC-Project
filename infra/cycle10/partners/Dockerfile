# Host: partners.northwind.lab — SFTP drop (:2122 → :22)
FROM alpine:3.20

RUN apk add --no-cache openssh-server openssh-sftp-server bash \
  && ssh-keygen -A \
  && adduser -D -s /sbin/nologin vendor \
  && echo "vendor:${VENDOR_SSH_PASSWORD:-NwVendor-ChangeMe-1c3e5a!}" | chpasswd \
  && mkdir -p /var/sftp/incoming /var/run/sshd \
  && chown root:root /var/sftp \
  && chmod 755 /var/sftp \
  && chown vendor:vendor /var/sftp/incoming \
  && printf '%s\n' \
    'Northwind Traders — Partner SFTP drop (partners.northwind.lab)' \
    'Place inbound vendor files under incoming/.' \
    'Document Ops on the employee portal remains the graded packet path;' \
    'this drop cannot skip web Document Ops intake.' \
    > /var/sftp/incoming/README \
  && printf '%s\n' \
    'Northwind Traders partner drop — authorized vendors only' \
    > /etc/ssh/northwind-banner \
  && echo 'Banner /etc/ssh/northwind-banner' >> /etc/ssh/sshd_config

COPY sshd_config /etc/ssh/sshd_config

# Ensure banner line survives copied sshd_config if it overwrites — append again
RUN echo 'Banner /etc/ssh/northwind-banner' >> /etc/ssh/sshd_config

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
