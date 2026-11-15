# Host: backup.northwind.lab
FROM alpine:3.20

RUN apk add --no-cache bash \
  && mkdir -p /backup/northwind \
  && printf '%s\n' 'Northwind backup collector' \
    > /backup/northwind/README \
  && printf '%s\n' \
    '# Last full: none scheduled' \
    'manifest: empty' \
    > /backup/northwind/manifest.txt

CMD ["sh", "-c", "echo '[c10-backup] ready'; sleep infinity"]
