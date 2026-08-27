# Cycle-8 edge — webroot + revshell host + sudo nano (F3/F4). CYCLE8-PLANT
# Playable PHP built-in server as ops (no graded OpenSSH).
FROM alpine:3.20

RUN apk add --no-cache php83 php83-cli bash sudo nano curl \
  && adduser -D -s /bin/bash ops \
  && echo 'ops:ops' | chpasswd \
  && mkdir -p /var/www/html /home/ops /root \
  && echo 'ops ALL=(root) NOPASSWD: /usr/bin/nano' > /etc/sudoers.d/ops-nano \
  && chmod 440 /etc/sudoers.d/ops-nano

COPY html/index.php /var/www/html/index.php
COPY home/user.txt /home/ops/user.txt
COPY root/root.txt /root/root.txt
COPY root/samba-hint.txt /root/samba-hint.txt
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && chown -R ops:ops /home/ops \
  && chmod 644 /home/ops/user.txt \
  && chmod 600 /root/root.txt /root/samba-hint.txt \
  && chmod 777 /var/www/html \
  && chown ops:ops /var/www/html/index.php

EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
