# CYCLE10-PLANT — edge (DMZ). SoftDev B7 — weak HTTPS terminate.
FROM nginx:1.27-alpine

RUN apk add --no-cache openssl \
  && mkdir -p /etc/nginx/certs /usr/share/nginx/html/.well-known \
  # Self-signed, long-lived — SoftDev "HTTPS present but weak" (no HSTS, TLS1.2+old ciphers)
  && openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
       -keyout /etc/nginx/certs/edge.key \
       -out /etc/nginx/certs/edge.crt \
       -subj '/CN=edge.northwind.lab/O=Northwind Traders/C=US'

COPY nginx.conf /etc/nginx/nginx.conf
COPY html/ /usr/share/nginx/html/

EXPOSE 443
