import { NextResponse } from "next/server";
import { sendEnrollmentEmails, type EnrollmentPayload } from "@/lib/emailjs";
import { prisma } from "@/lib/prisma";
import { nextEnrollmentReference, parseAmount } from "@/lib/reference";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+(?:[1-9]\d{1,3})[\d\s.-]{6,14}$/;

// The form sends a few extra fields the email template ignores.
type IncomingPayload = EnrollmentPayload & {
  type?: "training" | "internship";
  portfolio?: string;
};

function validate(body: Partial<IncomingPayload>) {
  const required: (keyof EnrollmentPayload)[] = [
    "fullName",
    "email",
    "phone",
    "country",
    "course",
    "cohort",
    "months",
    "level",
    "goals",
    "plan",
  ];
  for (const key of required) {
    if (!body[key] || !String(body[key]).trim()) return `Missing field: ${key}`;
  }
  if (!EMAIL_RE.test(String(body.email))) return "Invalid email address.";
  if (!PHONE_RE.test(String(body.phone).trim()))
    return "Invalid phone number. Use an international format like +237 6xx xxx xxx.";
  return null;
}

export async function POST(req: Request) {
  let body: Partial<IncomingPayload>;
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

  const data = body as IncomingPayload;
  const email = data.email.trim().toLowerCase();
  const type = data.type === "internship" ? "INTERNSHIP" : "TRAINING";

  /* ── 1. Persist first, so a failed email never loses the lead ─────────── */

  let enrollmentId: string | null = null;
  let reference: string | null = null;

  try {
    // Match the selected course to a Program row when we can.
    const program = await prisma.program.findFirst({
      where: { title: data.course },
      select: { id: true },
    });

    const student = await prisma.student.upsert({
      where: { email },
      update: {
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        country: data.country,
        ...(data.portfolio ? { portfolioUrl: data.portfolio.trim() } : {}),
      },
      create: {
        fullName: data.fullName.trim(),
        email,
        phone: data.phone.trim(),
        country: data.country,
        portfolioUrl: data.portfolio?.trim() || null,
      },
    });

    reference = await nextEnrollmentReference();

    const enrollment = await prisma.enrollment.create({
      data: {
        reference,
        type,
        fullName: data.fullName.trim(),
        email,
        phone: data.phone.trim(),
        country: data.country,
        portfolioUrl: data.portfolio?.trim() || null,
        programId: program?.id,
        courseName: data.course,
        category: data.category || null,
        level: data.level,
        months: data.months ? Number(data.months) : null,
        cohortLabel: data.cohort,
        goals: data.goals,
        plan: data.plan === "Monthly Installments" ? "INSTALLMENTS" : "FULL",
        priceLabel: data.price || null,
        registrationFeeLabel: data.registrationFee || null,
        priceAmount: parseAmount(data.price),
        registrationFee: parseAmount(data.registrationFee),
        paymentNote: data.paymentNote || null,
        studentId: student.id,
      },
      select: { id: true, reference: true },
    });

    enrollmentId = enrollment.id;

    // A registration fee was quoted → open a pending payment to chase.
    const feeAmount = parseAmount(data.registrationFee);
    if (feeAmount) {
      await prisma.payment.create({
        data: {
          amount: feeAmount,
          currency: "XAF",
          method: "MOMO",
          status: "PENDING",
          kind: "REGISTRATION_FEE",
          payerName: data.fullName.trim(),
          enrollmentId: enrollment.id,
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        action: "enrollment.created",
        entity: "Enrollment",
        entityId: enrollment.id,
        meta: { reference, course: data.course, type },
      },
    });
  } catch (err) {
    console.error("Enrollment save error:", err);
    return NextResponse.json(
      {
        error:
          "We could not save your application. Please try again in a moment.",
      },
      { status: 503 },
    );
  }

  /* ── 2. Then send the confirmation emails ─────────────────────────────── */

  try {
    await sendEnrollmentEmails(data as EnrollmentPayload);

    if (enrollmentId) {
      await prisma.enrollment
        .update({
          where: { id: enrollmentId },
          data: { emailSent: true, emailSentAt: new Date(), emailError: null },
        })
        .catch(() => {});
    }

    return NextResponse.json({ ok: true, reference });
  } catch (err) {
    console.error("Enrollment email error:", err);

    if (enrollmentId) {
      await prisma.enrollment
        .update({
          where: { id: enrollmentId },
          data: { emailSent: false, emailError: String(err).slice(0, 500) },
        })
        .catch(() => {});

      // Saved but not emailed — tell the applicant they're registered.
      return NextResponse.json(
        {
          ok: true,
          reference,
          warning:
            "Your application was received, but the confirmation email could not be sent. Our team will contact you directly.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { error: "Could not send confirmation email. Please try again." },
      { status: 502 },
    );
  }
}
