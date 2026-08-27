# Cycle-8 mail (internal IMAP). CYCLE8-PLANT — John L2 lisa/sunshine
# Players: imap from foothold. Examiner: proof file in maildir.
FROM alpine:3.20

RUN apk add --no-cache dovecot \
  && adduser -D -s /sbin/nologin lisa \
  && echo 'lisa:sunshine' | chpasswd \
  && mkdir -p /home/lisa/Maildir/new /home/lisa/Maildir/cur /home/lisa/Maildir/tmp \
  && printf '%s\n' \
    'From: ops@northwind.ops' \
    'To: lisa@northwind.ops' \
    'Subject: Ops proof' \
    '' \
    'OS{d310a0605d95303aa114d707b7686f76}' \
    > /home/lisa/Maildir/new/f5.eml \
  && chown -R lisa:lisa /home/lisa

COPY dovecot.conf /etc/dovecot/dovecot.conf

EXPOSE 143
CMD ["dovecot", "-F"]
