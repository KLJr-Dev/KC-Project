# Host: logs.northwind.lab
FROM alpine:3.20

RUN apk add --no-cache bash \
  && mkdir -p /var/log/northwind \
  && printf '%s\n' 'Northwind log collector' \
    > /var/log/northwind/README \
  && printf '%s\n' \
    '2026-11-15T00:00:00Z INFO bootstrap ok' \
    '2026-11-15T00:00:01Z INFO collector online' \
    > /var/log/northwind/syslog.sample

CMD ["sh", "-c", "echo '[c10-logs] ready'; sleep infinity"]
