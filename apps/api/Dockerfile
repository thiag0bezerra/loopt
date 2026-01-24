# Build stage
FROM node:22-alpine AS builder

# Enable Corepack for pnpm
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/worker/package.json ./apps/worker/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the API
RUN pnpm turbo run build --filter=@loopt/api

# Prune dev dependencies for production
RUN pnpm prune --prod

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Copy the entire workspace structure needed for production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Set environment
ENV NODE_ENV=production

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/main"]
