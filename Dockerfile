# syntax=docker/dockerfile:1

###############################################################################
# Stage 1 - build client + server
###############################################################################
FROM node:20-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev) using the workspace manifests.
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm ci

# Copy sources and build both workspaces.
COPY . .
RUN npm run build

# Remove dev dependencies so we can copy a lean, production-only node_modules
# into the runtime image. Workspace deps are hoisted to the root node_modules.
RUN npm prune --omit=dev

###############################################################################
# Stage 2 - minimal runtime image
###############################################################################
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# su-exec lets the entrypoint drop from root to the node user after fixing
# ownership of bind-mounted volumes.
RUN apk add --no-cache su-exec

# Production dependencies (hoisted at the root by npm workspaces).
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Compiled server and built client.
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/client/dist ./client/dist

# Seed default config so the app works on first boot when the mounted config
# volume is empty. The server also self-heals missing files at startup.
COPY --from=builder /app/config ./config

# Runtime data directories + entrypoint. Ownership of bind-mounted volumes is
# fixed at startup by the entrypoint (see docker-entrypoint.sh).
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p /app/config /app/storage/images \
  && chown -R node:node /app

EXPOSE 3000

# Basic container healthcheck against the API.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+ (process.env.PORT||3000) +'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Starts as root so the entrypoint can chown the mounted volumes, then drops
# to the unprivileged "node" user before running the server.
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server/dist/index.js"]
