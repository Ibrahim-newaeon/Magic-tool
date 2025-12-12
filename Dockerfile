# ===========================================
# New Aeon Magic Apps - Docker Configuration
# ===========================================
# Includes all commits:
# - Background upload for gallery templates
# - Wizard redesign with improved UX
# - Animation Mode with format selector
# - Fresh modern UI
# - Ready-made template upload
# - Docker deployment support
# ===========================================

# ---- Base Stage ----
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# ---- Dependencies Stage ----
FROM base AS deps
RUN npm ci --legacy-peer-deps

# ---- Development Stage ----
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Expose development port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1

# Start development server
CMD ["npm", "run", "dev"]

# ---- Build Stage ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app

# Install serve for static file serving
RUN npm install -g serve

# Copy built assets
COPY --from=builder /app/dist ./dist

# Expose production port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "8080"]
