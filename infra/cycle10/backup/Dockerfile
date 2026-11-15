# CYCLE10-SUPPORT — backup stub (MGMT). No graded / crown material.
FROM alpine:3.20

RUN apk add --no-cache bash \
  && mkdir -p /backup/northwind \
  && printf '%s\n' 'CYCLE10-SUPPORT backup.northwind.lab — stub' \
    > /backup/northwind/README \
  && printf '%s\n' \
    '# Noise only — not a restore path for the graded chain' \
    'manifest: empty-stub' \
    > /backup/northwind/manifest.txt

CMD ["sh", "-c", "echo '[c10-backup] ready'; sleep infinity"]
