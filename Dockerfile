# =============================================================================
# Churro Chat - Dockerfile
# =============================================================================
# Multi-stage build supporting both development and production environments
#
# Usage:
#   Development: docker build --target development -t churro-chat:dev .
#   Production:  docker build --target production -t churro-chat:prod .
# =============================================================================

# -----------------------------------------------------------------------------
# Base stage - shared dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies needed for node-gyp (some npm packages require this)
RUN apk add --no-cache libc6-compat

# -----------------------------------------------------------------------------
# Dependencies stage - install node modules
# -----------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# -----------------------------------------------------------------------------
# Development stage - for local development with hot reload
# -----------------------------------------------------------------------------
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Expose Vite's default dev server port
EXPOSE 3000

# Run dev server with host flag to allow external connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# -----------------------------------------------------------------------------
# Build stage - compile the application
# -----------------------------------------------------------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# -----------------------------------------------------------------------------
# Production stage - minimal image for serving static files
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Install a lightweight static file server
RUN npm install -g serve@14

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 churro

# Copy built assets from builder stage
COPY --from=builder --chown=churro:nodejs /app/build ./build

USER churro

# Expose the production server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Serve the static build
CMD ["serve", "-s", "build", "-l", "3000"]
