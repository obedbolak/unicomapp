// lib/prisma.ts
//
// The single Prisma client the app shares.
//
// The transport lives in lib/db-adapter.ts — port 5432 by default, with
// `DB_TRANSPORT=neon` switching to Neon's WebSocket driver on 443. See that
// file for why the default is what it is, and DATABASE.md for how to measure
// which one this network actually wants.

import { PrismaClient } from "@prisma/client";
import { createAdapter } from "@/lib/db-adapter";

const connectionString = process.env.DATABASE_URL ?? "";

const prismaClientSingleton = () =>
  new PrismaClient({ adapter: createAdapter(connectionString) });

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;
export { prisma };

// Dev only. Next's hot reload re-evaluates this module on every edit, and a
// fresh client per edit leaks connections until the pool is exhausted.
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
