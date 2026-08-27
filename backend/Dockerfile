# M8 / v2.0.0 — Backend image (non-root runtime).
#
# Security: CWE-250 — process runs as `node` via su-exec after chown on uploads/.
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache su-exec
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Cycle-7 Ops Documents library + LFI plants (intentional tip); absent/irrelevant on Blue.
COPY ops-docs ./ops-docs
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p /app/uploads \
  && chown -R node:node /app
EXPOSE 4000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
