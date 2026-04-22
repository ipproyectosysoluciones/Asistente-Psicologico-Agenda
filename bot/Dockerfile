FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema (Chrome para WPPConnect)
RUN apk add --no-cache \
    chromium \
    ca-certificates \
    ttf-freefont \
    font-noto \
    font-noto-emoji

# Configurar Chrome para modo headless
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    CHROME_BIN=/usr/bin/chromium

COPY bot/package.json bot/pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod

COPY bot/ ./

# Crear directorio de tokens
RUN mkdir -p /app/tokens

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["pnpm", "start"]