"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getSettings } from "@/lib/settings";
import { nextInvoiceNumber } from "@/lib/reference";
import type { InvoiceStatus } from "@prisma/client";

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
  const number = await nextInvoiceNumber(settings.invoicePrefix);

  const clientId = String(formData.get("clientId") ?? "") || null;
  const projectId = String(formData.get("projectId") ?? "") || null;
  const dueRaw = String(formData.get("dueDate") ?? "");
  const tax = Number(formData.get("tax") ?? 0) || 0;

  const invoice = await prisma.invoice.create({
    data: {
      number,
      clientId,
      projectId,
      dueDate: dueRaw ? new Date(dueRaw) : null,
      currency: settings.currency,
      tax,
      total: tax,
      notes: String(formData.get("notes") ?? "").slice(0, 2000) || null,
    },
  });

  await logActivity(admin.id, "invoice.created", "Invoice", invoice.id, {
    number,
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

  const count = await prisma.invoiceItem.count({ where: { invoiceId } });

  await prisma.invoiceItem.create({
    data: {
      invoiceId,
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
