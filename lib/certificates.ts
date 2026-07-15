export type CertificateType = "internship" | "training" | "crash-course";
export type CertificateStatus = "valid" | "revoked";

export interface Certificate {
  certNo: string;
  name: string;
  type: CertificateType;
  program: string; // e.g. "Full Stack Development Internship"
  department: string;
  periodStart: string; // ISO date, e.g. "2026-04-12"
  periodEnd: string;
  dateIssued: string;
  status: CertificateStatus;
  supervisor: string;
  supervisorTitle: string;
}

// ── TEMP: static data. Swap this for a DB/API call later without
// changing anything in the pages that consume `findCertificate`. ──
export const certificates: Certificate[] = [
  {
    certNo: "UCT-INT-2026-0015",
    name: "Mukete Sharon Enanga",
    type: "internship",
    program: "Full Stack Development Internship",
    department: "Full Stack Development",
    periodStart: "2026-04-12",
    periodEnd: "2026-06-12",
    dateIssued: "2026-06-15",
    status: "valid",
    supervisor: "Obed Bolak F.",
    supervisorTitle: "CEO & Internship Supervisor",
  },
];

export function findCertificate(certNo: string): Certificate | null {
  const normalized = certNo.trim().toUpperCase();
  return (
    certificates.find((c) => c.certNo.toUpperCase() === normalized) ?? null
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
