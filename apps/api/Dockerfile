# syntax=docker/dockerfile:1.7
# Build context: the repository root (the API depends on workspace packages).
#   docker build -f apps/api/Dockerfile -t origo-api .

FROM node:22.21-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN npm install -g pnpm@10.18.3 && \
    apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /repo

# ---- Dependencies: only manifests first, so code changes don't bust this layer
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/api/prisma apps/api/prisma
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "@origo/api..." --ignore-scripts && \
    pnpm --filter @origo/api exec prisma generate

# ---- Build shared + API, then produce a self-contained production folder
FROM deps AS build
COPY packages packages
COPY apps/api apps/api
RUN pnpm --filter @origo/shared build && \
    pnpm --filter @origo/api build && \
    pnpm --filter @origo/api deploy --prod --legacy /out && \
    cd /out && node_modules/.bin/prisma generate

# ---- Runtime: no build tools, non-root
FROM node:22.21-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production PORT=4000
WORKDIR /app
COPY --from=build --chown=node:node /out ./
# Mount point for the shared label-PDF volume; a new named volume inherits this ownership.
RUN mkdir -p /app/var/label-exports && chown -R node:node /app/var
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4000/api/v1/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "dist/main.js"]
