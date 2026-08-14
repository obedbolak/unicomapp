# UnicomTeam — database & dashboards setup

Everything the site knows now lives in Postgres: applications, students,
payments, certificates, projects, clients, team, tasks. Two dashboards read it —
`/admin` for you, `/dashboard` for the team.

Follow these steps once.

---

## 1. Create the database (Neon)

1. Go to <https://neon.tech> and sign up (free tier is plenty to start).
2. Create a project — name it `unicomteam`, pick the region closest to your
   users (`eu-central-1` is a good default for Cameroon).
3. Open **Connection string** and copy the **Pooled connection** URL. It looks
   like:

   ```
   postgresql://neondb_owner:PASSWORD@ep-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

4. Also copy the **direct** (unpooled) URL — same thing without `-pooler`.
   Migrations need it.

---

## 2. Add the environment variables

Append these to your existing `.env` (don't remove anything that's already
there — see `.env.example` for the full picture):

```bash
DATABASE_URL="postgresql://…-pooler…/neondb?sslmode=require"
DIRECT_URL="postgresql://…/neondb?sslmode=require"

NEXTAUTH_SECRET="paste-a-random-string"
NEXTAUTH_URL="http://localhost:3000"

SEED_ADMIN_PASSWORD="pick-a-strong-password"
```

Generate the secret with:

```bash
openssl rand -base64 32
```

> On Vercel, add the same variables in **Project → Settings → Environment
> Variables**, and set `NEXTAUTH_URL` to `https://unicomteam.com`.

---

## 3. Install and create the tables

```bash
npm install
npx prisma generate
npx prisma db push      # creates every table from prisma/schema.prisma
npm run seed            # loads your existing site content into the DB
```

`npm run seed` is safe to re-run — everything is an upsert.

It loads:

- 5 team members from `/about` (each gets a login)
- 5 services from `app/services/data.ts`
- 9 projects from `/projects`, plus the clients behind them
- 7 training programmes, 3 crash courses, 6 internship roles
- the existing certificate `UCT-INT-2026-0015`

When it finishes it prints your login:

```
Sign in as obed@unicomteam.com / <SEED_ADMIN_PASSWORD>
```

**Change that password after the first login.**

---

## 4. Run it

```bash
npm run dev
```

- <http://localhost:3000/login> — sign in
- <http://localhost:3000/admin> — your dashboard
- <http://localhost:3000/dashboard> — what the team sees

`npx prisma studio` opens a spreadsheet-style view of every table, which is
handy while you're getting used to the data.

---

## What changed in the app

| File | What happened |
| --- | --- |
| `prisma/schema.prisma` | **New** — the whole data model |
| `prisma/seed.ts` | **New** — imports your existing hardcoded content |
| `prisma.config.ts` | **New** — Prisma 7 config |
| `lib/prisma.ts` | **New** — client singleton (pg driver adapter) |
| `lib/auth.ts` | **New** — NextAuth options + `requireUser` / `requireAdmin` |
| `lib/reference.ts` | **New** — generates `UCT-ENR-2026-0001` style references |
| `lib/certificates.ts` | **Rewritten** — reads Postgres instead of a hardcoded array. `findCertificate` is now **async** |
| `app/api/enroll/route.ts` | **Rewritten** — saves the application *before* emailing |
| `app/verify/[certNo]/page.tsx` | Awaits `findCertificate`, logs each verification |
| `app/api/auth/[...nextauth]/route.ts` | **New** |
| `app/login/page.tsx` | **New** |
| `app/admin/**` | **New** — overview, enrollments, payments, certificates, projects, team |
| `app/dashboard/**` | **New** — staff view of their projects and tasks |
| `components/dashboard/**` | **New** — shared dashboard UI |
| `middleware.ts` | **New** — `/admin` needs ADMIN, `/dashboard` needs a login |
| `types/next-auth.d.ts` | **New** — puts `role` on the session |
| `package.json` | Added Prisma, NextAuth, pg, bcryptjs, tsx + db scripts |

Nothing on the public site was removed. The hardcoded arrays in
`app/trainings/page.tsx`, `app/projects/page.tsx` and `app/services/data.ts`
still render the site exactly as before — the DB now holds the same content, so
you can switch those pages over one at a time whenever you're ready.

---

## The one behaviour change worth knowing

Before, if EmailJS failed the applicant got an error and **you lost the lead**.

Now the application is written to Postgres first. If the email then fails, the
applicant is told they're registered and you'll follow up, the failure is stored
on the row, and `/admin` shows a red banner counting them. Nothing gets lost.

---

## Next steps, when you want them

1. **Point the public pages at the DB** — `/projects`, `/services` and
   `/trainings` can read from Prisma instead of their arrays. The data is
   already seeded and shaped identically.
2. **Contact form → `ContactMessage`** — the table exists; the form just needs an
   API route like the enrollment one.
3. **Invoices** — `Invoice` / `InvoiceItem` are modelled and ready for a
   generate-PDF screen.
4. **Migrations instead of `db push`** — once you're live, switch to
   `npx prisma migrate dev --name init` so schema changes are versioned in git.
