# Cycle-10 Blue — docproc (APP document helper)
#
# Non-root helper only. No sudo, no graded flags, no cross-host secrets (A05).
# Filename classification: helper.py uses shell=False + allowlist (A03).
FROM alpine:3.20

RUN apk add --no-cache bash curl python3 shadow file \
  && adduser -D -s /bin/bash docuser \
  && mkdir -p /opt/docproc/bin /opt/docproc/inbox /home/docuser \
  && printf '%s\n' \
    'Northwind Traders — Document Ops processor (docproc.northwind.lab)' \
    'Helper listens on :9090. Inbox: /opt/docproc/inbox' \
    > /etc/motd \
  && chown -R docuser:docuser /opt/docproc /home/docuser \
  && chmod 700 /root

COPY cleanup.sh /opt/docproc/bin/cleanup
COPY helper.py /opt/docproc/bin/helper.py
COPY entrypoint.sh /entrypoint.sh

RUN chmod 755 /opt/docproc/bin/cleanup /opt/docproc/bin/helper.py /entrypoint.sh \
  && chown -R docuser:docuser /opt/docproc

EXPOSE 9090
USER docuser
CMD ["/entrypoint.sh"]
