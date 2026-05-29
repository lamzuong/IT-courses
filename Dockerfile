# ───── Stage 1: builder — install deps and build the app ─────
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source and build
COPY . .
RUN npm run build

# ───── Stage 2: runner — tiny image with only what runs ─────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# The app listens on 8888 (see package.json)
ENV PORT=8888
ENV HOSTNAME=0.0.0.0

# Copy the self-contained server, static assets, and public files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8888
CMD ["node", "server.js"]
