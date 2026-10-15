FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    postgresql-client \
    gosu \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --gid 1001 intake \
  && useradd --uid 1001 --gid intake --shell /usr/sbin/nologin --create-home intake

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY seed ./seed
COPY exports ./exports
COPY private ./private
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && chown -R intake:intake /app/exports /app/private

ENV PORT=8000
ENV EXPORT_ROOT=/app/exports
EXPOSE 8000

# Entrypoint starts as root for seed/grants, then su-exec to intake.
ENTRYPOINT ["/entrypoint.sh"]
