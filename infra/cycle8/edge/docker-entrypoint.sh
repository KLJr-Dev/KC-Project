#!/bin/sh
# CYCLE8: edge entrypoint — keep www writable for FTP uploads; run PHP as ops.
set -eu
mkdir -p /var/www/html
chmod 777 /var/www/html
# Ensure plants survive volume mount covering html/
if [ ! -f /var/www/html/index.php ]; then
  echo '<?php echo "Northwind www\\n"; ?>' > /var/www/html/index.php
fi
exec su -s /bin/sh ops -c 'php83 -S 0.0.0.0:8080 -t /var/www/html'
