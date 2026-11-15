# CYCLE10-PLANT — docproc (APP). SoftDev B5.
# Helper mishandle → shell as docuser; medium sudo PrivEsc → proof + bastion secret.
FROM alpine:3.20

RUN apk add --no-cache bash curl python3 sudo shadow \
  && adduser -D -s /bin/bash docuser \
  && echo 'docuser:docproc-b5' | chpasswd \
  && mkdir -p /opt/docproc/bin /opt/docproc/inbox /home/docuser /root \
  && chown -R docuser:docuser /opt/docproc /home/docuser

# local.txt — user-readable proof
RUN printf '%s\n' 'CYCLE10-LOCAL-PLACEHOLDER' > /home/docuser/local.txt \
  && chown docuser:docuser /home/docuser/local.txt \
  && chmod 644 /home/docuser/local.txt

# proof.txt + bastion secret — root-only (after PrivEsc)
RUN printf '%s\n' 'CYCLE10-PROOF-PLACEHOLDER' > /root/proof.txt \
  && printf '%s\n' 'CYCLE10-BASTION-SECRET-PLACEHOLDER' > /root/bastion.secret \
  && chmod 600 /root/proof.txt /root/bastion.secret \
  && chown root:root /root/proof.txt /root/bastion.secret

# Medium PrivEsc: passwordless sudo for a narrow "cleanup" wrapper that is writable? 
# Better OSCP-medium: sudo NOPASSWD on /opt/docproc/bin/cleanup.sh owned by root but
# calls a relative path — classic. Use: sudo /usr/bin/python3 /opt/docproc/bin/report.py
# where report.py is root-owned — instead: sudo NOPASSWD: /bin/gzip * misuse.
# SoftDev choice: NOPASSWD sudo for /opt/docproc/bin/cleanup (root-owned script that
# intentionally runs find -exec with attacker-writable dir — simpler:
# sudo ALL for /usr/bin/find (GTFOBins).
COPY cleanup.sh /opt/docproc/bin/cleanup
COPY helper.py /opt/docproc/bin/helper.py
COPY entrypoint.sh /entrypoint.sh

RUN chmod 755 /opt/docproc/bin/cleanup /opt/docproc/bin/helper.py /entrypoint.sh \
  && echo 'docuser ALL=(root) NOPASSWD: /usr/bin/find' > /etc/sudoers.d/docuser \
  && chmod 440 /etc/sudoers.d/docuser

# Helper listens on 9090 (Nest calls in B6). CYCLE10-PLANT: shell metachar in filename.
EXPOSE 9090
USER root
CMD ["/entrypoint.sh"]
