FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN npm install -g pnpm@10 && pnpm install --frozen-lockfile --ignore-scripts

COPY . ./

RUN mkdir -p /app/bot_sessions && chmod +x /app/scripts/start.sh

# 3000: BuilderBot HTTP API (/v1/messages) — internal only
# 3001: Health check — Railway maps PORT to this
EXPOSE 3000 3001

ENV PORT=3001 \
    BOT_API_PORT=3000 \
    BOT_SESSION_PATH=/app/bot_sessions

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

CMD ["/bin/sh", "/app/scripts/start.sh"]
