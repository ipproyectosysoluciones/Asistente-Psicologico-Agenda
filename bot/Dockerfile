FROM node:20-alpine

WORKDIR /app

COPY bot/package.json bot/pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile --ignore-scripts

COPY bot/ ./

RUN mkdir -p /app/tokens

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "src/index.js"]