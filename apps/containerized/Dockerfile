# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# ── Stage 2: Production ──
FROM node:20-alpine AS production
LABEL org.opencontainers.image.source="https://github.com/MarkusIsaksson1982/fullstack-containerized"
LABEL org.opencontainers.image.description="Layer 9 — Full Stack Observatory"

WORKDIR /app
ENV NODE_ENV=production

# Non-root user (security best practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy only application source (not node_modules, not dev files)
COPY src ./src
COPY package.json .
COPY healthcheck.js .

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node healthcheck.js

USER appuser
EXPOSE 3000

CMD ["node", "src/server.js"]
