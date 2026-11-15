# Host: edge.northwind.lab — weak HTTPS :8443 → :443
# TLS1.2 + legacy ciphers, server_tokens on, no HSTS (v1 posture).
# Proxies /api → api:4000 and / → portal:3000 when product is on net_app.
FROM nginx:1.27-alpine

RUN apk add --no-cache openssl \
  && mkdir -p /etc/nginx/certs /usr/share/nginx/html/.well-known \
  && openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
       -keyout /etc/nginx/certs/edge.key \
       -out /etc/nginx/certs/edge.crt \
       -subj '/CN=edge.northwind.lab/O=Northwind Traders/C=US'

COPY nginx.conf /etc/nginx/nginx.conf
COPY html/ /usr/share/nginx/html/

EXPOSE 443
