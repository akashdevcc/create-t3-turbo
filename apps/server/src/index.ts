// import path, { join } from "path";
// import { fileURLToPath } from "url";
// import autoLoad from "@fastify/autoload";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify from "fastify";

import { appRouter } from "@acme/api";

import { createContext } from "./plugins/trpc/context.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
});

// fastify.register(autoLoad, {
//   dir: join(__dirname, "plugins"),
// });

// fastify.register(autoLoad, {
//   dir: join(__dirname, "routes"),
// });

void fastify.register(fastifyTRPCPlugin, {
  prefix: "/api/trpc",
  trpcOptions: { router: appRouter, createContext },
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
