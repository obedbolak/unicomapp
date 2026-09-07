// prisma/db-ping.ts
//
// Can this machine reach the database, over which port, and how reliably?
//
//   npm run db:ping
//
// Tests every combination of the two URLs and the three ways of reaching them,
// five attempts each, because the failure this was written for is intermittent
// and because the answer is rarely "the database is down". It is usually one
// host or one transport being worse than another, which you cannot see without
// putting them side by side.
//
// One of them — 443 over a WebSocket — is what @prisma/adapter-neon opens
// underneath, so that row is the app's real behaviour rather than a proxy for
// it.

import "dotenv/config";
import pg from "pg";
import { Pool as NeonPool, neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Five, not three. The failure this exists to catch is intermittent, and three
// samples cannot tell "usually fine" from "usually broken" — 1/3 and 3/3 are
// the same result at that sample size more often than is comfortable.
const ATTEMPTS = 5;
const TIMEOUT_MS = 10_000;

type Outcome = { ok: boolean; ms: number; detail: string };

/** Port 5432, the ordinary Postgres wire protocol. */
async function viaTcp(url: string): Promise<Outcome> {
  const pool = new pg.Pool({
    connectionString: url,
    connectionTimeoutMillis: TIMEOUT_MS,
  });
  const started = Date.now();

  try {
    const { rows } = await pool.query("select current_database() as db");
    return { ok: true, ms: Date.now() - started, detail: String(rows[0].db) };
  } catch (err) {
    return {
      ok: false,
      ms: Date.now() - started,
      detail: describeError(err),
    };
  } finally {
    await pool.end().catch(() => {});
  }
}

/**
 * Port 443 over a WebSocket — the transport the app actually uses, because
 * this is what @prisma/adapter-neon opens underneath. Test what ships, not
 * something adjacent to it.
 */
async function viaWebSocket(url: string): Promise<Outcome> {
  const pool = new NeonPool({ connectionString: url });
  const started = Date.now();

  try {
    const { rows } = await pool.query("select current_database() as db");
    return { ok: true, ms: Date.now() - started, detail: String(rows[0].db) };
  } catch (err) {
    return { ok: false, ms: Date.now() - started, detail: describeError(err) };
  } finally {
    await pool.end().catch(() => {});
  }
}

/** Port 443 over plain HTTP — Neon's other serverless mode. Not what the app
 *  uses, but a second opinion on whether 443 to this host works at all. */
async function viaHttps(url: string): Promise<Outcome> {
  const started = Date.now();
  try {
    const sql = neon(url);
    const rows = (await sql`select current_database() as db`) as {
      db: string;
    }[];
    return { ok: true, ms: Date.now() - started, detail: String(rows[0].db) };
  } catch (err) {
    return { ok: false, ms: Date.now() - started, detail: describeError(err) };
  }
}

function describeError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  const message = (err as Error)?.message ?? String(err);
  return code ? `${code} — ${message}` : message;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "(unparseable connection string)";
  }
}

async function run(name: string, url: string | undefined) {
  console.log(`\n${name}`);

  if (!url) {
    console.log("  not set");
    return;
  }

  console.log(`  host  ${hostOf(url)}`);

  for (const [transport, probe] of [
    ["5432 tcp   (node-postgres) ", viaTcp],
    ["443  ws    (the app's path)", viaWebSocket],
    ["443  http  (second opinion)", viaHttps],
  ] as const) {
    const results: Outcome[] = [];
    for (let i = 0; i < ATTEMPTS; i++) results.push(await probe(url));

    const good = results.filter((r) => r.ok);
    const times = good.map((r) => `${r.ms}ms`).join(" ");
    const label = `${good.length}/${ATTEMPTS}`;

    if (good.length === ATTEMPTS) {
      console.log(`  ${transport}  ok    ${label}  ${times}`);
    } else if (good.length > 0) {
      console.log(
        `  ${transport}  FLAKY ${label}  ${times}  · ${results.find((r) => !r.ok)!.detail}`,
      );
    } else {
      console.log(`  ${transport}  FAIL  ${label}  · ${results[0].detail}`);
    }
  }
}

async function main() {
  await run("DATABASE_URL   (the app)", process.env.DATABASE_URL);
  await run("DIRECT_URL     (prisma CLI)", process.env.DIRECT_URL);

  console.log(
    [
      "",
      "Reading this:",
      "  Compare the two URLs first, then the transports. If one HOST is",
      "  healthy on every transport and the other is not, the problem is that",
      "  hostname — point DATABASE_URL at the healthy one and move on. If one",
      "  TRANSPORT fails on both hosts, it is the port or the proxy.",
      "",
      "  Whichever row is green is the one to use. There is no prize for",
      "  preferring the pooled endpoint on a network that cannot reach it.",
      "",
      "ETIMEDOUT is unreachable; ECONNREFUSED is something answering and",
      "saying no; \"fetch failed\" is HTTPS not completing, often a proxy or",
      "TLS interception; 28P01 is a wrong password.",
      "",
    ].join("\n"),
  );
}

main();
