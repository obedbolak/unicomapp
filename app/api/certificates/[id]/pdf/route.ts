// app/api/certificates/[id]/pdf/route.ts
//
// An issued certificate as a PDF — for admins, or for anyone holding the
// signed link we email to the certificate's holder (?t=…).
//   GET /api/certificates/<id>/pdf            → opens in the browser
//   GET /api/certificates/<id>/pdf?download=1 → saves as UCT-INT-2026-0001-Name.pdf
// Always drawn from the database, so a revoked certificate prints with a
// REVOKED banner and an edited one prints its current details.

import { requireAdmin } from "@/lib/auth";
import {
  checkCertificateToken,
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
  const { id } = await params;
  const url = new URL(request.url);
  const token = url.searchParams.get("t");
  const allowed =
    (token && checkCertificateToken(id, token)) || !!(await requireAdmin());
  if (!allowed) return new Response("Not authorized", { status: 401 });

  const input = await loadCertificateInput(id);
  if (!input) return new Response("Not found", { status: 404 });

  let pdf: Buffer;
  try {
    pdf = await renderCertificate(await certificatePayload(input));
  } catch (err) {
    console.error(`[pdf] failed to render certificate ${input.certNo}:`, err);
    return new Response("Could not render this certificate", { status: 500 });
  }

  const download = !!url.searchParams.get("download");
  return pdfResponse(
    pdf,
    certificateFilename(input.certNo, input.name),
    download,
  );
}
