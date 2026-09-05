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
COPY .swcrc* ./

# Generate Prisma Client & Build SWC
RUN npx prisma generate
RUN npm run build

# ==========================================
# Stage 3 - Production Runner
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Membutuhkan openssl untuk Prisma
RUN apk add --no-cache openssl

COPY package*.json ./

# Install dependensi
RUN npm ci

# Copy Prisma schema/migrations saja (TIDAK PERLU copy node_modules/.prisma)
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Copy hasil build SWC (termasuk kode yang meng-import prisma client)
COPY --from=builder /app/dist ./dist

EXPOSE 6001

# Jalankan migration dulu ke Postgres, lalu jalankan server Node
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/config/server.js"]