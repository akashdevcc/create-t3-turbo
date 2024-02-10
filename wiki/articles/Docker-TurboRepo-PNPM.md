# Optimized multi-stage Docker builds with TurboRepo and PNPM for NodeJS microservices in a monorepo

> Original Source: [Optimized multi-stage Docker builds with TurboRepo and PNPM for NodeJS microservices in a monorepo](https://fintlabs.medium.com/optimized-multi-stage-docker-builds-with-turborepo-and-pnpm-for-nodejs-microservices-in-a-monorepo-c686fdcf051f)

---

> In the world of microservices and monorepos, optimizing Docker builds is crucial for efficiency and performance.

## Introduction

[Multi-stage Docker builds](https://docs.docker.com/build/building/multi-stage) is a powerful technique to create lightweight and efficient containers. But it can be tricky to get an optimized **Dockerfile** for a microservice when **TurboRepo** and **PNPM** are also involved. In this article, we’ll explore how to harness the power of multi-stage builds with [TurboRepo](https://turbo.build/repo) and [PNPM](https://pnpm.io/) to streamline your **NodeJS** microservice build process in a monorepo.

## The Goal

We want to have a single **Dockerfile** that we can use to build every NodeJS-based microservice in our monorepo. It must comply with the following requirements:

- Use build arguments to customize the build (NodeJS version, project to build, port to expose) so that it can be used for any project
- Install only the required dependencies for a particular microservice
- Build only the source code (and dependency packages) for a particular microservice
- Generate a lightweight Docker image with minimum required dependencies and bundle

## Prerequisites

- You have Docker installed and [BuildKit](https://docs.docker.com/build/buildkit/) enabled.
- A monorepo managed with TurboRepo or you know how to set up a new one. If not, you can read more [here](https://turbo.build/repo/docs/getting-started/create-new).
- You know how to get your head around PNPM Workspaces. If not, you can read more [here](https://pnpm.io/workspaces) and [here](https://turbo.build/repo/docs/handbook/workspaces).

## Final multi-stage Dockerfile

Multi-stage builds allow us to create optimized Docker images by breaking down the build process into multiple stages. Each stage focuses on a specific aspect of the build, resulting in smaller and faster containers. For microservices in a monorepo, this is a game-changer.

Let’s see how we can achieve our goal using the following Dockerfile:

```sh
ARG NODE_VERSION=18.18.0

# Alpine image
FROM node:${NODE_VERSION}-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat

# Setup pnpm and turbo on the alpine base
FROM alpine as base
RUN npm install pnpm turbo --global
RUN pnpm config set store-dir ~/.pnpm-store

# Prune projects
FROM base AS pruner
ARG PROJECT

WORKDIR /app
COPY . .
RUN turbo prune --scope=${PROJECT} --docker

# Build the project
FROM base AS builder
ARG PROJECT

WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN turbo build --filter=${PROJECT}
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src

# Final image
FROM alpine AS runner
ARG PROJECT

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app .
WORKDIR /app/apps/${PROJECT}

ARG PORT=8080
ENV PORT=${PORT}
ENV NODE_ENV=production
EXPOSE ${PORT}

CMD node dist/main
```

## Explanation of significant steps

Let’s go through the file to understand what each stage is doing.

## Build arguments

First of all, to have a single Dockerfile that can be used to build multiple projects we need to leverage Docker build arguments. These are:

- `NODE_VERSION` — Optional. Specifies base image version. BTW here we are using an `alpine` image to get the thinnest possible final image.
- `PROJECT` — Required. Specifies the project that needs to be built.
- `PORT` — Optional. Specifies the port that the Docker image exposes.

## Base image for build

```sh
# Setup pnpm and turbo on the alpine base
FROM alpine as base
RUN npm install pnpm turbo --global
RUN pnpm config set store-dir ~/.pnpm-store
```

Here we take the `alpine` image as a base. Install `turbo` and `pnpm` globally using npm. Configure the store directory of `pnpm` to use it later for caching.

## Pruning

```sh
RUN turbo prune --scope=${PROJECT} --docker
```

Explanation of this command is taken from the official [docs](https://turbo.build/repo/docs/reference/command-line-reference/prune) for TurboRepo:

The `prune` command will generate a folder called `out` with the following inside of it:

- A folder `json` with the pruned workspace's `package.json` files.
- A folder `full` with the pruned workspace's full source code, but only including the internal packages that are needed to build the target.
- A new pruned lockfile that only contains the pruned subset of the original root lockfile with the dependencies that are actually used by the packages in the pruned workspace.

## Installing dependencies

```sh
# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile
```

This piece copies the pruned lockfile, `package.json` files of the pruned workspace and installs both **devDependencies** and **dependencies**.

`RUN` command also uses the specialized cache mount feature of **BuildKit**.

## Building

```sh
# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN turbo build --filter=${PROJECT}
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src
```

Here we `COPY` the pruned source code from the previous `pruner` image.

In the first `RUN` command, we use `turbo build` by specifying the target project. It first builds all dependencies, then builds the target project itself.

The second `RUN` command uses `pnpm prune --prod` to remove **devDependencies** from `node_modules` as we don’t need them anymore.

The last `RUN` command removes all `src` folders, so that source files will not be copied to the final image.

## Final production image

```sh
# Final image
FROM alpine AS runner
ARG PROJECT

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app .
WORKDIR /app/apps/${PROJECT}

ARG PORT=8080
ENV PORT=${PORT}
ENV NODE_ENV=production
EXPOSE ${PORT}

CMD node dist/main
```

For the final image, we are using a node-alpine base image with minimal dependencies installed.

Next, we create a non-root user for our container as it is not a good idea to run containers as root.

```sh
COPY --from=builder --chown=nodejs:nodejs /app .
WORKDIR /app/apps/${PROJECT}
```

This piece copies the bundled version of our app and its dependencies from the previous stage and sets the current working directory to the folder of the target microservice specified as `PROJECT` argument during the build.

It is a good idea to `EXPOSE` the port on which your service listens as some reverse proxy tools rely on this information.

Another best practice is to set `NODE_ENV=production` for your production images.

You can build the final image using the following command

```sh
docker build -t api:latest --build-arg PROJECT=api .
```

where **api** is your microservice’s name.

## Conclusion

Multi-stage Docker builds, in combination with **TurboRepo** and **PNPM**, provide a powerful solution for microservices within a monorepo. By adopting techniques provided in this article, you’ll witness significant improvements:

- Smaller Docker images, reducing storage and network costs
- Faster build times due to optimized layers and caching
- Efficient use of resources in a monorepo setup
- Enhanced security and overall performance of the containers

Embrace this approach to level up your microservices game in your monorepo.

If you found this article helpful, please clap the button 👏 below and Follow us for more quality content like this.

Thanks for reading!
