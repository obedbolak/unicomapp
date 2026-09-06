// lib/documents.server.ts
//
// Loads one quote/invoice out of the database and shapes it for the PDF
// template. Split from documents.ts so that the template — and anything that
// only needs the types or the formatters — never pulls the Prisma client into
// its module graph.

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatCode } from "@/lib/verification";
import {
  ordinal,
  readLogo,
  type DocLine,
  type DocSection,
  type DocInstallment,
  type DocumentPayload,
} from "@/lib/documents";

const dec = (v: unknown) => Number(v ?? 0);

/**
 * Loads one invoice/quote and shapes it for the template.
 *
 * Returns null when the id does not exist so callers can answer 404 rather
 * than throwing.
 */
export async function loadDocument(
  id: string,
): Promise<DocumentPayload | null> {
  const [invoice, settings] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: {
        client: { select: { name: true, email: true } },
        project: { select: { title: true } },
        sections: {
          orderBy: { sortOrder: "asc" },
          include: { items: { orderBy: { sortOrder: "asc" } } },
        },
        items: { orderBy: { sortOrder: "asc" } },
        installments: { orderBy: { sortOrder: "asc" } },
        payments: { select: { amount: true, status: true } },
      },
    }),
    getSettings(),
  ]);

  if (!invoice) return null;

  const toLine = (i: {
    id: string;
    label: string | null;
    description: string;
    quantity: unknown;
    unitPrice: unknown;
    amount: unknown;
  }): DocLine => ({
    id: i.id,
    // When no short label was given, the description carries the whole cell
    // and the middle column is left empty — that is the ordinary invoice line.
    label: i.label ?? i.description,
    description: i.label ? i.description : "",
    quantity: dec(i.quantity),
    unitPrice: dec(i.unitPrice),
    amount: dec(i.amount),
  });

  const sections: DocSection[] = invoice.sections.map((s) => {
    const items = s.items.map(toLine);
    return {
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      items,
      total: items.reduce((sum, i) => sum + i.amount, 0),
    };
  });

  const extras = invoice.items.filter((i) => !i.sectionId).map(toLine);

  const paid = invoice.payments
    .filter((p) => p.status === "CONFIRMED")
    .reduce((sum, p) => sum + dec(p.amount), 0);

  const total = dec(invoice.total);

  const installments: DocInstallment[] = invoice.installments.map((x, idx) => {
    const pct = x.percent === null ? null : dec(x.percent);
    return {
      id: x.id,
      label:
        x.label ??
        (pct === null
          ? ordinal(idx + 1)
          : `${ordinal(idx + 1)} — ${trimPercent(pct)}%`),
      trigger: x.trigger,
      amount: dec(x.amount),
      status: x.status,
      dueDate: x.dueDate ? x.dueDate.toISOString() : null,
    };
  });

  const isQuote = invoice.docType === "QUOTE";

  return {
    docType: invoice.docType,
    number: invoice.number,
    status: invoice.status,
    title: invoice.title ?? (isQuote ? "QUOTE & FUND DISTRIBUTION" : "INVOICE"),
    subject: invoice.subject ?? invoice.project?.title ?? null,
    scope: invoice.scope,
    budgetLabel: invoice.budgetLabel,

    currency: invoice.currency,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
    validUntil: invoice.validUntil ? invoice.validUntil.toISOString() : null,

    clientName: invoice.client?.name ?? null,
    clientEmail: invoice.client?.email ?? null,
    projectTitle: invoice.project?.title ?? null,

    sections,
    extras,
    phased: sections.length > 0,

    subtotal: dec(invoice.subtotal),
    tax: dec(invoice.tax),
    total,
    paid,
    balance: total - paid,

    installments,
    terms: invoice.terms,
    notes: invoice.notes,

    verify: invoice.verifyCode
      ? {
          code: formatCode(invoice.verifyCode),
          // The bare host, not a full URL: it is read off paper, and
          // "unicomteam.com/verify" is what someone can actually retype.
          url: `${settings.companyWebsite.replace(/^https?:\/\//, "")}/verify/document`,
        }
      : null,

    company: {
      name: settings.companyName,
      subname: settings.companySubname,
      tagline: settings.companyTagline,
      email: settings.companyEmail,
      phone: [settings.companyPhoneCode, settings.companyPhone]
        .filter(Boolean)
        .join(" ")
        .trim(),
      website: settings.companyWebsite,
      address: settings.companyAddress,
      logo: readLogo(),
    },

    signatures: {
      clientLabel: `${invoice.client?.name ?? "Client"} (Client)`,
      clientName: invoice.clientSignerName ?? invoice.client?.name ?? null,
      issuerLabel: `${settings.companyName} (Authorized Developer)`,
      issuerName:
        invoice.issuerSignerName || settings.signatoryName || settings.companyName,
      issuerRole: invoice.issuerSignerRole || settings.signatoryRole,
      date: invoice.issueDate.toISOString(),
    },
  };
}

/** 20.00 → "20", 13.30 → "13.3". Keeps "1st — 20%" from reading "20.00%". */
function trimPercent(n: number): string {
  return String(Number(n.toFixed(2)));
}
