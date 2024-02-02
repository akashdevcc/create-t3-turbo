import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import fp from "fastify-plugin";

import type { AppRouter } from "@acme/api";
import { appRouter } from "@acme/api";

import { createContext } from "./context.mjs";

export default fp<FastifyTRPCPluginOptions<AppRouter>>(async (fastify) => {
  fastify.register(fastifyTRPCPlugin, {
    prefix: "/api/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        // report to error monitoring
        console.error(`Error in tRPC handler on path '${path}':`, error);
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  });
});
