# CYCLE10-NOISE — mon-legacy (CORP). Fake nagios-ish HTTP.
FROM alpine:3.20

RUN apk add --no-cache busybox-extras bash \
  && mkdir -p /www \
  && printf '%s\n' \
    '<html><body><h1>Northwind Legacy Mon</h1>' \
    '<p>CYCLE10-NOISE — no graded path</p></body></html>' \
    > /www/index.html

EXPOSE 8080
CMD ["httpd", "-f", "-p", "8080", "-h", "/www"]
