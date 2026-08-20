# syntax=docker/dockerfile:1

# ---- Build stage ----
# Full toolchain (pnpm, dev dependencies) exists only here.
# pnpm is pinned via the packageManager field (corepack) so the
# container resolves the exact same dependency tree as local/CI.
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- Runtime stage ----
# Production image: no dev dependencies, no source, no pnpm.
# Serves the hybrid build (static assets + on-demand routes) via the
# Node adapter in standalone mode.
FROM node:22-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build --chown=app:app /app/dist ./dist
# The standalone server imports from installed production modules.
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/package.json ./package.json

USER app

ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
