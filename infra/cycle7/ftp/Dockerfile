# Cycle-7 — anonymous FTP drop (F2 + SSH breadcrumb). CWE-306 / FC-14.
# INTENTIONAL: anon read of loot; Blue unpublishes this overlay.
#
# vsftpd refuses anon if the chroot root is writable by the ftp user
# ("OOPS: … writable root inside chroot"). Keep /var/ftp owned by root 755.
FROM alpine:3.20

RUN apk add --no-cache vsftpd \
  && mkdir -p /var/ftp/pub \
  && chown root:root /var/ftp /var/ftp/pub \
  && chmod 755 /var/ftp /var/ftp/pub

COPY vsftpd.conf /etc/vsftpd/vsftpd.conf
COPY loot/ /var/ftp/pub/
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && chmod 644 /var/ftp/pub/* \
  && chown root:root /var/ftp/pub/*

EXPOSE 21 30000-30009
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
