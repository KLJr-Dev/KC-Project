# Host: files.northwind.lab — Samba dept + legacy shares
FROM alpine:3.20

COPY seeds/files/ /tmp/files-seed/

RUN apk add --no-cache samba samba-common-tools bash \
  && adduser -D -H -s /sbin/nologin smbuser \
  && mkdir -p /shares/dept/integration /shares/dept/policies /shares/legacy \
       /var/lib/samba/private /var/log/samba

COPY files/smb.conf /etc/samba/smb.conf

RUN printf '%s\n' \
    'Northwind Traders — Dept Share (files.northwind.lab)' \
    'Workgroup NORTHWIND · Document Ops cutover material under dept/integration/' \
    > /shares/dept/README \
  && cp /tmp/files-seed/dept/integration/JUMPBOX.txt /shares/dept/integration/JUMPBOX.txt \
  && cp /tmp/files-seed/dept/integration/cutover-notes-oct.txt /shares/dept/integration/ \
  && cp /tmp/files-seed/dept/policies/acceptable-use.txt /shares/dept/policies/ \
  && cp /tmp/files-seed/legacy/vendor-drop-2019.txt /shares/legacy/ \
  && printf '%s\n' \
    'Archived vendor notes — prefer partners.northwind.lab for live drops' \
    > /shares/legacy/README \
  && printf '%s\n%s\n' 'password' 'password' | smbpasswd -a -s smbuser \
  && chown -R smbuser:smbuser /shares \
  && rm -rf /tmp/files-seed

COPY files/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 445
CMD ["/entrypoint.sh"]
