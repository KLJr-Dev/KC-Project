FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    postgresql-client \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY seed ./seed
COPY exports ./exports
COPY private ./private
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# CYCLE9-PLANT: export base + out-of-tree F3 path (see exports/README.md)
ENV PORT=8000
ENV EXPORT_ROOT=/app/exports
ENV F3_FLAG_PATH=/app/private/onboarding-export.flag
EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
