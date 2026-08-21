// prisma.config.ts
import path from "node:path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  datasource: {
    // Schema work goes through the direct, unpooled endpoint.
    //
    // DATABASE_URL is Neon's pooled host, which fronts Postgres with PgBouncer.
    // The app wants that — short queries, many of them. Migrations do not: a
    // push or migrate takes an advisory lock and runs DDL, and PgBouncer's
    // transaction pooling cannot carry either across statements. Pointed at the
    // pooled URL it fails, sometimes quietly enough to look like it worked,
    // leaving a regenerated client talking to an unchanged database.
    //
    // Falls back to DATABASE_URL so a setup without a direct URL still runs.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },

  migrations: {
    seed: "npm run seed",
  },
});
