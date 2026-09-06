"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getSettings } from "@/lib/settings";
import { nextInvoiceNumber, nextQuoteNumber } from "@/lib/reference";
import type {
  DocumentType,
  InstallmentStatus,
  InvoiceStatus,
} from "@prisma/client";

/**
 * Boilerplate a new document opens with. Kept here rather than in the database
 * so a fresh install has sensible terms without a seed step; every clause is
 * editable per document once it exists.
 */
const DEFAULT_QUOTE_TERMS = [
  "Each instalment payment triggers the corresponding phase of development. Work will not begin until the respective payment is confirmed.",
  "Any additional features not listed in this quote will be subject to a written amendment and separate billing.",
  "Estimated timelines may vary depending on client availability for reviews, feedback, and formal approvals.",
  "Full source code and intellectual property rights are transferred to the client upon receipt of the final payment.",
  "This quote is valid for 30 days from the issue date.",
];

const DEFAULT_INVOICE_TERMS = [
  "Payment is due by the date stated above.",
  "Please quote the invoice number with your transfer or Mobile Money payment.",
];

/**
 * Totals are derived, never entered by hand: subtotal is the sum of line
 * items, total is subtotal + tax. Called after every item mutation so the
 * header can't drift from the lines.
 */
async function recomputeTotals(invoiceId: string) {
  const items = await prisma.invoiceItem.findMany({
    where: { invoiceId },
    select: { amount: true },
  });

  const subtotal = items.reduce((sum, i) => sum + Number(i.amount), 0);

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { tax: true },
  });

  const tax = Number(invoice?.tax ?? 0);

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { subtotal, total: subtotal + tax },
  });
}

export async function createInvoice(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const settings = await getSettings();

  const docType: DocumentType =
    String(formData.get("docType") ?? "") === "QUOTE" ? "QUOTE" : "INVOICE";

  // Quotes and invoices number in separate series — see lib/reference.ts.
  const number =
    docType === "QUOTE"
      ? await nextQuoteNumber(settings.quotePrefix)
      : await nextInvoiceNumber(settings.invoicePrefix);

  const clientId = String(formData.get("clientId") ?? "") || null;
  const projectId = String(formData.get("projectId") ?? "") || null;
  const dueRaw = String(formData.get("dueDate") ?? "");
  const tax = Number(formData.get("tax") ?? 0) || 0;

  const invoice = await prisma.invoice.create({
    data: {
      number,
      docType,
      clientId,
      projectId,
      dueDate: dueRaw ? new Date(dueRaw) : null,
      currency: settings.currency,
      tax,
      total: tax,
      notes: String(formData.get("notes") ?? "").slice(0, 2000) || null,
      // A brand-new quote starts with the boilerplate every quote needs, so
      // the common case is edit-and-send rather than write-from-nothing.
      terms: docType === "QUOTE" ? DEFAULT_QUOTE_TERMS : DEFAULT_INVOICE_TERMS,
    },
  });

  await logActivity(admin.id, "invoice.created", "Invoice", invoice.id, {
    number,
    docType,
  });

  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices/${invoice.id}`);
}

export async function updateInvoiceStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as InvoiceStatus;

  await prisma.invoice.update({ where: { id }, data: { status } });
  await logActivity(admin.id, "invoice.status_changed", "Invoice", id, {
    status,
  });

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
}

export async function updateInvoiceMeta(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const dueRaw = String(formData.get("dueDate") ?? "");
  const tax = Number(formData.get("tax") ?? 0) || 0;

  await prisma.invoice.update({
    where: { id },
    data: {
      dueDate: dueRaw ? new Date(dueRaw) : null,
      tax,
      notes: String(formData.get("notes") ?? "").slice(0, 2000) || null,
    },
  });

  await recomputeTotals(id);
  revalidatePath(`/admin/invoices/${id}`);
}

export async function addInvoiceItem(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const invoiceId = String(formData.get("invoiceId"));
  const sectionId = String(formData.get("sectionId") ?? "") || null;
  const label = String(formData.get("label") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 1);
  const unitPrice = Number(formData.get("unitPrice") ?? 0);

  if (!description) throw new Error("A description is required");
  if (Number.isNaN(quantity) || quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }
  if (Number.isNaN(unitPrice) || unitPrice < 0) {
    throw new Error("Unit price must be a positive number");
  }

  // Sort within the section when there is one, so a phase's rows stay in the
  // order they were entered instead of interleaving with other phases.
  const count = await prisma.invoiceItem.count({
    where: sectionId ? { invoiceId, sectionId } : { invoiceId },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId,
      sectionId,
      label: label ? label.slice(0, 120) : null,
      description: description.slice(0, 300),
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
      sortOrder: count,
    },
  });

  await recomputeTotals(invoiceId);
  await logActivity(admin.id, "invoice.item_added", "Invoice", invoiceId);

  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath("/admin/invoices");
}

export async function deleteInvoiceItem(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("itemId"));
  const invoiceId = String(formData.get("invoiceId"));

  await prisma.invoiceItem.delete({ where: { id } });
  await recomputeTotals(invoiceId);
  await logActivity(admin.id, "invoice.item_removed", "Invoice", invoiceId);

  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath("/admin/invoices");
}


/* ── Document meta: the wording that only the printed PDF cares about ────── */

/**
 * Splits a textarea into clauses. One clause per line, blank lines dropped,
 * and a leading "1." stripped so pasting an existing numbered list does not
 * produce "1. 1. …" once the template adds its own numbers back.
 */
function parseTerms(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 30)
    .map((line) => line.slice(0, 600));
}

export async function updateInvoiceDocument(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const docType: DocumentType =
    String(formData.get("docType") ?? "") === "QUOTE" ? "QUOTE" : "INVOICE";
  const validRaw = String(formData.get("validUntil") ?? "");

  const text = (name: string, max: number) => {
    const v = String(formData.get(name) ?? "").trim();
    return v ? v.slice(0, max) : null;
  };

  await prisma.invoice.update({
    where: { id },
    data: {
      docType,
      title: text("title", 160),
      subject: text("subject", 240),
      scope: text("scope", 1200),
      budgetLabel: text("budgetLabel", 120),
      validUntil: validRaw ? new Date(validRaw) : null,
      clientSignerName: text("clientSignerName", 120),
      issuerSignerName: text("issuerSignerName", 120),
      issuerSignerRole: text("issuerSignerRole", 80),
      terms: parseTerms(String(formData.get("terms") ?? "")),
    },
  });

  await logActivity(admin.id, "invoice.document_updated", "Invoice", id);
  revalidatePath(`/admin/invoices/${id}`);
}

/* ── Sections (phases) ───────────────────────────────────────────────────── */

export async function addInvoiceSection(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const invoiceId = String(formData.get("invoiceId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("A phase needs a title");

  const count = await prisma.invoiceSection.count({ where: { invoiceId } });

  await prisma.invoiceSection.create({
    data: {
      invoiceId,
      title: title.slice(0, 160),
      subtitle: String(formData.get("subtitle") ?? "").trim().slice(0, 200) || null,
      sortOrder: count,
    },
  });

  await logActivity(admin.id, "invoice.section_added", "Invoice", invoiceId, {
    title,
  });
  revalidatePath(`/admin/invoices/${invoiceId}`);
}

export async function deleteInvoiceSection(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("sectionId"));
  const invoiceId = String(formData.get("invoiceId"));

  // The section's items survive as unsectioned lines rather than being deleted
  // with it (schema: onDelete SetNull). Removing a heading should not quietly
  // remove the money underneath it — the totals stay put and the lines move
  // into the summary, where they are visible and can be re-filed or removed
  // deliberately.
  await prisma.invoiceSection.delete({ where: { id } });

  await recomputeTotals(invoiceId);
  await logActivity(admin.id, "invoice.section_removed", "Invoice", invoiceId);
  revalidatePath(`/admin/invoices/${invoiceId}`);
}

/* ── Payment schedule ────────────────────────────────────────────────────── */

export async function addInvoiceInstallment(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const invoiceId = String(formData.get("invoiceId"));
  const trigger = String(formData.get("trigger") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const percentRaw = String(formData.get("percent") ?? "").trim();
  const dueRaw = String(formData.get("dueDate") ?? "");

  if (!trigger) throw new Error("Say what triggers this instalment");
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("An instalment must be for a positive amount");
  }

  const count = await prisma.invoiceInstallment.count({ where: { invoiceId } });

  await prisma.invoiceInstallment.create({
    data: {
      invoiceId,
      trigger: trigger.slice(0, 300),
      amount,
      percent: percentRaw ? Number(percentRaw) : null,
      dueDate: dueRaw ? new Date(dueRaw) : null,
      sortOrder: count,
    },
  });

  await logActivity(
    admin.id,
    "invoice.installment_added",
    "Invoice",
    invoiceId,
  );
  revalidatePath(`/admin/invoices/${invoiceId}`);
}

export async function updateInstallmentStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("installmentId"));
  const invoiceId = String(formData.get("invoiceId"));
  const status = String(formData.get("status")) as InstallmentStatus;

  await prisma.invoiceInstallment.update({
    where: { id },
    data: { status, paidAt: status === "PAID" ? new Date() : null },
  });

  await logActivity(
    admin.id,
    "invoice.installment_status_changed",
    "Invoice",
    invoiceId,
    { status },
  );
  revalidatePath(`/admin/invoices/${invoiceId}`);
}

export async function deleteInvoiceInstallment(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("installmentId"));
  const invoiceId = String(formData.get("invoiceId"));

  await prisma.invoiceInstallment.delete({ where: { id } });
  await logActivity(
    admin.id,
    "invoice.installment_removed",
    "Invoice",
    invoiceId,
  );
  revalidatePath(`/admin/invoices/${invoiceId}`);
}
