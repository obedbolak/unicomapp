# Database connection

The app uses port **5432** via node-postgres. `DB_TRANSPORT=neon` switches it
to Neon's WebSocket driver on 443.

## Which endpoint

Neon gives you two hostnames for the same database:

```
ep-xxxx-pooler.<region>.aws.neon.tech   pooled, fronted by PgBouncer
ep-xxxx.<region>.aws.neon.tech          direct
```

**Use the direct one for local development.** On this network the pooled
endpoint is unreachable — `db:ping` had it at 1/5 on 5432 and 0/5 on 443, and a
WebSocket attempt failed with `AggregateError [ETIMEDOUT]` after trying all six
of its addresses. The direct endpoint answered 5/5 on 5432. Same database,
same credentials; one hostname simply does not route from here.

Keep the pooled URL for production, where connection count matters and the
network is a datacenter rather than an office.

That diagnosis took far too long because the failure is intermittent and looks
exactly like a code bug: `ETIMEDOUT` from a server component reads as "the app
is broken", not "one of two hostnames is unroutable". When a Prisma call times
out, check the hostname before you check the code.

## Why 5432 and not 443

The tempting theory is that 5432 is a database port, that networks filter it,
and that tunnelling over 443 fixes that. It is a good theory and it was wrong
here — 443 to the pooled host failed just as completely as 5432 did, because
the problem was never the port.

So the default is the transport that was measured to work. The Neon path is
kept behind `DB_TRANSPORT=neon` because it is genuinely right somewhere else:
an edge runtime with no TCP sockets, or a network that really does filter 5432.
Measure with `db:ping` before choosing it.

## Checking it

```bash
npm run db:ping
```

Tests both URLs across three paths — 5432, 443 over a WebSocket (what the Neon
adapter actually opens) and 443 over HTTP — five attempts each. Five because
the failure is intermittent and three samples cannot tell "usually fine" from
"usually broken".

Read the hosts against each other first, then the transports. One host healthy
everywhere and the other not means the hostname is the problem; one transport
failing on both hosts means the port or a proxy is.

## Applying schema changes

This is the one thing 443 does not solve. **The Prisma CLI only speaks 5432**,
so on a network that filters it, `prisma db push` times out and the schema
cannot move forward — even while the app is happily talking to the same
database.

Two ways round it:

**`npx prisma db push`** — try it first. If `db:ping` shows 5432 as merely
flaky rather than blocked, it usually succeeds within a couple of attempts.

**`prisma/manual-schema.sql`** — the escape hatch. Paste it into the SQL Editor
in the Neon console, which is also just HTTPS. It contains every schema change
behind the quote/invoice PDFs and client verification, written so that every
statement checks first: safe to run repeatedly, and safe against a database
that already has some of the changes.

Either way, finish with:

```bash
npx prisma generate
```

`generate` reads the schema file and never touches the database, so it works
regardless of the network. Then restart `npm run dev` — Turbopack compiles the
client into `.next/dev` and will keep using the old one otherwise.

## Which error means what

| Error | Meaning |
| --- | --- |
| `ETIMEDOUT` | Nothing answered. Network, not data. Nothing was written. |
| `AggregateError [ETIMEDOUT]` | Nothing answered on **any** address for that host. The hostname is unreachable, not one route to it. |
| `ECONNREFUSED` | Something answered and refused. Wrong host or port. |
| `28P01` | Wrong password. |
| `PrismaClientKnownRequestError` P2021 / P2022 | The **database** is behind — apply the schema. |
| `PrismaClientValidationError` "Unknown argument" | The **client** is behind — run `prisma generate` and restart the dev server. |

The last two are the pair worth memorising: they look similar and mean opposite
things. P2022 says the code is ahead of the database; "Unknown argument" says
the generated client is behind the schema file.

## Environment

```
DATABASE_URL   The endpoint the app and the scripts use.
DIRECT_URL     The unpooled endpoint. Used by the Prisma CLI.
DB_TRANSPORT   Unset (default) = 5432. "neon" = WebSocket on 443.
```

`prisma.config.ts` points the CLI at `DIRECT_URL` because migrations take an
advisory lock and run DDL, and PgBouncer's transaction pooling cannot carry
either across statements.
