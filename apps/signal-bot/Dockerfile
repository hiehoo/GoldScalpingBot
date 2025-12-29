# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json ./

# Install dependencies using npm (simpler for standalone deployment)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set timezone for SAST
RUN apk add --no-cache tzdata
ENV TZ=Africa/Johannesburg

# Copy package files
COPY package.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 botuser
USER botuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Start the bot
CMD ["node", "dist/index.js"]
