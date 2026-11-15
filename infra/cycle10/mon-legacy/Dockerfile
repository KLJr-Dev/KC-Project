# Host: mon-legacy.northwind.lab — legacy status page
FROM alpine:3.20

RUN apk add --no-cache busybox-extras bash \
  && mkdir -p /www \
  && printf '%s\n' \
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>' \
    '<title>Northwind Traders — Legacy Monitor</title>' \
    '<style>body{font-family:Segoe UI,sans-serif;margin:40px;color:#152028;background:#e8edf0}' \
    'h1{font-size:22px}p{color:#5a6872;max-width:36em}code{font-size:12px}</style></head>' \
    '<body><h1>Northwind Traders — Legacy Monitor</h1>' \
    '<p>Status collector for warehouse sensors — retired 2024. Do not page on alerts from this host.</p>' \
    '<p><code>mon-legacy.northwind.lab</code> · internal CORP</p></body></html>' \
    > /www/index.html

EXPOSE 8080
CMD ["httpd", "-f", "-p", "8080", "-h", "/www"]
