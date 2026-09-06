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

let registered: string | null = null;

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

  return registered;
}
