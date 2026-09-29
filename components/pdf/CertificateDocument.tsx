// components/pdf/CertificateDocument.tsx
//
// Landscape A4 certificate (internship, training, crash course). The design is
// fixed; the admin only supplies the recipient, programme, department, dates
// and supervisor. The wording, title and duration come from the type.

import React from "react";
import path from "node:path";
import fs from "node:fs";
import {
  Document, Page, View, Text, Image, Svg, Path, Rect, Polygon, Line, Font, StyleSheet,
} from "@react-pdf/renderer";
import { PdfQrCode } from "./PdfQrCode";

/* ── Fonts ──────────────────────────────────────────────────────────────── */

let fontsReady = false;
function registerCertificateFonts() {
  if (fontsReady) return;
  const dir = path.join(process.cwd(), "public", "fonts");
  const f = (file: string) => path.join(dir, file);
  Font.register({
    family: "Playfair",
    fonts: [
      { src: f("PlayfairDisplay-Bold.ttf"), fontWeight: 700 },
      { src: f("PlayfairDisplay-MediumItalic.ttf"), fontWeight: 500, fontStyle: "italic" },
    ],
  });
  Font.register({
    family: "PoppinsCert",
    fonts: [
      { src: f("Poppins-Regular.ttf"), fontWeight: 400 },
      { src: f("Poppins-Medium.ttf"), fontWeight: 500 },
      { src: f("Poppins-SemiBold.ttf"), fontWeight: 600 },
      { src: f("Poppins-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((w) => [w]);
  fontsReady = true;
}

/* ── Data ───────────────────────────────────────────────────────────────── */

export type CertificateKind = "internship" | "training" | "crash-course";

export type CertificatePayload = {
  certNo: string;
  name: string;
  type: CertificateKind;
  program: string;
  department: string;
  periodStart: string; // ISO
  periodEnd: string;
  dateIssued: string;
  supervisor: string;
  supervisorTitle: string;
  verifyLink: string;   // full https link for the QR
  verifyUrl: string;    // short form printed under it
  logo: string | null;  // data URI of the U mark
  signature: string | null;
  stamp: string | null;
  /** "preview" = not issued yet (watermarked); "revoked" = no longer valid. */
  mode?: "issued" | "preview" | "revoked";
};

const NAVY = "#0A1545";
const NAVY_SOFT = "#1B2A6B";
const ORANGE = "#FC400C";
const INK = "#3A4260";
const MUTED = "#7A8199";

const W = 841.89;
const H = 595.28;

const KIND: Record<CertificateKind, { subtitle: string; verb: (p: CertificatePayload, d: string) => React.ReactNode }> = {
  internship: {
    subtitle: "OF INTERNSHIP",
    verb: (p, d) => (
      <>
        has successfully completed a {d} internship on our{" "}
        <Text style={s.em}>{clean(p.program, /\s+internship( programme)?$/i)}</Text> programme within the {p.department} department,
        from {fmt(p.periodStart)} to {fmt(p.periodEnd)}. Throughout this period they showed
        professionalism, commitment and a genuine eagerness to learn.
      </>
    ),
  },
  training: {
    subtitle: "OF TRAINING",
    verb: (p, d) => (
      <>
        has successfully completed the <Text style={s.em}>{clean(p.program, /\s+training( programme)?$/i)}</Text> training, a {d}{" "}
        programme delivered by our {p.department} team from {fmt(p.periodStart)} to{" "}
        {fmt(p.periodEnd)}, meeting all of its requirements.
      </>
    ),
  },
  "crash-course": {
    subtitle: "OF COMPLETION",
    verb: (p, d) => (
      <>
        has successfully completed the intensive <Text style={s.em}>{clean(p.program, /\s+crash[- ]course$/i)}</Text> crash
        course, a {d} programme delivered by our {p.department} team from{" "}
        {fmt(p.periodStart)} to {fmt(p.periodEnd)}.
      </>
    ),
  },
};

function fmt(iso: string) {
  // Dates are stored as midnight UTC; format in UTC so no server time zone
  // can push them back a day.
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** "Full Stack Development Internship" → "Full Stack Development", so the
 *  sentence never reads "internship on our … Internship programme". */
function clean(program: string, suffix: RegExp) {
  const out = program.trim().replace(suffix, "");
  return out || program.trim();
}

/** "3-month", "6-week", "5-day" — worked out from the dates, never typed. */
function duration(startIso: string, endIso: string): string {
  const a = new Date(startIso), b = new Date(endIso);
  const days = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1);
  const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + (b.getDate() >= a.getDate() - 1 ? 0 : -1);
  if (days >= 56 && months >= 2) return `${months}-month`;
  if (days >= 14) return `${Math.round(days / 7)}-week`;
  return `${days}-day`;
}

function nameSize(name: string) {
  const n = name.length;
  return n <= 22 ? 42 : n <= 28 ? 36 : n <= 36 ? 30 : 25;
}

/* ── Guilloche (security-print rosette, drawn as vector lines) ──────────── */

function rosette(cx: number, cy: number, R: number, amp: number, lobes: number, loops: number): string {
  let d = "";
  const steps = 720;
  for (let j = 0; j < loops; j++) {
    const phase = (j / loops) * 2 * Math.PI;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI;
      const r = R + amp * Math.sin(lobes * t + phase);
      const x = cx + r * Math.cos(t), y = cy + r * Math.sin(t);
      d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  return d;
}

/** A band of interlaced waves, used along the top and bottom edges. */
function waveBand(x0: number, x1: number, y: number, amp: number, period: number, lines: number): string {
  let d = "";
  for (let j = 0; j < lines; j++) {
    const ph = (j / lines) * Math.PI * 2;
    for (let x = x0, first = true; x <= x1; x += 2, first = false) {
      const yy = y + amp * Math.sin((x / period) * 2 * Math.PI + ph);
      d += `${first ? "M" : "L"}${x.toFixed(1)} ${yy.toFixed(1)}`;
    }
  }
  return d;
}

/* ── Styles ─────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  page: { backgroundColor: "#FFFFFF", fontFamily: "PoppinsCert", color: INK },
  bg: { position: "absolute", left: 0, top: 0, width: W, height: H },
  content: { position: "absolute", left: 0, right: 0, top: 50, alignItems: "center" },

  brandRow: { flexDirection: "row", alignItems: "center" },
  logoWrap: { position: "relative", width: 30, height: 32, marginRight: 9 },
  logo: { width: 30, height: 32, objectFit: "contain" },
  tm: { position: "absolute", left: 29.3, top: -4.4, fontSize: 4, fontWeight: 600, color: NAVY },
  wordmark: { fontSize: 15, fontWeight: 600, color: NAVY, letterSpacing: -0.2 },
  wordmarkSub: { fontSize: 4.9, fontWeight: 500, color: NAVY, letterSpacing: 1.6, marginTop: 1 },

  title: { fontFamily: "Playfair", fontWeight: 700, fontSize: 50, color: NAVY, letterSpacing: 9, marginTop: 30 },
  subRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  subRule: { width: 46, height: 1, backgroundColor: ORANGE },
  subtitle: { fontSize: 12.5, fontWeight: 500, color: ORANGE, letterSpacing: 6, marginHorizontal: 12 },

  presented: { fontSize: 8.5, fontWeight: 500, color: MUTED, letterSpacing: 3.2, marginTop: 24 },
  name: { fontFamily: "Playfair", fontWeight: 500, fontStyle: "italic", color: NAVY, marginTop: 4 },
  nameRuleRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  nameRule: { width: 150, height: 0.7, backgroundColor: NAVY },
  diamond: { width: 6, height: 6, backgroundColor: ORANGE, transform: "rotate(45deg)", marginHorizontal: 7 },

  body: { width: 560, textAlign: "center", fontSize: 11, lineHeight: 1.6, color: INK, marginTop: 18 },
  em: { fontWeight: 600, color: NAVY },

  footer: { position: "absolute", left: 96, right: 96, top: 428, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  signCol: { width: 190, alignItems: "center" },
  signImg: { width: 120, height: 40, objectFit: "contain", marginBottom: -6 },
  signRule: { width: 170, height: 0.7, backgroundColor: NAVY },
  signName: { fontSize: 10, fontWeight: 600, color: NAVY, marginTop: 5 },
  signRole: { fontSize: 7.5, color: MUTED, marginTop: 1 },
  // A white disc behind the stamp so the security pattern doesn't show
  // through its transparent parts — the ink reads as cleanly as on invoices.
  stampWrap: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: -16 },
  stamp: { width: 116, height: 116, transform: "rotate(-9deg)" },

  verifyCol: { width: 190, flexDirection: "row", alignItems: "center" },
  verifyText: { marginLeft: 9, flex: 1 },
  vLabel: { fontSize: 6.3, fontWeight: 500, color: MUTED, letterSpacing: 1.2 },
  vValue: { fontSize: 8.6, fontWeight: 600, color: NAVY, marginTop: 1, marginBottom: 4 },
  vUrl: { fontSize: 6.8, color: ORANGE, fontWeight: 500 },

  markWrap: { position: "absolute", left: 0, top: 0, width: W, height: H, alignItems: "center", justifyContent: "center" },
  markText: { fontFamily: "Playfair", fontWeight: 700, fontSize: 120, letterSpacing: 14, transform: "rotate(-24deg)" },
  banner: { position: "absolute", left: 0, right: 0, top: 30, alignItems: "center" },
  bannerText: { fontSize: 7.5, fontWeight: 600, letterSpacing: 2, color: "#FFFFFF", paddingVertical: 3, paddingHorizontal: 12, borderRadius: 3 },
});

/* ── Document ───────────────────────────────────────────────────────────── */

export function CertificateDocument({ c }: { c: CertificatePayload }) {
  registerCertificateFonts();
  const kind = KIND[c.type] ?? KIND.training;
  const dur = duration(c.periodStart, c.periodEnd);

  // corner geometry (slope shared by the navy block and the orange stripe)
  const cw = 196, ch = 128, k = ch / cw;
  const tl = { navy: `0,0 ${cw},0 0,${ch}`, stripe: `${cw + 10},0 ${cw + 19},0 0,${(cw + 19) * k} 0,${(cw + 10) * k}` };
  const flip = (pts: string) => pts.split(" ").map((p) => { const [x, y] = p.split(",").map(Number); return `${(W - x).toFixed(2)},${(H - y).toFixed(2)}`; }).join(" ");

  return (
    <Document title={`${c.certNo} — ${c.name}`} author="UnicomTeam" subject={`Certificate ${kind.subtitle.toLowerCase()}`}>
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* background art */}
        <View style={s.bg} fixed>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Rect x={0} y={0} width={W} height={H} fill="#FFFFFF" />
          {/* security rosette + wave bands, very faint */}
          <Path d={rosette(W / 2, H / 2 + 8, 150, 26, 18, 14)} stroke={NAVY} strokeWidth={0.35} strokeOpacity={0.07} fill="none" />
          <Path d={rosette(W / 2, H / 2 + 8, 95, 14, 12, 10)} stroke={ORANGE} strokeWidth={0.35} strokeOpacity={0.08} fill="none" />
          <Path d={waveBand(40, W - 40, 30, 3.2, 26, 5)} stroke={NAVY} strokeWidth={0.3} strokeOpacity={0.18} fill="none" />
          <Path d={waveBand(40, W - 40, H - 30, 3.2, 26, 5)} stroke={NAVY} strokeWidth={0.3} strokeOpacity={0.18} fill="none" />
          {/* double frame */}
          <Rect x={18} y={18} width={W - 36} height={H - 36} stroke={NAVY} strokeWidth={1.4} fill="none" />
          <Rect x={24} y={24} width={W - 48} height={H - 48} stroke={ORANGE} strokeWidth={0.5} fill="none" />
          {/* corners */}
          <Polygon points={tl.navy} fill={NAVY} />
          <Polygon points={`${cw - 34},0 ${cw},0 0,${ch} 0,${ch - 34 * k}`} fill={NAVY_SOFT} />
          <Polygon points={tl.stripe} fill={ORANGE} />
          <Polygon points={flip(tl.navy)} fill={NAVY} />
          <Polygon points={flip(`${cw - 34},0 ${cw},0 0,${ch} 0,${ch - 34 * k}`)} fill={NAVY_SOFT} />
          <Polygon points={flip(tl.stripe)} fill={ORANGE} />
          {/* small accents in the free corners */}
          <Line x1={W - 70} y1={40} x2={W - 40} y2={40} stroke={ORANGE} strokeWidth={1.4} />
          <Line x1={W - 40} y1={40} x2={W - 40} y2={70} stroke={ORANGE} strokeWidth={1.4} />
          <Line x1={40} y1={H - 40} x2={70} y2={H - 40} stroke={ORANGE} strokeWidth={1.4} />
          <Line x1={40} y1={H - 70} x2={40} y2={H - 40} stroke={ORANGE} strokeWidth={1.4} />
        </Svg>
        </View>

        <View style={s.content}>
          <View style={s.brandRow}>
            {c.logo && (
              <View style={s.logoWrap}>
                <Image src={c.logo} style={s.logo} />
                <Text style={s.tm}>TM</Text>
              </View>
            )}
            <View>
              <Text style={s.wordmark}>
                Unicom<Text style={{ color: ORANGE }}>Team</Text>
              </Text>
              <Text style={s.wordmarkSub}>SOFTWARE DEVELOPMENT COMPANY</Text>
            </View>
          </View>

          <Text style={s.title}>CERTIFICATE</Text>
          <View style={s.subRow}>
            <View style={s.subRule} />
            <Text style={s.subtitle}>{kind.subtitle}</Text>
            <View style={s.subRule} />
          </View>

          <Text style={s.presented}>THIS IS PROUDLY PRESENTED TO</Text>
          <Text style={[s.name, { fontSize: nameSize(c.name) }]}>{c.name}</Text>
          <View style={s.nameRuleRow}>
            <View style={s.nameRule} />
            <View style={s.diamond} />
            <View style={s.nameRule} />
          </View>

          <Text style={s.body}>{kind.verb(c, dur)}</Text>
        </View>

        <View style={s.footer}>
          <View style={s.signCol}>
            {c.signature ? <Image src={c.signature} style={s.signImg} /> : <View style={{ height: 34 }} />}
            <View style={s.signRule} />
            <Text style={s.signName}>{c.supervisor}</Text>
            <Text style={s.signRole}>{c.supervisorTitle}</Text>
          </View>

          {c.stamp ? (
            <View style={s.stampWrap}>
              <Image src={c.stamp} style={s.stamp} />
            </View>
          ) : (
            <View style={{ width: 120 }} />
          )}

          <View style={s.verifyCol}>
            <PdfQrCode value={c.verifyLink} size={58} />
            <View style={s.verifyText}>
              <Text style={s.vLabel}>CERTIFICATE NO.</Text>
              <Text style={s.vValue}>{c.certNo}</Text>
              <Text style={s.vLabel}>DATE OF ISSUE</Text>
              <Text style={s.vValue}>{fmt(c.dateIssued)}</Text>
              <Text style={s.vUrl}>Scan or visit {c.verifyUrl}</Text>
            </View>
          </View>
        </View>

        {c.mode === "preview" && (
          <>
            <View style={s.markWrap}>
              <Text style={[s.markText, { color: NAVY, opacity: 0.06 }]}>PREVIEW</Text>
            </View>
            <View style={s.banner}>
              <Text style={[s.bannerText, { backgroundColor: ORANGE }]}>PREVIEW · NOT ISSUED · NOT VALID</Text>
            </View>
          </>
        )}
        {c.mode === "revoked" && (
          <>
            <View style={s.markWrap}>
              <Text style={[s.markText, { color: "#C0262D", opacity: 0.12 }]}>REVOKED</Text>
            </View>
            <View style={s.banner}>
              <Text style={[s.bannerText, { backgroundColor: "#C0262D" }]}>THIS CERTIFICATE HAS BEEN REVOKED</Text>
            </View>
          </>
        )}
      </Page>
    </Document>
  );
}

export default CertificateDocument;
