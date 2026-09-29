// app/api/certificates/preview/route.ts
//
// "Preview" on the Issue a certificate form posts here (in a new tab). It
// draws the certificate from what was typed, WITHOUT saving anything: no
// number is used up and nothing becomes verifiable. The PDF carries a
// PREVIEW watermark so it can't be passed off as the real thing.

import { requireAdmin } from "@/lib/auth";
import { nextCertificateNumber } from "@/lib/reference";
import {
  CERT_PREFIX,
  certificatePayload,
  pdfResponse,
  renderCertificate,
} from "@/lib/certificates.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

function page(message: string, status = 400) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Preview</title>
<body style="font-family:system-ui;padding:2rem;max-width:34rem;margin:auto">
<h2 style="margin:0 0 .5rem">Can't preview yet</h2><p>${message}</p>
<p style="color:#666">Close this tab, complete the form and press Preview again.</p></body>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return new Response("Not authorized", { status: 401 });

  const f = await request.formData();
  const type = (text(f, "type") || "INTERNSHIP") as keyof typeof CERT_PREFIX;
  const name = text(f, "name");
  const program = text(f, "program");
  const department = text(f, "department");
  const periodStart = text(f, "periodStart");
  const periodEnd = text(f, "periodEnd");

  const missing = [
    !name && "holder name",
    !program && "programme",
    !department && "department",
    !periodStart && "period start",
    !periodEnd && "period end",
  ].filter(Boolean);
  if (missing.length) return page(`Please fill in: ${missing.join(", ")}.`);
  if (new Date(periodEnd) < new Date(periodStart)) {
    return page("The period ends before it starts — check the two dates.");
  }

  // Show the number it WOULD get. Counting doesn't reserve it.
  const certNo =
    text(f, "certNo").toUpperCase() ||
    (await nextCertificateNumber(CERT_PREFIX[type] ?? "INT"));

  const payload = await certificatePayload(
    {
      certNo,
      name,
      type,
      program,
      department,
      periodStart,
      periodEnd,
      dateIssued: text(f, "dateIssued") || new Date().toISOString().slice(0, 10),
      supervisorName: text(f, "supervisorName") || "Obed Bolak Fuchu",
      supervisorTitle: text(f, "supervisorTitle") || "CEO & Internship Supervisor",
    },
    "preview",
  );

  try {
    const pdf = await renderCertificate(payload);
    return pdfResponse(pdf, `PREVIEW-${certNo}.pdf`, false);
  } catch (err) {
    console.error("[pdf] certificate preview failed:", err);
    return page("Something went wrong drawing the certificate.", 500);
  }
}
