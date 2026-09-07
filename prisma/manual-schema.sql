-- prisma/manual-schema.sql
--
-- Every schema change behind the quote/invoice PDFs and client verification,
-- written by hand so it can be applied without `prisma db push`.
--
-- Why this file exists: the Prisma CLI speaks plain Postgres on port 5432. On a
-- network where that port is filtered or the route is unreliable, `db push`
-- times out and there is no way to move the schema forward — while the app
-- itself, once it is on Neon's serverless driver, is happily talking to the
-- same database over 443. This is the escape hatch: paste it into the SQL
-- Editor in the Neon console (which is also just HTTPS) and the database is
-- brought up to date without 5432 being involved at all.
--
-- Safe to run more than once, and safe to run against a database that already
-- has some of these changes: every statement checks first. Running it when
-- everything is already applied does nothing and reports no error.
--
-- After applying, run `npx prisma generate` locally — that reads the schema
-- file and never touches the database, so it works regardless of the network.

BEGIN;

-- ── Enums ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "DocumentType" AS ENUM ('QUOTE', 'INVOICE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'DUE', 'PAID', 'WAIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── invoices: document type, printed wording, signatures, verification ──────

ALTER TABLE "invoices"
  ADD COLUMN IF NOT EXISTS "docType" "DocumentType" NOT NULL DEFAULT 'INVOICE',
  ADD COLUMN IF NOT EXISTS "validUntil" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "title" TEXT,
  ADD COLUMN IF NOT EXISTS "subject" TEXT,
  ADD COLUMN IF NOT EXISTS "scope" TEXT,
  ADD COLUMN IF NOT EXISTS "budgetLabel" TEXT,
  ADD COLUMN IF NOT EXISTS "terms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "clientSignerName" TEXT,
  ADD COLUMN IF NOT EXISTS "issuerSignerName" TEXT,
  ADD COLUMN IF NOT EXISTS "issuerSignerRole" TEXT,
  ADD COLUMN IF NOT EXISTS "verifyCode" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "invoices_verifyCode_key"
  ON "invoices" ("verifyCode");

CREATE INDEX IF NOT EXISTS "invoices_docType_status_idx"
  ON "invoices" ("docType", "status");

-- ── invoice_sections: the phases a document is grouped into ─────────────────

CREATE TABLE IF NOT EXISTS "invoice_sections" (
  "id"        TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "subtitle"  TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "invoice_sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "invoice_sections_invoiceId_sortOrder_idx"
  ON "invoice_sections" ("invoiceId", "sortOrder");

DO $$ BEGIN
  ALTER TABLE "invoice_sections"
    ADD CONSTRAINT "invoice_sections_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── invoice_items: which phase a line sits in, and its short label ──────────

ALTER TABLE "invoice_items"
  ADD COLUMN IF NOT EXISTS "sectionId" TEXT,
  ADD COLUMN IF NOT EXISTS "label" TEXT;

CREATE INDEX IF NOT EXISTS "invoice_items_invoiceId_sortOrder_idx"
  ON "invoice_items" ("invoiceId", "sortOrder");

CREATE INDEX IF NOT EXISTS "invoice_items_sectionId_sortOrder_idx"
  ON "invoice_items" ("sectionId", "sortOrder");

-- SET NULL, not CASCADE: deleting a phase heading must not delete the money
-- underneath it. The lines survive as unphased and show up in the financial
-- summary, where they can be re-filed or removed deliberately.
DO $$ BEGIN
  ALTER TABLE "invoice_items"
    ADD CONSTRAINT "invoice_items_sectionId_fkey"
    FOREIGN KEY ("sectionId") REFERENCES "invoice_sections" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── invoice_installments: the payment schedule ──────────────────────────────

CREATE TABLE IF NOT EXISTS "invoice_installments" (
  "id"        TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "label"     TEXT,
  "percent"   DECIMAL(5,2),
  "trigger"   TEXT NOT NULL,
  "amount"    DECIMAL(12,2) NOT NULL,
  "status"    "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
  "dueDate"   TIMESTAMP(3),
  "paidAt"    TIMESTAMP(3),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "invoice_installments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "invoice_installments_invoiceId_sortOrder_idx"
  ON "invoice_installments" ("invoiceId", "sortOrder");

DO $$ BEGIN
  ALTER TABLE "invoice_installments"
    ADD CONSTRAINT "invoice_installments_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── document_verifications: audit of every public /verify lookup ────────────

CREATE TABLE IF NOT EXISTS "document_verifications" (
  "id"        TEXT NOT NULL,
  "number"    TEXT NOT NULL,
  "found"     BOOLEAN NOT NULL,
  "invoiceId" TEXT,
  "ip"        TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "document_verifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "document_verifications_number_idx"
  ON "document_verifications" ("number");

CREATE INDEX IF NOT EXISTS "document_verifications_createdAt_idx"
  ON "document_verifications" ("createdAt");

COMMIT;
