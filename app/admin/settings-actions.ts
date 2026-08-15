"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { saveSettings, SETTING_KEYS, type Settings } from "@/lib/settings";

/* ── Profile ─────────────────────────────────────────────────────────────── */

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  if (!user) throw new Error("Not authorized");

  const str = (k: string, max: number) =>
    String(formData.get(k) ?? "")
      .trim()
      .slice(0, max);

  const name = str("name", 120);
  if (!name) throw new Error("Name is required");

  const image = str("image", 500) || null;

  // Job title is an organisational fact, not a personal preference. The input
  // is disabled for staff, but a disabled input is a UI convention, not a
  // permission — so the value is simply ignored unless the caller is an admin.
  const isAdmin = user.role?.includes("ADMIN") ?? false;
  const title = isAdmin ? str("title", 120) || null : undefined;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      ...(title !== undefined ? { title } : {}),
      phone: str("phone", 40) || null,
      bio: str("bio", 1000) || null,
      image,
    },
  });

  await logActivity(user.id, "user.profile_updated", "User", user.id);

  // "layout" scope, not the default "page" — the avatar lives in the Shell,
  // which is rendered by the layout. Revalidating only the page would leave
  // the topbar showing the previous photo.
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function changePassword(formData: FormData) {
  const user = await requireUser();
  if (!user) throw new Error("Not authorized");

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (next.length < 8) {
    throw new Error("New password must be at least 8 characters");
  }
  if (next !== confirm) {
    throw new Error("New password and confirmation do not match");
  }

  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  });
  if (!row?.password) {
    throw new Error("This account has no password set");
  }

  const ok = await bcrypt.compare(current, row.password);
  if (!ok) throw new Error("Current password is incorrect");

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(next, 12) },
  });

  await logActivity(user.id, "user.password_changed", "User", user.id);
  revalidatePath("/admin/profile");
}

/**
 * Revokes every issued token by stamping sessionsValidFrom. The jwt callback in
 * lib/auth.ts drops any token issued before this instant, so other devices are
 * signed out on their next request — no database-session strategy required.
 */
export async function signOutEverywhere() {
  const user = await requireUser();
  if (!user) throw new Error("Not authorized");

  await prisma.user.update({
    where: { id: user.id },
    data: { sessionsValidFrom: new Date() },
  });

  await logActivity(user.id, "auth.sessions_revoked", "Auth", user.id);
  revalidatePath("/admin/profile");
}

export async function updateNotificationPrefs(formData: FormData) {
  const user = await requireUser();
  if (!user) throw new Error("Not authorized");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      notifyOnLead: formData.get("notifyOnLead") === "on",
      notifyOnPayment: formData.get("notifyOnPayment") === "on",
    },
  });

  revalidatePath("/admin/settings");
}

/* ── Organization settings ───────────────────────────────────────────────── */

export async function updateOrgSettings(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const values: Partial<Settings> = {};
  for (const key of SETTING_KEYS) {
    const raw = formData.get(key);
    if (typeof raw === "string") values[key] = raw.trim();
  }

  await saveSettings(values);
  await logActivity(admin.id, "setting.updated", "Setting", null, {
    keys: Object.keys(values),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/payments");
}
