// import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

import { createTRPCContext } from "@acme/api";

export function createContext() {
  return createTRPCContext();
}

export type Context = Awaited<ReturnType<typeof createContext>>;
