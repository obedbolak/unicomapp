// components/pdf/theme.ts
//
// The look of the printed document, in one place.
//
// The measurements are not arbitrary: the page is US Letter with 1 inch
// margins (72pt), giving a 468pt text column — Word's default — and the column
// widths below are that 468pt divided the way the original document divides
// it. Anything that needs to line up across the four different tables on the
// page lines up because it is derived from the same constant.

import { StyleSheet } from "@react-pdf/renderer";

/* ── Tokens ──────────────────────────────────────────────────────────────── */

export const COLORS = {
  /** Headings, table headers, totals. Word's "Blue, Accent 1, Darker 50%". */
  navy: "#1F4E79",
  /** Secondary blue for the scope paragraph and the letterhead strapline. */
  steel: "#41719C",
  ink: "#000000",
  muted: "#595959",
  /** Zebra / label-cell fill. */
  fill: "#F2F2F2",
  border: "#BFBFBF",
  white: "#FFFFFF",
  paid: "#1E7B34",
} as const;

export const PAGE = {
  margin: 72,
  /** 8.5in − 2in of margin. Every table below sums to this. */
  width: 468,
} as const;

/** Meta table: label | value | label | value. */
export const META_COLS = [87, 144, 91, 146] as const;

/** Line-item tables: item | description | amount. */
export const ITEM_COLS = [130, 230, 108] as const;

/** Financial summary: item | amount. */
export const SUMMARY_COLS = [324, 144] as const;

/** Payment schedule: instalment | trigger | amount | status. */
export const SCHEDULE_COLS = [86, 236, 91, 55] as const;

/** Signature block: two equal halves. */
export const SIGN_COLS = [234, 234] as const;

/* ── Styles ──────────────────────────────────────────────────────────────── */

export function createStyles(font: string) {
  return StyleSheet.create({
    page: {
      fontFamily: font,
      fontSize: 9,
      color: COLORS.ink,
      paddingTop: 40,
      paddingBottom: 56,
      paddingHorizontal: PAGE.margin,
      // No lineHeight anywhere in this file, on purpose, for two reasons.
      // react-pdf's default leading comes from the font's own metrics and is
      // exactly the tight Word-like spacing this document wants; any explicit
      // multiplier — even 1 — measures against the line box rather than the
      // glyphs and opens a visible gap inside wrapped table cells. And a
      // lineHeight set on the Page additionally makes the renderer drop every
      // fixed block containing a dynamic `render` Text, which silently loses
      // the page-number footer.
    },

    /* ── Letterhead ──────────────────────────────────────────────────── */
    letterhead: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 26,
    },
    lockup: { flexDirection: "row", alignItems: "center" },
    logo: { width: 34, height: 34, objectFit: "contain", marginRight: 7 },
    wordmark: {
      fontSize: 14.5,
      fontWeight: 700,
      color: COLORS.navy,
    },
    wordmarkSub: {
      fontSize: 5,
      fontWeight: 700,
      color: COLORS.muted,
      letterSpacing: 1.1,
      marginTop: 1,
    },
    letterheadRight: { alignItems: "flex-end", paddingTop: 4 },
    tagline: {
      fontSize: 9,
      fontStyle: "italic",
      color: COLORS.steel,
      marginBottom: 3,
    },
    contactLine: { fontSize: 8.5, color: COLORS.muted },

    /* ── Titles ──────────────────────────────────────────────────────── */
    title: {
      fontSize: 14,
      fontWeight: 700,
      color: COLORS.navy,
      textAlign: "center",
      marginBottom: 8,
    },
    subject: {
      fontSize: 11,
      fontWeight: 700,
      textAlign: "center",
      marginBottom: 18,
    },
    sectionHeading: {
      fontSize: 11.5,
      fontWeight: 700,
      color: COLORS.navy,
      textAlign: "center",
      marginTop: 20,
      marginBottom: 3,
    },
    sectionSubtitle: {
      fontSize: 9,
      fontStyle: "italic",
      color: COLORS.muted,
      textAlign: "center",
      marginBottom: 8,
    },
    blockHeading: {
      fontSize: 11.5,
      fontWeight: 700,
      color: COLORS.navy,
      textAlign: "center",
      marginTop: 22,
      marginBottom: 9,
    },
    scope: {
      fontSize: 9.5,
      fontStyle: "italic",
      color: COLORS.steel,
      textAlign: "center",
      marginTop: 14,
      marginBottom: 4,
      paddingHorizontal: 6,
    },

    /* ── Tables ──────────────────────────────────────────────────────── */
    // Each cell draws its own right and bottom border and the table draws the
    // outer top and left, so adjacent borders never double up into a 2pt line.
    table: {
      width: PAGE.width,
      borderTopWidth: 0.75,
      borderLeftWidth: 0.75,
      borderColor: COLORS.border,
      borderStyle: "solid",
    },
    row: { flexDirection: "row", alignItems: "stretch" },
    cell: {
      borderRightWidth: 0.75,
      borderBottomWidth: 0.75,
      borderColor: COLORS.border,
      borderStyle: "solid",
      paddingVertical: 6,
      paddingHorizontal: 7,
      justifyContent: "center",
    },
    headerRow: { backgroundColor: COLORS.navy },
    headerCell: {
      color: COLORS.white,
      fontWeight: 700,
      fontSize: 9,
      textAlign: "center",
      borderColor: COLORS.navy,
    },
    fillCell: { backgroundColor: COLORS.fill },
    cellFlush: { paddingVertical: 0, paddingHorizontal: 0 },
    centered: { textAlign: "center" },
    right: { textAlign: "right" },
    bold: { fontWeight: 700 },
    navyText: { color: COLORS.navy },
    mutedText: { color: COLORS.muted },
    totalRow: { backgroundColor: COLORS.fill },
    totalText: { fontWeight: 700, color: COLORS.navy, fontSize: 9.5 },
    grandTotalText: { fontWeight: 700, color: COLORS.navy, fontSize: 10.5 },

    /* ── Terms ───────────────────────────────────────────────────────── */
    term: { flexDirection: "row", marginBottom: 5, paddingHorizontal: 10 },
    termNumber: {
      width: 16,
      fontWeight: 700,
      color: COLORS.navy,
      textAlign: "right",
      marginRight: 6,
    },
    termText: { flex: 1, fontSize: 9, textAlign: "justify" },

    /* ── Signatures ──────────────────────────────────────────────────── */
    signHeaderCell: {
      backgroundColor: COLORS.fill,
      fontWeight: 700,
      color: COLORS.navy,
      textAlign: "center",
      fontSize: 9.5,
      paddingVertical: 7,
    },
    signBody: { paddingTop: 12, paddingBottom: 12, paddingHorizontal: 10 },
    signPrompt: {
      fontWeight: 700,
      textAlign: "center",
      fontSize: 9.5,
      marginBottom: 30,
    },
    signRule: {
      borderBottomWidth: 0.75,
      borderColor: COLORS.border,
      borderStyle: "solid",
      marginHorizontal: 22,
      marginBottom: 7,
    },
    signName: { textAlign: "center", fontSize: 9 },

    /* ── Notes & footer ──────────────────────────────────────────────── */
    notesHeading: {
      fontSize: 9.5,
      fontWeight: 700,
      color: COLORS.navy,
      marginTop: 20,
      marginBottom: 4,
    },
    notes: { fontSize: 9, color: COLORS.ink, textAlign: "justify" },

    footer: {
      position: "absolute",
      bottom: 28,
      left: PAGE.margin,
      width: PAGE.width,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 7.5,
      color: COLORS.muted,
      borderTopWidth: 0.75,
      borderColor: COLORS.border,
      borderStyle: "solid",
      paddingTop: 5,
    },

    /* ── Status pill in the schedule ─────────────────────────────────── */
    statusText: { fontSize: 8.5, fontWeight: 700, textAlign: "center" },

    spacer12: { height: 12 },
  });
}

export type DocStyles = ReturnType<typeof createStyles>;
