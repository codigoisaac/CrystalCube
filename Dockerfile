### Build Stage

FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies required for Prisma
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install dependencies
RUN pnpm install --frozen-lockfile

COPY . . 

RUN npx prisma generate
RUN pnpm run build
RUN pnpm prune --prod

### Production Stage

FROM node:20-alpine AS production

ENV NODE_ENV=production

# Install pnpm in production stage
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Install only production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

# Copy Prisma files needed for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Add execute permission to the startup script
RUN chmod +x /docker-entrypoint.sh

# Transfer ownership of all the files to the non-root user and group we created above
RUN chown -R nestjs:nodejs /app

# Switch to running as the non-root user
USER nestjs

EXPOSE 3333

# Start the application using the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]