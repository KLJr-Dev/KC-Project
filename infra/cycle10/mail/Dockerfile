# Host: mail.northwind.lab — corporate maildir
FROM alpine:3.20

COPY seeds/mail/ops/ /tmp/ops-seed/
COPY seeds/mail/it/ /tmp/it-seed/

RUN apk add --no-cache bash \
  && adduser -D -s /sbin/nologin mailer \
  && mkdir -p /var/mail/northwind/ops /var/mail/northwind/it \
  && printf '%s\n' \
    'Northwind Traders — corporate maildir' \
    'Mailboxes: ops@ · it@  (Document Ops cutover traffic lives under ops/)' \
    > /var/mail/northwind/README \
  && cp /tmp/ops-seed/*.eml /var/mail/northwind/ops/ \
  && cp /tmp/ops-seed/runbook-q4.txt /var/mail/northwind/ops/ \
  && cp /tmp/it-seed/*.eml /var/mail/northwind/it/ \
  && chown -R mailer:mailer /var/mail/northwind \
  && rm -rf /tmp/ops-seed /tmp/it-seed

CMD ["sh", "-c", "echo '[c10-mail] Northwind maildir ready'; sleep infinity"]
