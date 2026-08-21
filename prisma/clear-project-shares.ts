// prisma/clear-project-shares.ts
// One-off cleanup: blanks every ProjectAssignment.sharePct.
//
// Project assignment is people and roles now — no revenue split. The column is
// still in the schema and lib/wallet.ts still knows how to credit from it, so
// any value left behind would quietly pay out the next time a project is marked
// DELIVERED, with no way to see or edit it in the admin. This clears them so
// nothing fires unexpectedly.
//
//   npm run db:clear-shares
//
// Safe to re-run. Earnings already credited are not touched — they are history.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

async function main() {
  const affected = await prisma.projectAssignment.findMany({
    where: { sharePct: { not: null } },
    select: {
      sharePct: true,
      user: { select: { name: true, email: true } },
      project: { select: { title: true, status: true } },
    },
  });

  if (affected.length === 0) {
    console.log("✅ Nothing to clear — no assignment carries a revenue share.");
    return;
  }

  console.log(`Found ${affected.length} assignment(s) with a share set:\n`);
  for (const a of affected) {
    console.log(
      `  ${String(a.sharePct).padStart(6)}%  ${a.user.name ?? a.user.email}` +
        `  —  ${a.project.title} (${a.project.status})`,
    );
  }

  const { count } = await prisma.projectAssignment.updateMany({
    where: { sharePct: { not: null } },
    data: { sharePct: null },
  });

  console.log(`\n✅ Cleared ${count} revenue share(s). Assignments untouched.`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
