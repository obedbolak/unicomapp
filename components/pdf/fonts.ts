// components/pdf/fonts.ts
//
// Carlito is metric-compatible with Calibri — same advance widths, same
// proportions — which is why the rendered PDF sits on the page like the Word
// original rather than merely resembling it. The four faces live in
// /public/fonts and are licensed under the SIL Open Font License 1.1, so they
// can be redistributed with the app.
//
// If the files are missing (a trimmed deployment, a fresh clone before assets
// are pulled) registration is skipped and the template falls back to
// Helvetica, which react-pdf has built in. A document that prints in the wrong
// typeface is a smaller failure than one that does not print.

import path from "node:path";
import fs from "node:fs";
import { Font } from "@react-pdf/renderer";

export const BODY_FONT = "Carlito";
export const FALLBACK_FONT = "Helvetica";
/** The logo's typeface. Used only for the letterhead wordmark. */
export const BRAND_FONT = "Poppins";

let registered: string | null = null;
let brandRegistered: string | null = null;

/**
 * Registers Poppins (SemiBold + Bold) so the letterhead wordmark matches the
 * UnicomTeam logo. Separate from Carlito on purpose: if the Poppins files are
 * missing, only the wordmark falls back to the body font — the rest of the
 * document is untouched.
 */
function registerBrandFont(bodyFont: string): string {
  if (brandRegistered) return brandRegistered;
  const dir = path.join(process.cwd(), "public", "fonts");
  const faces = [
    { file: "Poppins-SemiBold.ttf", fontWeight: 600 as const },
    { file: "Poppins-Bold.ttf", fontWeight: 700 as const },
  ].map((f) => ({ ...f, src: path.join(dir, f.file) }));

  if (!faces.every((f) => fs.existsSync(f.src))) {
    console.warn("[pdf] Poppins not found in /public/fonts — wordmark uses the body font.");
    brandRegistered = bodyFont;
    return brandRegistered;
  }
  try {
    Font.register({
      family: BRAND_FONT,
      fonts: faces.map(({ src, fontWeight }) => ({ src, fontWeight, fontStyle: "normal" as const })),
    });
    brandRegistered = BRAND_FONT;
  } catch (err) {
    console.warn("[pdf] Poppins registration failed, wordmark uses the body font:", err);
    brandRegistered = bodyFont;
  }
  return brandRegistered;
}

/** Font family for the letterhead wordmark (Poppins, or the body font as a fallback). */
export function brandFont(bodyFont: string): string {
  return brandRegistered ?? registerBrandFont(bodyFont);
}

export function registerFonts(): string {
  if (registered) return registered;

  const dir = path.join(process.cwd(), "public", "fonts");

  const faces = [
    { file: "Carlito-Regular.ttf", fontWeight: 400 as const, fontStyle: "normal" as const },
    { file: "Carlito-Bold.ttf", fontWeight: 700 as const, fontStyle: "normal" as const },
    { file: "Carlito-Italic.ttf", fontWeight: 400 as const, fontStyle: "italic" as const },
    { file: "Carlito-BoldItalic.ttf", fontWeight: 700 as const, fontStyle: "italic" as const },
  ];

  const sources = faces.map((f) => ({ ...f, src: path.join(dir, f.file) }));

  if (!sources.every((s) => fs.existsSync(s.src))) {
    console.warn(
      "[pdf] Carlito faces not found in /public/fonts — falling back to Helvetica.",
    );
    registered = FALLBACK_FONT;
    registerBrandFont(registered);
    return registered;
  }

  try {
    Font.register({
      family: BODY_FONT,
      fonts: sources.map(({ src, fontWeight, fontStyle }) => ({
        src,
        fontWeight,
        fontStyle,
      })),
    });

    // react-pdf breaks lines at spaces only unless told otherwise. Long
    // hyphenated service names ("Front-End Development") would otherwise be
    // split mid-word in narrow table cells.
    Font.registerHyphenationCallback((word) => [word]);

    registered = BODY_FONT;
  } catch (err) {
    console.warn("[pdf] font registration failed, using Helvetica:", err);
    registered = FALLBACK_FONT;
  }

  registerBrandFont(registered);
  return registered;
}
