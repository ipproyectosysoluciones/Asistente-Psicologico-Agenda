# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY dashboard/package.json dashboard/pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY dashboard/ ./
RUN pnpm run build

# Production stage with nginx
FROM nginx:alpine

# Copiar build static
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración nginx
RUN rm /etc/nginx/conf.d/default.conf

# nginx config para SPA
RUN cat > /etc/nginx/conf.d/app.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

EOF

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]