### Build Stage

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies required for Prisma
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . . 

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

### Production Stage

FROM node:20-alpine AS production

ENV NODE_ENV=production

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

