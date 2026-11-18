FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

RUN npm ci --workspace=shared --workspace=server

COPY shared/ ./shared/
COPY server/ ./server/
COPY tsconfig.base.json ./

RUN npm run build -w shared
RUN npm run build -w server

FROM node:20-slim AS runner

WORKDIR /app

# Install Chromium for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

RUN npm ci --workspace=shared --workspace=server --omit=dev

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist
COPY server/src/modules/ats/data ./server/dist/modules/ats/data

EXPOSE 5000

CMD ["node", "server/dist/index.js"]
