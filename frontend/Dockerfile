# M8 / v2.0.0 — Frontend image (non-root runtime).
#
# Security: CWE-250 — Next.js starts as the unprivileged `node` user.
FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_ENABLE_LAB_UI=false
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ENABLE_LAB_UI=$NEXT_PUBLIC_ENABLE_LAB_UI
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["npm", "start"]
