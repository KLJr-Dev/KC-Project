# Host: ftp-warehouse.northwind.lab — internal warehouse FTP
FROM alpine:3.20

RUN apk add --no-cache vsftpd bash \
  && adduser -D -s /sbin/nologin warehouse \
  && echo "warehouse:${FTP_PASSWORD:-NwFtp-ChangeMe-7a2d9c!}" | chpasswd \
  && mkdir -p /var/ftp/pub \
  && printf '%s\n' 'Warehouse receiving drop — internal use only' \
    > /var/ftp/pub/README \
  && cat > /etc/vsftpd/vsftpd.conf <<'EOF'
listen=YES
listen_ipv6=NO
anonymous_enable=NO
local_enable=YES
write_enable=NO
chroot_local_user=YES
allow_writeable_chroot=YES
pasv_enable=YES
pasv_min_port=30000
pasv_max_port=30009
seccomp_sandbox=NO
EOF

EXPOSE 21
CMD ["/usr/sbin/vsftpd", "/etc/vsftpd/vsftpd.conf"]
