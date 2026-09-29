// lib/qr.ts
//
// QR codes for anything we issue (quotes, invoices, certificates…).
//
// A QR code carries a LINK to our verify page, never the document's details.
// Details written into a QR can't be trusted — anyone can print a QR saying
// anything — whereas a link makes the reader's phone ask our database, which
// is the only source that can say "genuine, and still in force". It also
// keeps client names and amounts out of a code anyone can read.

import QRCode from "qrcode";

export type QrMatrix = {
  /** Width/height in modules, including the quiet zone. */
  size: number;
  /** One SVG path of all dark modules (1×1 squares), in module units. */
  path: string;
};

/**
 * Encodes `value` and returns the dark modules as a single SVG path, so it can
 * be drawn crisply by the browser (<svg>) or by react-pdf (<Svg>) at any size.
 * `quiet` is the blank border phones need to lock on (the spec asks for 4;
 * 2 is plenty when the code sits on white paper with space around it).
 */
export function qrMatrix(value: string, quiet = 2): QrMatrix {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
  const n = modules.size;
  let path = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (modules.get(x, y)) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
  }
  return { size: n + quiet * 2, path };
}

/* ── Verification links ─────────────────────────────────────────────────── */

/** "unicomteam.com" or "https://unicomteam.com/" → "https://unicomteam.com" */
function origin(website: string): string {
  const host = website.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${host}`;
}

/** Opens the quote/invoice check with the number and code already filled in. */
export function documentVerifyLink(website: string, number: string, code: string): string {
  const q = new URLSearchParams({ no: number, code });
  return `${origin(website)}/verify/document?${q.toString()}`;
}

/** Opens the certificate check for one certificate number. */
export function certificateVerifyLink(website: string, certNo: string): string {
  return `${origin(website)}/verify/${encodeURIComponent(certNo)}`;
}
