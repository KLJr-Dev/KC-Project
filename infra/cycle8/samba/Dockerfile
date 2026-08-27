# Cycle-8 Samba (internal). CYCLE8-PLANT F5
# Auth: lisa / sunshine (L2 John) — ≠ FTP peanut
FROM alpine:3.20

RUN apk add --no-cache samba samba-common-tools \
  && adduser -D -s /sbin/nologin lisa \
  && echo -e 'sunshine\nsunshine' | smbpasswd -a -s lisa \
  && mkdir -p /shares/OpsFiles \
  && echo 'OS{d310a0605d95303aa114d707b7686f76}' > /shares/OpsFiles/proof.txt \
  && chown -R lisa:lisa /shares

COPY smb.conf /etc/samba/smb.conf
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 445
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
