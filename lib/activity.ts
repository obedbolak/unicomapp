// lib/activity.ts
// Shared audit-trail writer. Extracted from app/admin/actions.ts so pages and
// actions outside the admin folder (auth events, the public contact form) can
// write to the same feed that /admin/activity reads.
//
// Logging must never break the operation it is recording, so every write is
// best-effort: failures are swallowed.

import { prisma } from "@/lib/prisma";

export type ActivityEntity =
  | "Enrollment"
  | "Payment"
  | "Certificate"
  | "Project"
  | "User"
  | "Invoice"
  | "ContactMessage"
  | "Setting"
  | "Auth";

export async function logActivity(
  userId: string | null,
  action: string,
  entity: ActivityEntity,
  entityId?: string | null,
  meta?: Record<string, unknown>,
): Promise<void> {
  await prisma.activityLog
    .create({
      data: {
        userId: userId ?? undefined,
        action,
        entity,
        entityId: entityId ?? undefined,
        meta: meta as never,
      },
    })
    .catch(() => {});
}

/** Human-readable label for an action string like "payment.status_changed". */
export function describeAction(action: string): string {
  const [subject, verb] = action.split(".");
  if (!verb) return action;
  const readable = verb.replace(/_/g, " ");
  return `${subject.charAt(0).toUpperCase()}${subject.slice(1)} ${readable}`;
}
