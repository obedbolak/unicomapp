"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { deleteObject } from "@/lib/r2";
import { logActivity } from "@/lib/activity";

export async function deleteMediaAction(uploadId: string) {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
    });

    if (!upload || upload.category !== "media") {
      return { success: false, error: "Media not found" };
    }

    // Delete from R2 bucket
    await deleteObject("media", upload.key);

    // Delete from database
    await prisma.upload.delete({
      where: { id: uploadId },
    });

    await logActivity(admin.id, "media.deleted", "User", upload.id, {
      filename: upload.filename,
      key: upload.key,
    });
    revalidatePath("/admin/media");

    return { success: true };
  } catch (error: any) {
    console.error("deleteMediaAction error:", error);
    return { success: false, error: error.message || "Failed to delete media" };
  }
}
