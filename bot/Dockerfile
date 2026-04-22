FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libsodium-dev \
    libwebp-dev \
    wget \
    openssl \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]