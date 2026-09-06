// prisma/db-ping.ts
//
// Answers one question — can this machine talk to the database, and which one?
//
//   npm run db:ping
//
// Worth having because every other failure mode looks the same from the app: a
// blocked port, a suspended compute, a stale password and a missing column all
// surface as "something went wrong in a server component". This checks both
// endpoints separately, so a pooled URL that works while the direct one does
// not (or the reverse) is visible immediately rather than inferred.

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const TIMEOUT_MS = 10_000;

async function probe(label: string, url: string | undefined) {
  if (!url) {
    console.log(`${label.padEnd(13)} not set`);
    return;
  }

  let host = "(unparseable connection string)";
  try {
    host = new URL(url).host;
  } catch {
    // Keep the placeholder: a malformed URL is itself the finding.
  }

  const pool = new pg.Pool({
    connectionString: url,
    connectionTimeoutMillis: TIMEOUT_MS,
  });

  const started = Date.now();

  try {
    const { rows } = await pool.query(
      "select current_database() as db, version() as version",
    );
    const ms = Date.now() - started;
    const server = String(rows[0].version).split(" ").slice(0, 2).join(" ");
    console.log(`${label.padEnd(13)} ok    ${host}  ${rows[0].db}  ${server}  ${ms}ms`);
  } catch (err) {
    const code = (err as { code?: string })?.code ?? "";
    const message = (err as Error)?.message ?? String(err);
    console.log(`${label.padEnd(13)} FAIL  ${host}  ${code} ${message}`);
  } finally {
    await pool.end().catch(() => {});
  }
}

async function main() {
  await probe("DATABASE_URL", process.env.DATABASE_URL);
  await probe("DIRECT_URL", process.env.DIRECT_URL);

  console.log(
    "\nETIMEDOUT here means the host or port 5432 is unreachable from this " +
      "network.\nECONNREFUSED means something answered and said no. " +
      "28P01 is a wrong password.",
  );
}

main();
