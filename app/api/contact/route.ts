// app/api/contact/route.ts
//
// The contact page's form. Each message is saved first (it appears in
// admin → Messages), then the team is emailed and the sender gets a short
// "we've received it" reply. If email fails the message is still saved, so
// nothing a client sends is ever lost.

import { prisma } from "@/lib/prisma";
import { sendContactEmails } from "@/lib/emailjs";
import { clip, ipOf, isEmail, limited } from "@/lib/inbound";

export const runtime = "nodejs";

const SERVICE_LABEL: Record<string, string> = {
  software: "Software Development",
  mobile: "Mobile / Web App",
  marketing: "Digital Marketing",
  social: "Social Media",
  strategy: "Business Strategy",
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Hidden field real visitors never see or fill. Bots fill everything.
  // Answer "ok" so they don't learn anything, and save nothing.
  if (clip(body.website, 200)) return Response.json({ ok: true });

  if (limited(`contact:${ipOf(request)}`, 5, 60 * 60 * 1000)) {
    return Response.json(
      {
        error:
          "You've sent several messages already. Please try again later, or email contact@unicomteam.com.",
      },
      { status: 429 },
    );
  }

  const name = clip(body.name, 120);
  const email = clip(body.email, 200).toLowerCase();
  const company = clip(body.company, 160);
  const projectType = clip(body.projectType, 40);
  const budget = clip(body.budget, 60);
  const timeline = clip(body.timeline, 60);
  const message = clip(body.message, 5000);

  if (!name || !isEmail(email) || !projectType || message.length < 20) {
    return Response.json(
      {
        error:
          "Please fill in your name, a valid email, the project type and a message of at least 20 characters.",
      },
      { status: 400 },
    );
  }

  const service = SERVICE_LABEL[projectType] ?? projectType;
  const details = [
    company && `Company: ${company}`,
    budget && `Budget: ${budget}`,
    timeline && `Timeline: ${timeline}`,
  ].filter(Boolean);

  try {
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        service,
        subject: `Project enquiry — ${service}`,
        message: details.length
          ? `${message}\n\n${details.join("\n")}`
          : message,
      },
    });
  } catch (err) {
    console.error("[contact] could not save message:", err);
    return Response.json(
      {
        error:
          "We couldn't send your message just now. Please try again, or email contact@unicomteam.com.",
      },
      { status: 500 },
    );
  }

  // Saved — now tell the team and the sender. Failures are logged only.
  await sendContactEmails({
    name,
    email,
    company,
    service,
    budget,
    timeline,
    message,
  }).catch((err) => console.error("[contact] email failed:", err));

  return Response.json({ ok: true });
}
