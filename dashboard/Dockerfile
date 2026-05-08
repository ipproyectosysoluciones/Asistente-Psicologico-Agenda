# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@10 && pnpm install --frozen-lockfile

COPY . ./

ARG VITE_CLINIC_NAME
ARG VITE_CLINIC_TAGLINE
ARG VITE_CLINIC_ADDRESS
ARG VITE_CLINIC_PHONE
ARG VITE_CLINIC_EMAIL
ARG VITE_WHATSAPP_NUMBER
ARG VITE_API_URL
# VITE_AUTH_USER, VITE_AUTH_PASS, VITE_JWT_SECRET removed — auth is now server-side via n8n
ENV VITE_CLINIC_NAME=$VITE_CLINIC_NAME \
    VITE_CLINIC_TAGLINE=$VITE_CLINIC_TAGLINE \
    VITE_CLINIC_ADDRESS=$VITE_CLINIC_ADDRESS \
    VITE_CLINIC_PHONE=$VITE_CLINIC_PHONE \
    VITE_CLINIC_EMAIL=$VITE_CLINIC_EMAIL \
    VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER \
    VITE_API_URL=$VITE_API_URL

RUN pnpm run build

# Production stage with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Default for local docker-compose; override in Railway with:
# N8N_INTERNAL_URL=http://n8n.railway.internal:5678
ENV N8N_INTERNAL_URL=http://n8n:5678

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["/bin/sh", "-c", "envsubst '${N8N_INTERNAL_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
