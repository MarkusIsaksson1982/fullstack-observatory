# ================================================
# Stage 1: Dependencies
# ================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json* turbo.json ./

# Copy workspace package.json files
COPY packages/metrics/package.json ./packages/metrics/
COPY apps/api-server/package.json ./apps/api-server/

RUN npm ci --omit=dev --ignore-scripts --prefer-offline

# ================================================
# Stage 2: Production
# ================================================
FROM node:20-alpine AS runner

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy the full application source + shared package
COPY apps/api-server ./apps/api-server
COPY packages/metrics ./packages/metrics

WORKDIR /app/apps/api-server

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Healthcheck (uses your existing /api/health route)
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]