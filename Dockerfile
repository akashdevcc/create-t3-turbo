ARG NODE_VERSION=20.10

# Alpine image
FROM node:${NODE_VERSION}-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat

# Setup pnpm and turbo on the alpine base
FROM alpine as base
RUN npm install pnpm@8.15.0 turbo@1.12.3 --global
RUN pnpm config set store-dir ~/.pnpm-store

# Prune app projects
FROM base AS pruner
ARG SCOPE
ARG APP

WORKDIR /app
COPY . .
RUN turbo prune --scope=${SCOPE}/${APP} --docker

# Build the app project
FROM base AS builder
ARG SCOPE
ARG APP

WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN turbo build --filter=${SCOPE}/${APP}
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src

# Final image
FROM alpine AS runner
ARG APP

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app .
WORKDIR /app/apps/${APP}

ARG PORT=3000
ENV PORT=${PORT}
ENV NODE_ENV=production
ENV MAIN=dist/index.js

EXPOSE ${PORT}

CMD node ${MAIN}
