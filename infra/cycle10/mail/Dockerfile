# CYCLE10-PLANT — mail (CORP). SoftDev B3 stub; B8 seeds required ops thread.
FROM alpine:3.20

RUN apk add --no-cache bash \
  && adduser -D -s /sbin/nologin mailer \
  && mkdir -p /var/mail/northwind/ops /var/mail/northwind/noise \
  && printf '%s\n' 'CYCLE10-PLANT mail.northwind.lab — maildir stub (B3)' \
    > /var/mail/northwind/README \
  && printf '%s\n' 'B8 will drop required ops thread + runbook attachment here.' \
    > /var/mail/northwind/ops/.keep \
  && printf '%s\n' 'Subject: bastion is Summer2024' \
    'From: it@northwind.lab' \
    '' \
    'try Summer2024 on bastion (NOISE — rejects)' \
    > /var/mail/northwind/noise/false-bastion.eml

CMD ["sh", "-c", "echo '[c10-mail] maildir stub ready'; sleep infinity"]
