# Cycle-7 — internal jump (F5). No host port publish — bastion tunnel only.
# HTTP basic-auth intranet stand-in for Win-ish flavor (ADR-035 / decisions).
FROM nginx:1.27-alpine

RUN apk add --no-cache apache2-utils \
  && htpasswd -bc /etc/nginx/htpasswd nwops 'Ops1ntranet'

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY html/ /usr/share/nginx/html/

EXPOSE 8080
