import { NextResponse } from "next/server";
import { sendEnrollmentEmails, type EnrollmentPayload } from "@/lib/emailjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body: Partial<EnrollmentPayload>) {
  const required: (keyof EnrollmentPayload)[] = [
    "fullName",
    "email",
    "phone",
    "country",
    "course",
    "cohort",
    "level",
    "goals",
    "plan",
  ];
  for (const key of required) {
    if (!body[key] || !String(body[key]).trim()) return `Missing field: ${key}`;
  }
  if (!EMAIL_RE.test(String(body.email))) return "Invalid email address.";
  return null;
}

export async function POST(req: Request) {
  let body: Partial<EnrollmentPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const error = validate(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    await sendEnrollmentEmails(body as EnrollmentPayload);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Enrollment email error:", err);

    return NextResponse.json(
      { error: "Could not send confirmation email. Please try again." },
      { status: 502 },
    );
  }
}
