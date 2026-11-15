# Cycle-10 SoftDev B5 — docproc (APP LIVE OS)
#
# Host: docproc.northwind.lab
# Graded path: Nest packet upload → helper :9090 → shell as docuser →
#   local.txt → sudo find PrivEsc → proof.txt + bastion.secret (root)
# Helper plant: infra/cycle10/docproc/helper.py (shell metachar in name=)
# Compose: net_app + net_data (archive exception)
# Marker: CYCLE10-PLANT
#
# Provisional OS{…} SoftDev flags; GT may rotate at B8/B10 freeze.
# @see docs/security/Cycle-10/Dev/v1.10.0-box-plan.md
FROM alpine:3.20

RUN apk add --no-cache bash curl python3 sudo shadow file \

  && adduser -D -s /bin/bash docuser \
  && echo 'docuser:changeme' | chpasswd \
  && mkdir -p /opt/docproc/bin /opt/docproc/inbox /home/docuser /root \
  && printf '%s\n' \
    'Northwind Traders — Document Ops processor (docproc.northwind.lab)' \
    'Helper listens on :9090. Inbox: /opt/docproc/inbox' \
    'Portal packet uploads feed this host — do not expose to the internet.' \
    > /etc/motd \
  && printf '%s\n' \
    'Document Ops helper appliance — classify inbound packet filenames.' \
    > /opt/docproc/ROLE \
  && chown -R docuser:docuser /opt/docproc /home/docuser

# User-readable stage proof
RUN printf '%s\n' 'OS{c10local000000000000000000000001}' > /home/docuser/local.txt \
  && chown docuser:docuser /home/docuser/local.txt \
  && chmod 644 /home/docuser/local.txt

# Root-only proofs (after PrivEsc) — docuser must not read /root or shadow/sudoers
RUN printf '%s\n' 'OS{c10proof000000000000000000000001}' > /root/proof.txt \
  && printf '%s\n' 'Welcome1' > /root/bastion.secret \
  && chmod 600 /root/proof.txt /root/bastion.secret \
  && chown root:root /root/proof.txt /root/bastion.secret \
  && chmod 700 /root \
  && chmod 640 /etc/shadow \
  && chown root:shadow /etc/shadow

# Medium PrivEsc: passwordless sudo for /usr/bin/find (GTFOBins) only
COPY cleanup.sh /opt/docproc/bin/cleanup
COPY helper.py /opt/docproc/bin/helper.py
COPY entrypoint.sh /entrypoint.sh

RUN chmod 755 /opt/docproc/bin/cleanup /opt/docproc/bin/helper.py /entrypoint.sh \
  && echo 'docuser ALL=(root) NOPASSWD: /usr/bin/find' > /etc/sudoers.d/docuser \
  && chmod 440 /etc/sudoers.d/docuser \
  && chmod 750 /etc/sudoers.d \
  && chmod 440 /etc/sudoers

EXPOSE 9090
USER root
CMD ["/entrypoint.sh"]
