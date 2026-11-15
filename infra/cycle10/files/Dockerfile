# CYCLE10-PLANT — files Samba share (CORP). SoftDev B3; B8 seeds runbook targets.
FROM alpine:3.20

RUN apk add --no-cache samba samba-common-tools bash \
  && adduser -D -H -s /sbin/nologin smbuser \
  && mkdir -p /shares/dept /shares/noise /var/lib/samba/private /var/log/samba

COPY smb.conf /etc/samba/smb.conf

RUN printf '%s\n' 'CYCLE10-PLANT files.northwind.lab' > /shares/dept/README \
  && printf '%s\n' 'B8: integration material for integrate shell lands in /shares/dept' \
    > /shares/dept/.soft-dev \
  && printf '%s\n' 'old-vendor-sftp-notes.txt — not the web gate' > /shares/noise/README \
  && printf '%s\n%s\n' 'files-b3' 'files-b3' | smbpasswd -a -s smbuser

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 445
CMD ["/entrypoint.sh"]
