"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import type { LeadStatus } from "@prisma/client";

export async function updateMessageStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as LeadStatus;

  await prisma.contactMessage.update({
    where: { id },
    data: {
      status,
      // Whoever moves it out of NEW owns it from then on.
      handledById: status === "NEW" ? null : admin.id,
    },
  });

  await logActivity(admin.id, "message.status_changed", "ContactMessage", id, {
    status,
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function claimMessage(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));

  await prisma.contactMessage.update({
    where: { id },
    data: { handledById: admin.id, status: "READ" },
  });

  await logActivity(admin.id, "message.claimed", "ContactMessage", id);
  revalidatePath("/admin/messages");
}
