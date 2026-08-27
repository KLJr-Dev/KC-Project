# Cycle-7 — anonymous FTP drop (F2 + SSH breadcrumb). CWE-306 / FC-14.
# INTENTIONAL: anon read of loot; Blue unpublishes this overlay.
FROM alpine:3.20

RUN apk add --no-cache vsftpd \
  && mkdir -p /var/ftp/pub \
  && chown -R ftp:ftp /var/ftp

COPY vsftpd.conf /etc/vsftpd/vsftpd.conf
COPY loot/ /var/ftp/pub/
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && chmod 644 /var/ftp/pub/*

EXPOSE 21 30000-30009
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
