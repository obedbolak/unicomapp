// app/api/newsletter/route.ts
//
// "Stay in the loop" in the footer. Sign-ups are kept with the contact
// messages (admin → Messages, subject "Newsletter sign-up"), so there's one
// inbox and no database change. Signing up twice is harmless.

import { prisma } from "@/lib/prisma";
import { clip, ipOf, isEmail, limited } from "@/lib/inbound";

export const runtime = "nodejs";

const SERVICE = "newsletter";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (clip(body.website, 200)) return Response.json({ ok: true });

  if (limited(`newsletter:${ipOf(request)}`, 5, 60 * 60 * 1000)) {
    return Response.json(
      { error: "Too many attempts. Please try later." },
      { status: 429 },
    );
  }

  const email = clip(body.email, 200).toLowerCase();
  if (!isEmail(email)) {
    return Response.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const already = await prisma.contactMessage.findFirst({
      where: { email, service: SERVICE },
      select: { id: true },
    });
    if (!already) {
      await prisma.contactMessage.create({
        data: {
          name: "Newsletter subscriber",
          email,
          service: SERVICE,
          subject: "Newsletter sign-up",
          message: "Signed up for news and updates from the website footer.",
        },
      });
    }
  } catch (err) {
    console.error("[newsletter] could not save sign-up:", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
