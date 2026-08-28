# Cycle-8 — LIVE FTP (Hydra target). CYCLE8-PLANT
# Anon: decoy README only (no F2, no cleartext). Authenticated lisa → F2 + www write.
# L3: lisa / peanut  (≠ L2 SMTP sunshine)
FROM alpine:3.20

RUN apk add --no-cache vsftpd \
  && adduser -D -h /home/lisa -s /sbin/nologin lisa \
  && echo 'lisa:peanut' | chpasswd \
  && mkdir -p /var/ftp/pub /home/lisa/www /var/www/html \
  && chown root:root /var/ftp /var/ftp/pub \
  && chmod 755 /var/ftp /var/ftp/pub

COPY vsftpd.conf /etc/vsftpd/vsftpd.conf
COPY pub/ /var/ftp/pub/
COPY home-lisa/flag.txt /home/lisa/flag.txt
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && chmod 644 /var/ftp/pub/* \
  && chown root:root /var/ftp/pub/* \
  && chown -R lisa:lisa /home/lisa \
  && chmod 600 /home/lisa/flag.txt

EXPOSE 21 30000-30009
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
