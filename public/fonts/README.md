# Fonts

`Carlito-Regular.ttf`, `Carlito-Bold.ttf`, `Carlito-Italic.ttf`,
`Carlito-BoldItalic.ttf`

Carlito by Łukasz Dziedzic, released under the **SIL Open Font License 1.1**
(<https://scripts.sil.org/OFL>), which permits bundling and redistribution with
this application.

Carlito is metric-compatible with Calibri: the same advance widths and
proportions. That is why the generated quotes and invoices sit on the page like
the Word documents they replace rather than merely resembling them.

Only `components/pdf/fonts.ts` reads these files, and only on the server. If
they are missing the PDF still renders — react-pdf falls back to its built-in
Helvetica and logs a warning — so a deployment that trims `public/` degrades
instead of failing.
