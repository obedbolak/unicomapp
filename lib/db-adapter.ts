// lib/db-adapter.ts
//
// Chooses how we reach Postgres.
//
// Neon is reachable two ways. The ordinary one is the Postgres wire protocol on
// port 5432, which is what node-postgres speaks. The other is Neon's own
// serverless driver, which tunnels the same protocol over a WebSocket to
// port 443.
//
// We take 443. Port 5432 is a database port, and networks treat it like one:
// office and campus firewalls filter it, some routes to it are unreliable, and
// when it fails it fails as a connect timeout — indistinguishable, from inside
// the app, from the database being down. 443 is the port the whole internet is
// built to carry, so it works from places 5432 does not. The trade is a few
// milliseconds of WebSocket setup, which is nothing against a request that
// would otherwise not complete at all.
//
// A non-Neon connection string still gets node-postgres, so a local Postgres
// works for development without anything being reconfigured.

import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import ws from "ws";

// Node 22 has a global WebSocket; Node 20 and most serverless runtimes do not.
// Setting it explicitly means the transport does not depend on which Node the
// code happens to land on — the failure that would otherwise appear only in
// production, and only as a connection error.
neonConfig.webSocketConstructor = ws;

/** Neon-hosted connection strings are the ones the serverless driver serves. */
export function isNeon(connectionString: string): boolean {
  try {
    return new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

/**
 * Builds the driver adapter for a connection string.
 *
 * Takes the string as an argument rather than reading the environment itself,
 * so a script can call it after loading its own .env — an ESM module that read
 * `process.env` at import time would be evaluated before `dotenv.config()` in
 * the file importing it, and would silently see nothing.
 */
export function createAdapter(connectionString: string) {
  if (isNeon(connectionString)) {
    return new PrismaNeon({ connectionString });
  }

  const pool = new pg.Pool({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });

  return new PrismaPg(pool as never);
}

/** "ep-dry-glade…neon.tech over 443 (Neon serverless)" — for startup logs. */
export function describeTransport(connectionString: string): string {
  let host = "unknown host";
  try {
    host = new URL(connectionString).host;
  } catch {
    // An unparseable string is a configuration problem the caller will hit
    // anyway; describing it is not the place to throw.
  }
  return isNeon(connectionString)
    ? `${host} over 443 (Neon serverless)`
    : `${host} over 5432 (node-postgres)`;
}
