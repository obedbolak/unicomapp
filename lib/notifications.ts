import { prisma } from "@/lib/prisma";

type NotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
};

/** Notifications should never block the action that triggered them. */
export async function createNotification(input: NotificationInput) {
  try {
    await prisma.notification.create({ data: input });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
