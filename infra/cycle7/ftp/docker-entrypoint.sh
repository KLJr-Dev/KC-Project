#!/bin/sh
set -eu
# PASV advertised address — must match how clients reach the host (localhost vs Host-Only IP).
addr="${PASV_ADDRESS:-127.0.0.1}"
conf=/etc/vsftpd/vsftpd.conf
if grep -q '^pasv_address=' "$conf"; then
  sed -i "s/^pasv_address=.*/pasv_address=${addr}/" "$conf"
else
  echo "pasv_address=${addr}" >> "$conf"
fi
exec /usr/sbin/vsftpd "$conf"
