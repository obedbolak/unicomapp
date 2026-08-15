"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import type { Department, UserRole } from "@prisma/client";

const DEPARTMENTS: Department[] = [
  "ENGINEERING",
  "DESIGN",
  "GROWTH",
  "OPERATIONS",
];

export async function createTeamMember(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const title = String(formData.get("title") ?? "").trim() || null;
  const departmentRaw = String(formData.get("department") ?? "");
  const makeAdmin = formData.get("isAdmin") === "on";

  if (!email || !email.includes("@")) throw new Error("A valid email is required");
  if (!name) throw new Error("Name is required");
  if (password.length < 8) {
    throw new Error("The initial password must be at least 8 characters");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error(`${email} already has an account`);
  }

  const department = DEPARTMENTS.includes(departmentRaw as Department)
    ? (departmentRaw as Department)
    : null;

  const role: UserRole[] = makeAdmin ? ["ADMIN", "STAFF"] : ["STAFF"];

  const user = await prisma.user.create({
    data: {
      email,
      name,
      title,
      department,
      role,
      password: await bcrypt.hash(password, 12),
      active: true,
    },
    select: { id: true, email: true },
  });

  await logActivity(admin.id, "user.created", "User", user.id, {
    email,
    role,
  });

  revalidatePath("/admin/team");
}

export async function setUserRole(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const makeAdmin = String(formData.get("role")) === "ADMIN";

  // Never let the last admin demote themselves — that locks everyone out of
  // /admin with no way back in short of editing the database by hand.
  if (!makeAdmin) {
    const adminCount = await prisma.user.count({
      where: { role: { has: "ADMIN" }, active: true },
    });
    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (adminCount <= 1 && target?.role.includes("ADMIN")) {
      throw new Error("This is the only admin. Promote someone else first.");
    }
  }

  await prisma.user.update({
    where: { id },
    data: { role: makeAdmin ? ["ADMIN", "STAFF"] : ["STAFF"] },
  });

  await logActivity(admin.id, "user.role_changed", "User", id, {
    role: makeAdmin ? "ADMIN" : "STAFF",
  });

  revalidatePath("/admin/team");
}

/**
 * Deactivate / reactivate. This is the normal way to remove someone:
 * authorize() rejects inactive accounts and the jwt callback drops their live
 * sessions, so access ends immediately while their history stays intact.
 */
export async function toggleUserActive(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const current = await prisma.user.findUnique({
    where: { id },
    select: { active: true, role: true },
  });
  if (!current) throw new Error("No such user");

  if (current.active && current.role.includes("ADMIN")) {
    const adminCount = await prisma.user.count({
      where: { role: { has: "ADMIN" }, active: true },
    });
    if (adminCount <= 1) {
      throw new Error("This is the only active admin. Promote someone else first.");
    }
  }

  await prisma.user.update({
    where: { id },
    data: {
      active: !current.active,
      // Deactivating also kills every issued token, so they are signed out of
      // other devices rather than staying in until the JWT expires.
      ...(current.active ? { sessionsValidFrom: new Date() } : {}),
    },
  });

  await logActivity(
    admin.id,
    current.active ? "user.deactivated" : "user.reactivated",
    "User",
    id,
  );

  revalidatePath("/admin/team");
}

export async function resetUserPassword(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    throw new Error("The new password must be at least 8 characters");
  }

  await prisma.user.update({
    where: { id },
    data: {
      password: await bcrypt.hash(password, 12),
      // Force other devices back to the login screen with the new password.
      sessionsValidFrom: new Date(),
    },
  });

  await logActivity(admin.id, "user.password_reset", "User", id);
  revalidatePath("/admin/team");
}

/**
 * Permanent delete. Refused when the person has financial history, because
 * cascading that away would silently destroy earnings and payout records.
 * Deactivation is the right answer in almost every case.
 */
export async function deleteTeamMember(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  if (id === admin.id) throw new Error("You cannot delete your own account");

  const [earnings, payouts, target] = await Promise.all([
    prisma.earning.count({ where: { userId: id } }),
    prisma.payoutRequest.count({ where: { userId: id } }),
    prisma.user.findUnique({ where: { id }, select: { email: true, role: true } }),
  ]);

  if (!target) throw new Error("No such user");

  if (earnings > 0 || payouts > 0) {
    throw new Error(
      `${target.email} has ${earnings} earning(s) and ${payouts} payout record(s). Deleting would erase that financial history — deactivate them instead.`,
    );
  }

  if (target.role.includes("ADMIN")) {
    const adminCount = await prisma.user.count({
      where: { role: { has: "ADMIN" }, active: true },
    });
    if (adminCount <= 1) {
      throw new Error("This is the only admin. Promote someone else first.");
    }
  }

  await prisma.user.delete({ where: { id } });
  await logActivity(admin.id, "user.deleted", "User", id, {
    email: target.email,
  });

  revalidatePath("/admin/team");
}
