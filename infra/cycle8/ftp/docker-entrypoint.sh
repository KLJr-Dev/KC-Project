#!/bin/sh
set -eu
# CYCLE8: PASV address for Host-Only / LAN (see CYCLE8_FTP_PASV_ADDRESS).
addr="${PASV_ADDRESS:-127.0.0.1}"
conf=/etc/vsftpd/vsftpd.conf
if grep -q '^pasv_address=' "$conf"; then
  sed -i "s/^pasv_address=.*/pasv_address=${addr}/" "$conf"
else
  echo "pasv_address=${addr}" >> "$conf"
fi
# Ensure www mount is writable by lisa
mkdir -p /var/www/html
chown -R lisa:lisa /var/www/html /home/lisa
exec /usr/sbin/vsftpd "$conf"
