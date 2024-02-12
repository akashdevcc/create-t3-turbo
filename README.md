# Sparta - Monorepo of Spartan Solar

## Description

This will be the monorepo of the next-gen application architecture for Spartan Solar.

## Structure

This monorepo uses [Turborepo](https://turbo.build/repo) _(a high-performance build system for JavaScript and TypeScript codebases)_.

The monorepo has project structure as follows:

```text
.github
  └─ workflows
     └─ CI with pnpm cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  ├─ expo
  |  ├─ Expo SDK 49
  |  ├─ React Native using React 18
  |  ├─ Navigation using Expo Router
  |  ├─ Tailwind using Nativewind
  |  └─ tRPC 11 - E2E Typesafe API client
  ├─ nextjs
  |  ├─ Next.js 14
  |  ├─ React 18
  |  ├─ Tailwind CSS
  |  └─ tRPC 11 - E2E Typesafe API Server & Client
  └─ server
     ├─ Fastify 4
     └─ tRPC 11 - E2E Typesafe API Server
packages
  ├─ api
  |  └─ tRPC v11 router definition
  ├─ db
  |  └─ Typesafe SQL DB calls using Drizzle
  ├─ logging
  |  └─ Logging for server apps using pino
  ├─ native
  |  └─ ReactNative UI package for the expoapp
  ├─ schema
  |  └─ Schema for SQL DB
  ├─ validators
  |  └─ Zod Validators to be used accross the apps
  └─ web
     └─ Start of a UI package for the webapp using shadcn-ui
tooling
  ├─ eslint
  |  └─ shared, fine-grained, eslint presets
  ├─ prettier
  |  └─ shared prettier configuration
  ├─ tailwind
  |  └─ shared tailwind configuration
  └─ typescript
     └─ shared tsconfig you can extend from
```

## Quick Start

To get it running, follow the steps below:

### 1. Prerequisites

- Docker Desktop or Docker Engine
- Node v20.10.0

  Use a "Node Version Manager (NVM)"

  - For Windows: nvm-windows ([Download Setup](https://github.com/coreybutler/nvm-windows/releases/download/1.1.12/nvm-setup.exe))
  - For Ubuntu: nvm-sh ([Installing and Updating](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating))

- NPM
- PNPM v8.15.0 ([Install using npm](https://pnpm.io/installation#using-npm))

  ```bash
  npm install -g pnpm@8.15.0
  ```

### 2. Clone the repository

Clone this repository to your machine by your preferred method (HTTPS / SSH / GitHub CLI).

### 3. Setup dependencies

```bash
# Install dependencies
pnpm i
```

### 4. Configure environment variables for development

```bash
# There is an `.env.example` in the root directory you can use for reference
cp .env.example .env
```

Replace with the below environment variable values for development:

```bash
DB_HOST='localhost'
DB_NAME='post_db'
DB_USERNAME='johndoe'
DB_PASSWORD='john123'
```

### 5. Development Workflow

Both frontend and backend development workflow supports "Hot Reload", so developers will not have to restart the scripts to reflect their development changes.

#### A. For Frontend Development

- Start "Docker Desktop" or "Docker Engine", if not already running.
- Run below command to start the backend server:

  ```bash
  docker compose -f docker-compose-db.yml  -f docker-compose-server.yml up
  ```

- Run the `dev` script of your frontend app:

  ```bash
  pnpm -F <app-name> dev
  ```

  Replace `<app-name>` with your app name.

  For example, if the project has two frontend apps, like shown below:

  ```text
  apps
  ├─ expo             # Frontend App
  ├─ nextjs           # Frontend App
  └─ server           # Backend App
  ```

  The commands for respective apps will be as follows:

  ```bash
  pnpm -F expo dev
  pnpm -F nextjs dev
  ```

#### B. For Backend Development

- Start "Docker Desktop" or "Docker Engine", if not already running.
- Run below command to start the database:

  ```bash
  docker compose -f docker-compose-db.yml up
  ```

- Run the `dev` script of your backend app:

  ```bash
  pnpm -F <app-name> dev
  ```

  Replace `<app-name>` with your app name.

  For example, if the project has one backend app, like shown below:

  ```text
  apps
  ├─ expo             # Frontend App
  ├─ nextjs           # Frontend App
  └─ server           # Backend App
  ```

  The commands for respective apps will be as follows:

  ```bash
  pnpm -F server dev
  ```

## Generated from t3-oss/create-t3-turbo

This monorepo is an fork and upgraded version of [t3-oss/create-t3-turbo](https://github.com/t3-oss/create-t3-turbo).

Read more about it [here](https://github.com/t3-oss/create-t3-turbo/blob/main/README.md).
