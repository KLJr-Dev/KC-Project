# CYCLE10-SUPPORT — logs stub (MGMT). No graded secrets.
FROM alpine:3.20

RUN apk add --no-cache bash \
  && mkdir -p /var/log/northwind \
  && printf '%s\n' 'CYCLE10-SUPPORT logs.northwind.lab — stub collector' \
    > /var/log/northwind/README \
  && printf '%s\n' \
    '2026-11-15T00:00:00Z INFO bootstrap ok' \
    '2026-11-15T00:00:01Z INFO no SIEM — placeholder for SoftEng realism' \
    > /var/log/northwind/syslog.stub

CMD ["sh", "-c", "echo '[c10-logs] ready'; sleep infinity"]
