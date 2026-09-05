# ==========================================
# Stage 1 - Dependencies
# ==========================================
FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm ci


# ==========================================
# Stage 2 - Build
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules

COPY package*.json ./
COPY prisma ./prisma
COPY src ./src
COPY .swcrc ./
COPY prisma7.config.ts ./

# Generate Prisma Client
RUN npx prisma generate --config prisma7.config.ts

# Build application + generated Prisma Client
RUN npm run build


# ==========================================
# Stage 3 - Production
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./

# Production dependencies
RUN npm ci --omit=dev

# Prisma migration files
COPY --from=builder /app/prisma ./prisma

# Prisma config
COPY --from=builder /app/prisma7.config.ts ./

# Compiled application
COPY --from=builder /app/dist ./dist

EXPOSE 6001

CMD ["sh", "-c", "npx prisma migrate deploy --config prisma7.config.ts && node dist/config/server.js"]