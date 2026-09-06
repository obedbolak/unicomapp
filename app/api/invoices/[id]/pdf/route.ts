// app/api/invoices/[id]/pdf/route.ts
//
// Streams a quote or invoice as a PDF.
//
// Rendering happens on the server rather than in the browser for three
// reasons: @react-pdf/renderer and the four embedded font faces would add
// roughly half a megabyte to the admin bundle; the same function is what a
// future "e-mail this quote" job will call; and the document is generated from
// the database rather than from whatever the page happened to have in state,
// so what the client receives is always what is stored.
//
//   GET /api/invoices/<id>/pdf            → opens in the browser's viewer
//   GET /api/invoices/<id>/pdf?download=1 → saves as UCT-QTE-2026-0001.pdf

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireAdmin } from "@/lib/auth";
import { loadDocument } from "@/lib/documents.server";
import { documentFilename } from "@/lib/documents";
import { registerFonts } from "@/components/pdf/fonts";
import { BusinessDocument } from "@/components/pdf/BusinessDocument";

// The document must reflect the database at the moment of the request — a
// cached quote that still shows last week's line items is worse than no PDF.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return new Response("Not authorized", { status: 401 });
  }

  const { id } = await params;
  const doc = await loadDocument(id);
  if (!doc) {
    return new Response("Not found", { status: 404 });
  }

  const font = registerFonts();

  let pdf: Buffer;
  try {
    pdf = await renderToBuffer(
      React.createElement(BusinessDocument, { doc, font }),
    );
  } catch (err) {
    // Rendering can fail on a malformed image or an unrepresentable glyph.
    // Answer 500 with a readable message rather than letting an exception in a
    // stream handler turn into a truncated download.
    console.error(`[pdf] failed to render ${doc.number}:`, err);
    return new Response("Could not render this document", { status: 500 });
  }

  const download = new URL(request.url).searchParams.get("download");
  const disposition = download ? "attachment" : "inline";

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.length),
      "Content-Disposition": `${disposition}; filename="${documentFilename(doc)}"`,
      // The number is unique per document but its contents change while it is
      // a draft, so never let a proxy hold on to a copy.
      "Cache-Control": "private, no-store",
    },
  });
}
