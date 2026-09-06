// components/pdf/BusinessDocument.tsx
//
// The printed quote / invoice, rendered with @react-pdf/renderer.
//
// This file is a pure function of its props — it never touches the database,
// the session or the filesystem (fonts and the logo are resolved before it is
// called). That makes it renderable from an API route, a background job or a
// script, and testable without standing anything up.
//
// The layout deliberately mirrors a Word business document rather than a
// web page: a centred title block, bordered tables with a solid navy header
// row, a financial summary that restates the section totals, and a signature
// block at the foot. See components/pdf/theme.ts for the measurements.

import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import {
  COLORS,
  ITEM_COLS,
  META_COLS,
  SCHEDULE_COLS,
  SIGN_COLS,
  SUMMARY_COLS,
  createStyles,
  type DocStyles,
} from "./theme";
import {
  amountWithUnit,
  currencyLabel,
  longDate,
  num,
  type DocLine,
  type DocumentPayload,
} from "@/lib/documents";

/**
 * One entry of the stylesheet. Derived from the sheet itself rather than
 * imported, so it stays correct without depending on react-pdf's internal type
 * paths.
 */
type Style = DocStyles[keyof DocStyles];

/* ── Small building blocks ───────────────────────────────────────────────── */

type CellProps = {
  s: DocStyles;
  width: number;
  children: React.ReactNode;
  fill?: boolean;
  header?: boolean;
  align?: "left" | "center" | "right";
  bold?: boolean;
  navy?: boolean;
  muted?: boolean;
  /** Drops the cell's own padding so the child can own its spacing. */
  flush?: boolean;
};

function Cell({
  s,
  width,
  children,
  fill,
  header,
  align = "left",
  bold,
  navy,
  muted,
  flush,
}: CellProps) {
  const text: Style[] = [];
  if (header) text.push(s.headerCell);
  if (align === "center") text.push(s.centered);
  if (align === "right") text.push(s.right);
  if (bold) text.push(s.bold);
  if (navy) text.push(s.navyText);
  if (muted) text.push(s.mutedText);

  return (
    <View
      style={[
        s.cell,
        { width },
        ...(fill ? [s.fillCell] : []),
        ...(header ? [{ borderColor: COLORS.navy }] : []),
        ...(flush ? [s.cellFlush] : []),
      ]}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={text}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

function HeaderRow({ s, cols }: { s: DocStyles; cols: [number, string][] }) {
  return (
    <View style={[s.row, s.headerRow]} wrap={false}>
      {cols.map(([w, label], i) => (
        <Cell key={i} s={s} width={w} header align="center">
          {label}
        </Cell>
      ))}
    </View>
  );
}

/* ── Letterhead ──────────────────────────────────────────────────────────── */

function Letterhead({
  s,
  company,
}: {
  s: DocStyles;
  company: DocumentPayload["company"];
}) {
  const contact = [company.email, company.phone, company.website]
    .filter(Boolean)
    .join("  •  ");

  return (
    <View style={s.letterhead}>
      {/* The logo file is the mark on its own, so the wordmark is set in type
          beside it. Rendering the name as text also keeps the lockup sharp at
          any zoom and lets a renamed company update itself from settings. */}
      <View style={s.lockup}>
        {company.logo && (
          // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image takes no alt
          <Image src={company.logo} style={s.logo} />
        )}
        <View>
          <Text style={s.wordmark}>{company.name}</Text>
          {!!company.subname && (
            <Text style={s.wordmarkSub}>{company.subname}</Text>
          )}
        </View>
      </View>

      <View style={s.letterheadRight}>
        {!!company.tagline && <Text style={s.tagline}>{company.tagline}</Text>}
        {!!contact && <Text style={s.contactLine}>{contact}</Text>}
        {!!company.address && (
          <Text style={s.contactLine}>{company.address}</Text>
        )}
      </View>
    </View>
  );
}

/* ── Meta table ──────────────────────────────────────────────────────────── */

function MetaTable({ s, doc }: { s: DocStyles; doc: DocumentPayload }) {
  const isQuote = doc.docType === "QUOTE";
  const [l1, v1, l2, v2] = META_COLS;

  // Second row, right-hand pair: a quote states how long it stands, an invoice
  // states when it must be paid. Same slot, different promise.
  const rightLabel = isQuote ? "Validity" : "Due Date";
  const rightValue = isQuote
    ? doc.validUntil
      ? longDate(doc.validUntil)
      : "30 days"
    : longDate(doc.dueDate);

  const budget =
    doc.budgetLabel ?? amountWithUnit(doc.total, doc.currency);

  return (
    <View style={s.table}>
      <View style={s.row} wrap={false}>
        <Cell s={s} width={l1} fill bold align="center">
          {isQuote ? "Quote No." : "Invoice No."}
        </Cell>
        <Cell s={s} width={v1} align="center">
          {doc.number}
        </Cell>
        <Cell s={s} width={l2} fill bold align="center">
          Issue Date
        </Cell>
        <Cell s={s} width={v2} align="center">
          {longDate(doc.issueDate)}
        </Cell>
      </View>

      <View style={s.row} wrap={false}>
        <Cell s={s} width={l1} fill bold align="center">
          Client
        </Cell>
        <Cell s={s} width={v1} align="center">
          {doc.clientName ?? "—"}
        </Cell>
        <Cell s={s} width={l2} fill bold align="center">
          {rightLabel}
        </Cell>
        <Cell s={s} width={v2} align="center">
          {rightValue}
        </Cell>
      </View>

      <View style={s.row} wrap={false}>
        <Cell s={s} width={l1} fill bold align="center">
          {isQuote ? "Total Budget" : "Amount Due"}
        </Cell>
        <Cell s={s} width={v1 + l2 + v2} fill align="center" bold>
          {budget}
        </Cell>
      </View>
    </View>
  );
}

/* ── Line-item tables ────────────────────────────────────────────────────── */

/**
 * A phase table: short label, description, amount — exactly the three columns
 * of the source document, closed by its own subtotal row.
 */
function SectionTable({
  s,
  title,
  subtitle,
  items,
  total,
  totalLabel,
  currency,
}: {
  s: DocStyles;
  title?: string | null;
  subtitle?: string | null;
  items: DocLine[];
  total: number;
  totalLabel: string;
  currency: string;
}) {
  const [c1, c2, c3] = ITEM_COLS;

  return (
    <View>
      {/* minPresenceAhead keeps a heading from stranding at the foot of a
          page: unless there is room for the heading, the column titles and a
          couple of rows, the whole block starts on the next page. The table
          itself is still allowed to break — a long phase splitting mid-body is
          normal; a heading with nothing under it is not. */}
      {!!title && (
        <Text style={s.sectionHeading} minPresenceAhead={170}>
          {title}
        </Text>
      )}
      {!!subtitle && <Text style={s.sectionSubtitle}>{subtitle}</Text>}

      <View style={s.table}>
        <HeaderRow
          s={s}
          cols={[
            [c1, "Item"],
            [c2, "Description"],
            [c3, `Amount (${currencyLabel(currency)})`],
          ]}
        />

        {items.map((item) => (
          <View style={s.row} key={item.id} wrap={false}>
            <Cell s={s} width={c1} align="center">
              {item.label}
            </Cell>
            <Cell s={s} width={c2} align="center">
              {item.description}
            </Cell>
            <Cell s={s} width={c3} align="center" bold>
              {num(item.amount)}
            </Cell>
          </View>
        ))}

        <View style={[s.row, s.totalRow]} wrap={false}>
          <Cell s={s} width={c1 + c2} align="center" fill>
            <Text style={[s.totalText, s.centered]}>{totalLabel}</Text>
          </Cell>
          <Cell s={s} width={c3} align="center" fill>
            <Text style={[s.totalText, s.centered]}>{num(total)}</Text>
          </Cell>
        </View>
      </View>
    </View>
  );
}

/**
 * The plain, unphased case: one table with quantity and unit price, closed by
 * subtotal / tax / total. This is what an ordinary invoice looks like, and it
 * is what every existing invoice in the database will render as until phases
 * are added to it.
 */
function FlatTable({ s, doc }: { s: DocStyles; doc: DocumentPayload }) {
  const unit = currencyLabel(doc.currency);
  const showQty = doc.extras.some((i) => i.quantity !== 1);
  const cols = showQty ? [212, 52, 96, 108] : [264, 96, 108];

  const rows = doc.extras;

  return (
    <View style={{ marginTop: 20 }}>
      <View style={s.table}>
        <HeaderRow
          s={s}
          cols={
            showQty
              ? ([
                  [cols[0], "Description"],
                  [cols[1], "Qty"],
                  [cols[2], `Unit price (${unit})`],
                  [cols[3], `Amount (${unit})`],
                ] as [number, string][])
              : ([
                  [cols[0], "Description"],
                  [cols[1], "Details"],
                  [cols[2], `Amount (${unit})`],
                ] as [number, string][])
          }
        />

        {rows.map((item) => (
          <View style={s.row} key={item.id} wrap={false}>
            <Cell s={s} width={cols[0]}>
              {item.label}
            </Cell>
            {showQty ? (
              <>
                <Cell s={s} width={cols[1]} align="center" muted>
                  {String(item.quantity)}
                </Cell>
                <Cell s={s} width={cols[2]} align="right" muted>
                  {num(item.unitPrice)}
                </Cell>
              </>
            ) : (
              <Cell s={s} width={cols[1]} muted>
                {item.description}
              </Cell>
            )}
            <Cell s={s} width={cols[cols.length - 1]} align="right" bold>
              {num(item.amount)}
            </Cell>
          </View>
        ))}

        <TotalsRows s={s} doc={doc} labelWidth={468 - cols[cols.length - 1]} />
      </View>
    </View>
  );
}

function TotalsRows({
  s,
  doc,
  labelWidth,
}: {
  s: DocStyles;
  doc: DocumentPayload;
  labelWidth: number;
}) {
  const valueWidth = 468 - labelWidth;

  const rows: [string, string, boolean][] = [
    ["Subtotal", num(doc.subtotal), false],
  ];
  if (doc.tax) rows.push(["Tax", num(doc.tax), false]);
  rows.push(["TOTAL", num(doc.total), true]);
  if (doc.paid > 0) {
    rows.push(["Amount paid", num(doc.paid), false]);
    rows.push(["Balance due", num(doc.balance), true]);
  }

  return (
    <>
      {rows.map(([label, value, strong], i) => (
        <View style={[s.row, s.totalRow]} key={i} wrap={false}>
          <Cell s={s} width={labelWidth} align="right" fill>
            <Text style={[strong ? s.grandTotalText : s.totalText, s.right]}>
              {label}
            </Text>
          </Cell>
          <Cell s={s} width={valueWidth} align="right" fill>
            <Text style={[strong ? s.grandTotalText : s.totalText, s.right]}>
              {value}
            </Text>
          </Cell>
        </View>
      ))}
    </>
  );
}

/* ── Financial summary ───────────────────────────────────────────────────── */

function FinancialSummary({ s, doc }: { s: DocStyles; doc: DocumentPayload }) {
  const [c1, c2] = SUMMARY_COLS;

  const rows: [string, number][] = [
    ...doc.sections.map(
      (sec) => [sec.title, sec.total] as [string, number],
    ),
    ...doc.extras.map((x) => [x.label, x.amount] as [string, number]),
  ];

  if (doc.tax) rows.push(["Tax", doc.tax]);

  return (
    <View>
      <Text style={s.blockHeading} minPresenceAhead={170}>
        FINANCIAL SUMMARY
      </Text>

      <View style={s.table}>
        <HeaderRow
          s={s}
          cols={[
            [c1, "Item"],
            [c2, `Amount (${currencyLabel(doc.currency)})`],
          ]}
        />

        {rows.map(([label, value], i) => (
          <View style={s.row} key={i} wrap={false}>
            <Cell s={s} width={c1} align="center">
              {label}
            </Cell>
            <Cell s={s} width={c2} align="center" bold>
              {num(value)}
            </Cell>
          </View>
        ))}

        <View style={[s.row, s.totalRow]} wrap={false}>
          <Cell s={s} width={c1} align="center" fill>
            <Text style={[s.grandTotalText, s.centered]}>
              TOTAL {doc.docType === "QUOTE" ? "BUDGET " : ""}(FULLY INCLUSIVE)
            </Text>
          </Cell>
          <Cell s={s} width={c2} align="center" fill>
            <Text style={[s.grandTotalText, s.centered]}>{num(doc.total)}</Text>
          </Cell>
        </View>

        {doc.paid > 0 && (
          <View style={s.row} wrap={false}>
            <Cell s={s} width={c1} align="center">
              <Text style={[s.centered, s.bold, { color: COLORS.paid }]}>
                Received to date
              </Text>
            </Cell>
            <Cell s={s} width={c2} align="center">
              <Text style={[s.centered, s.bold, { color: COLORS.paid }]}>
                {num(doc.paid)}
              </Text>
            </Cell>
          </View>
        )}
      </View>
    </View>
  );
}

/* ── Payment schedule ────────────────────────────────────────────────────── */

const STATUS_COLOR: Record<string, string> = {
  PAID: COLORS.paid,
  DUE: "#B45309",
  WAIVED: COLORS.muted,
  PENDING: COLORS.ink,
};

function PaymentSchedule({ s, doc }: { s: DocStyles; doc: DocumentPayload }) {
  const [c1, c2, c3, c4] = SCHEDULE_COLS;

  return (
    <View>
      <Text style={s.blockHeading} minPresenceAhead={170}>
        PAYMENT SCHEDULE
      </Text>

      <View style={s.table}>
        <HeaderRow
          s={s}
          cols={[
            [c1, "Instalment"],
            [c2, "Trigger"],
            [c3, `Amount (${currencyLabel(doc.currency)})`],
            [c4, "Status"],
          ]}
        />

        {doc.installments.map((x) => (
          <View style={s.row} key={x.id} wrap={false}>
            <Cell s={s} width={c1} align="center">
              {x.label}
            </Cell>
            <Cell s={s} width={c2} align="center">
              {x.trigger}
            </Cell>
            <Cell s={s} width={c3} align="center" bold>
              {num(x.amount)}
            </Cell>
            <Cell s={s} width={c4}>
              <Text
                style={[
                  s.statusText,
                  { color: STATUS_COLOR[x.status] ?? COLORS.ink },
                ]}
              >
                {title(x.status)}
              </Text>
            </Cell>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ── Terms, notes, signatures ────────────────────────────────────────────── */

function Terms({ s, terms }: { s: DocStyles; terms: string[] }) {
  return (
    <View>
      <Text style={s.blockHeading} minPresenceAhead={60}>
        TERMS &amp; CONDITIONS
      </Text>
      {terms.map((t, i) => (
        <View style={s.term} key={i} wrap={false}>
          <Text style={s.termNumber}>{i + 1}.</Text>
          <Text style={s.termText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function Signatures({ s, doc }: { s: DocStyles; doc: DocumentPayload }) {
  const [c1, c2] = SIGN_COLS;
  const date = longDate(doc.signatures.date);

  return (
    <View style={{ marginTop: 26 }} wrap={false}>
      <View style={s.table}>
        <View style={s.row}>
          <Cell s={s} width={c1} flush>
            <Text style={s.signHeaderCell}>{doc.signatures.clientLabel}</Text>
          </Cell>
          <Cell s={s} width={c2} flush>
            <Text style={s.signHeaderCell}>{doc.signatures.issuerLabel}</Text>
          </Cell>
        </View>

        <View style={s.row}>
          <Cell s={s} width={c1} flush>
            <View style={s.signBody}>
              <Text style={s.signPrompt}>Client Signature:</Text>
              <View style={s.signRule} />
              <Text style={s.signName}>
                Name &amp; Stamp: {doc.signatures.clientName ?? ""}
              </Text>
              <Text style={s.signName}>Date: {date}</Text>
            </View>
          </Cell>
          <Cell s={s} width={c2} flush>
            <View style={s.signBody}>
              <Text style={s.signPrompt}>{doc.signatures.issuerRole}:</Text>
              <View style={s.signRule} />
              <Text style={s.signName}>Name: {doc.signatures.issuerName}</Text>
              <Text style={s.signName}>Date: {date}</Text>
            </View>
          </Cell>
        </View>
      </View>
    </View>
  );
}

/* ── The document ────────────────────────────────────────────────────────── */

export function BusinessDocument({
  doc,
  font,
}: {
  doc: DocumentPayload;
  font: string;
}) {
  const s = createStyles(font);
  const isQuote = doc.docType === "QUOTE";

  return (
    <Document
      title={`${doc.number} — ${doc.subject ?? doc.title}`}
      author={doc.company.name}
      subject={doc.title}
      creator={doc.company.name}
      producer={doc.company.name}
    >
      <Page size="LETTER" style={s.page}>
        <Letterhead s={s} company={doc.company} />

        <Text style={s.title}>{doc.title}</Text>
        {!!doc.subject && <Text style={s.subject}>{doc.subject}</Text>}

        <MetaTable s={s} doc={doc} />

        {!!doc.scope && (
          <Text style={s.scope}>
            {isQuote ? "Project Scope: " : ""}
            {doc.scope}
          </Text>
        )}

        {doc.phased ? (
          <>
            {doc.sections.map((sec) => (
              <SectionTable
                key={sec.id}
                s={s}
                title={sec.title}
                subtitle={sec.subtitle}
                items={sec.items}
                total={sec.total}
                totalLabel={`${sec.title.split("—")[0].trim().toUpperCase()} TOTAL`}
                currency={doc.currency}
              />
            ))}

            <FinancialSummary s={s} doc={doc} />
          </>
        ) : (
          <FlatTable s={s} doc={doc} />
        )}

        {doc.installments.length > 0 && <PaymentSchedule s={s} doc={doc} />}

        {doc.terms.length > 0 && <Terms s={s} terms={doc.terms} />}

        {!!doc.notes && (
          <View wrap={false}>
            <Text style={s.notesHeading}>Notes</Text>
            <Text style={s.notes}>{doc.notes}</Text>
          </View>
        )}

        <Signatures s={s} doc={doc} />

        {/* Repeated on every page so the check survives a document that
            reaches the client as a photo of one page. */}
        <View style={s.footer} fixed>
          <View>
            <Text>
              {doc.number}
              {doc.clientName ? ` · ${doc.clientName}` : ""}
            </Text>
            {!!doc.verify && (
              <Text style={s.footerVerify}>
                Verify this document at {doc.verify.url} — code{" "}
                <Text style={s.footerCode}>{doc.verify.code}</Text>
              </Text>
            )}
          </View>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

/** "PENDING" → "Pending" */
function title(v: string) {
  return v.charAt(0) + v.slice(1).toLowerCase();
}

export default BusinessDocument;
