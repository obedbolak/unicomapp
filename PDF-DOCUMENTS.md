# Quotes & invoices as PDFs

Every row in the `invoices` table now prints as a Word-style business document
laid out with [`@react-pdf/renderer`](https://react-pdf.org): letterhead,
centred title block, bordered tables with a navy header row, a financial
summary, a payment schedule, numbered terms and a signature block.

## Install

```bash
npm install                 # picks up @react-pdf/renderer
npx prisma generate
npx prisma db push          # or: npx prisma migrate dev -n document_fields
```

`db push` adds the new columns, tables and enums listed under
[Schema](#schema). Nothing existing is dropped and every new column is
nullable or defaulted, so current invoices keep working untouched — they
simply print as ordinary single-table invoices until you give them phases.

## The worked example

```bash
npm run seed:zonecinq
```

Loads `UCT-2026-GZ5-001` — the signed Groupe ZONECINQ® quote — with its client,
project, three phases, two unphased lines, six-instalment schedule and seven
clauses. It prints the admin and PDF URLs when it finishes, and warns if the
lines stop adding up to 750,000 FCFA or the schedule stops matching the total.

Re-running rebuilds that one document from `prisma/seed-zonecinq.ts` rather
than duplicating it, so the file stays the source of truth for it. Copy the
file to seed another phased quote.

## Using it

`/admin/invoices` creates either a **quote** or an **invoice**; the two number
in separate series (`UCT-QTE-2026-0001`, `UCT-INV-2026-0001`) so neither has
gaps.

On a document's page:

- **Phases** are the grouped tables. Add "PHASE 1 — WEBSITE (NEXT.JS &
  REACT)" with a subtitle like "Estimated delivery: 4–6 weeks from start
  date", then add lines inside it. Each phase prints its own table closed by a
  `PHASE 1 TOTAL` row, and every phase total is restated in the financial
  summary.
- **Additional lines** are lines belonging to no phase — contingency, a bonus,
  a discount. They are left out of the phase tables and printed as their own
  rows in the financial summary, which is where "Technical Reserve &
  Contingency" goes.
- Each line has an optional short **Item** label. Fill it and the PDF prints
  the two-column `Item | Description` layout; leave it blank and the
  description fills the cell, which is the ordinary invoice line.
- **Payment schedule** rows are the instalment plan. The card warns when the
  scheduled amounts do not add up to the total, so the document cannot
  contradict itself. Instalments are the *plan*; the Payments page records the
  *facts*, and the two are shown side by side.
- **Printed document** holds everything that only affects wording — headline,
  sub-headline, project scope, the budget line, validity, terms (one clause per
  line) and the two signatories. Blank fields fall back to company settings.

**Preview PDF** opens it in the browser; **Download PDF** saves it as
`<document number>.pdf`. Both hit `/api/invoices/<id>/pdf`, which is
admin-only.

Documents are rendered from the database at request time, so what a client
receives is always what is stored — there is no cached copy to go stale.

## Schema

| Addition | Purpose |
| --- | --- |
| `Invoice.docType` (`QUOTE` \| `INVOICE`) | One template, two documents |
| `Invoice.title`, `.subject`, `.scope`, `.budgetLabel`, `.validUntil` | Printed wording |
| `Invoice.terms` (`String[]`) | Numbered clauses |
| `Invoice.clientSignerName`, `.issuerSignerName`, `.issuerSignerRole` | Signature block |
| `InvoiceSection` | A phase: title, subtitle, order |
| `InvoiceItem.sectionId`, `.label` | Which phase a line sits in, and its short label |
| `InvoiceInstallment` + `InstallmentStatus` | The payment schedule |

New settings keys (all defaulted, so nothing needs configuring first):
`companySubname`, `companyTagline`, `companyWebsite`, `companyPhoneCode`,
`signatoryName`, `signatoryRole`, `quotePrefix`.

## Where the code lives

```
lib/documents.ts               types + formatting, no database
lib/documents.server.ts        loads one document and shapes it
components/pdf/theme.ts        colours, column widths, styles
components/pdf/fonts.ts        Carlito registration (falls back to Helvetica)
components/pdf/BusinessDocument.tsx   the document itself
app/api/invoices/[id]/pdf/route.ts    admin-only download
public/fonts/                  Carlito, OFL 1.1 — see its README
```

The template is a pure function of plain JSON, so it can also be rendered from
a background job — an "e-mail this quote" action needs `loadDocument()` plus
`renderToBuffer()` and nothing else.

## Two react-pdf traps worth remembering

Both are documented in the code where they bite, and both are silent failures
rather than errors:

1. **No `lineHeight` anywhere.** react-pdf's default leading comes from the
   font metrics and is exactly the tight Word-like spacing this document wants.
   Any explicit multiplier — even `1` — measures against the line box and opens
   a visible gap inside wrapped table cells.
2. **Never set `lineHeight` on `<Page>`.** On top of the above, it makes the
   renderer silently drop every `fixed` block containing a dynamic `render`
   text — which is the page-number footer.
