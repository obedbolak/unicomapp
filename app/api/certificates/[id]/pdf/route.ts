// app/api/certificates/[id]/pdf/route.ts
//
// An issued certificate as a PDF (admin only).
//   GET /api/certificates/<id>/pdf            → opens in the browser
//   GET /api/certificates/<id>/pdf?download=1 → saves as UCT-INT-2026-0001-Name.pdf
// Always drawn from the database, so a revoked certificate prints with a
// REVOKED banner and an edited one prints its current details.

import { requireAdmin } from "@/lib/auth";
import {
  certificateFilename,
  certificatePayload,
  loadCertificateInput,
  pdfResponse,
  renderCertificate,
} from "@/lib/certificates.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return new Response("Not authorized", { status: 401 });

  const { id } = await params;
  const input = await loadCertificateInput(id);
  if (!input) return new Response("Not found", { status: 404 });

  let pdf: Buffer;
  try {
    pdf = await renderCertificate(await certificatePayload(input));
  } catch (err) {
    console.error(`[pdf] failed to render certificate ${input.certNo}:`, err);
    return new Response("Could not render this certificate", { status: 500 });
  }

  const download = !!new URL(request.url).searchParams.get("download");
  return pdfResponse(pdf, certificateFilename(input.certNo, input.name), download);
}
