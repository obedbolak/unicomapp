// prisma/seed-zonecinq.ts
//
// Seeds the Groupe ZONECINQ® quote — UCT-2026-GZ5-001, the signed
// "Quote & Fund Distribution" for the website and mobile application — as a
// real row so it can be reprinted, tracked against payments, and used as the
// worked example of a phased document.
//
//   npm run seed:zonecinq
//
// Idempotent: re-running rebuilds the document's phases, lines and schedule
// from this file rather than duplicating them. Anything you edited in the
// admin UI is therefore overwritten, which is the point — this file is the
// source of truth for this one document.

// dotenv first: ESM evaluates imports in order, so anything below that reads
// process.env at module scope must come after this line.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createAdapter, describeTransport } from "../lib/db-adapter";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.error("Set DATABASE_URL in .env first.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: createAdapter(connectionString) });

const NUMBER = "UCT-2026-GZ5-001";
const ISSUED = new Date("2026-09-03T00:00:00.000Z");
/** 30 days' validity, as clause 7 states. */
const VALID_UNTIL = new Date("2026-10-03T00:00:00.000Z");

type Line = [item: string, description: string, amount: number];

const PHASES: {
  title: string;
  subtitle: string;
  items: Line[];
}[] = [
  {
    title: "PHASE 1 — WEBSITE (NEXT.JS & REACT)",
    subtitle: "Estimated delivery: 4–6 weeks from start date",
    items: [
      ["UI/UX Design", "Wireframes, visual identity, design system", 35_000],
      [
        "Front-End Development",
        "Next.js & React integration, responsive design, modern interactive animations (latest frontend tech)",
        40_000,
      ],
      [
        "Back-End Development",
        "Server, database, REST API, authentication",
        45_000,
      ],
      [
        "Member Area / Private Space",
        "Subscription system, restricted access, member management",
        30_000,
      ],
      [
        "Hosting & Domain (1 year)",
        "Cloud server, domain name, SSL certificate",
        15_000,
      ],
      ["Testing & Deployment", "QA, basic SEO optimisation, go-live", 10_000],
      [
        "UNICOMTEAM Fees (Phase 1)",
        "Project management, coordination, client follow-up",
        75_000,
      ],
    ],
  },
  {
    title: "PHASE 2 — MOBILE APPLICATION (ANDROID / PLAY STORE)",
    subtitle: "Estimated delivery: 6–10 weeks after website sign-off",
    items: [
      [
        "Mobile UI Design",
        "Android wireframes, UX flows, component library",
        20_000,
      ],
      [
        "Android Development",
        "React Native build, screens, navigation, offline support",
        60_000,
      ],
      [
        "API & Back-End Integration",
        "Website API connection, push notifications, sync",
        25_000,
      ],
      [
        "Mobile Member Area",
        "Login, subscriptions, Private access, messaging",
        20_000,
      ],
      [
        "Play Store Publication",
        "Developer account, submission, ASO, screenshots",
        10_000,
      ],
      [
        "Testing & Debugging",
        "Device testing, bug fixes, final release build",
        15_000,
      ],
      [
        "UNICOMTEAM Fees (Phase 2)",
        "Project management, coordination, client follow-up",
        75_000,
      ],
    ],
  },
  {
    title: "PHASE 3 — IOS DEPLOYMENT (APP STORE)",
    subtitle: "Fully integrated core project phase",
    items: [
      [
        "iOS Porting",
        "UI adaptation, Xcode compilation, Apple developer certificates",
        65_000,
      ],
      [
        "App Store Publication",
        "Apple Developer account management, store submission, review, official launch",
        20_000,
      ],
      [
        "iOS Testing",
        "TestFlight distribution, device-specific QA, iOS bug resolution",
        15_000,
      ],
    ],
  },
];

/** Lines that belong to no phase: they print in the financial summary only. */
const EXTRAS: Line[] = [
  [
    "Technical Reserve & Contingency",
    "Buffer held against scope risk across all three phases",
    125_000,
  ],
  [
    "Client App Store & Internet Bonus",
    "Performance success bonus on completion of both mobile stores",
    50_000,
  ],
];

const INSTALLMENTS: {
  percent: number;
  trigger: string;
  amount: number;
}[] = [
  {
    percent: 20,
    trigger:
      "Contract signed — Phase 1 kickoff (Next.js website design & setup)",
    amount: 150_000,
  },
  {
    percent: 16,
    trigger: "Wireframes & modern front-end integration delivered and approved",
    amount: 120_000,
  },
  {
    percent: 20,
    trigger: "Full website live on production server and client approved",
    amount: 150_000,
  },
  {
    percent: 24,
    trigger: "Android application officially published on Google Play Store",
    amount: 180_000,
  },
  {
    percent: 13.3,
    trigger:
      "iOS Application compilation, TestFlight QA, and official App Store launch",
    amount: 100_000,
  },
  {
    percent: 6.7,
    trigger:
      "Project success & performance bonus upon completion of both mobile stores",
    amount: 50_000,
  },
];

const TERMS = [
  "UNICOMTEAM fees (150,000 FCFA) are included and split equally between Phase 1 and Phase 2 core deliverables.",
  "iOS deployment (Phase 3) is fully integrated into this core development contract, bringing the total budget to 750,000 FCFA (including the 50,000 FCFA client bonus).",
  "Each instalment payment triggers the corresponding phase of development. Work will not begin until the respective payment is confirmed.",
  "Any additional features not listed in this quote will be subject to a written amendment and separate billing.",
  "Estimated timelines may vary depending on client availability for reviews, feedback, and formal approvals.",
  "Full source code and intellectual property rights are transferred to the client upon receipt of the final payment including bonus.",
  "This quote is valid for 30 days from the issue date.",
];

async function main() {
  console.log(`→ ${describeTransport(connectionString!)}`);

  const client = await prisma.client.upsert({
    where: { slug: "groupe-zonecinq" },
    update: {},
    create: {
      name: "Groupe ZONECINQ®",
      slug: "groupe-zonecinq",
      status: "ACTIVE",
      country: "Cameroon",
    },
  });

  const project = await prisma.project.upsert({
    where: { slug: "groupe-zonecinq-website-mobile-app" },
    update: { budget: 750_000, clientId: client.id },
    create: {
      title: "Groupe ZONECINQ® — Website & Mobile Application",
      slug: "groupe-zonecinq-website-mobile-app",
      category: "MOBILE_WEB_APP",
      description:
        "Next.js & React web application, native Android application, and Apple App Store iOS deployment for Groupe ZONECINQ®.",
      tags: ["Next.js", "React", "React Native", "iOS", "Android"],
      status: "IN_PROGRESS",
      published: false,
      budget: 750_000,
      currency: "XAF",
      clientId: client.id,
      startDate: ISSUED,
    },
  });

  // The document itself. Header money is written from the known totals and
  // then re-derived from the lines at the end, so a typo in this file surfaces
  // as a mismatch rather than as a wrong quote.
  const invoice = await prisma.invoice.upsert({
    where: { number: NUMBER },
    update: {},
    create: { number: NUMBER, currency: "XAF" },
  });

  // A fixed code rather than a random one, so re-seeding does not invalidate a
  // copy the client is already holding. Every other document gets a random one
  // the first time it is printed.
  if (!invoice.verifyCode) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { verifyCode: "GZ5QUOTE" },
    });
  }

  // Rebuild the body from scratch. Deleting items before sections matters:
  // items point at sections with onDelete SetNull, so removing sections first
  // would orphan the lines instead of clearing them.
  await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
  await prisma.invoiceSection.deleteMany({ where: { invoiceId: invoice.id } });
  await prisma.invoiceInstallment.deleteMany({
    where: { invoiceId: invoice.id },
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      docType: "QUOTE",
      status: "SENT",
      clientId: client.id,
      projectId: project.id,
      issueDate: ISSUED,
      validUntil: VALID_UNTIL,
      currency: "XAF",
      tax: 0,

      title: "QUOTE & FUND DISTRIBUTION",
      subject: "Groupe ZONECINQ® — Website & Mobile Application",
      scope:
        "Modern Next.js & React Web Application, Native Android Application, and Apple App Store iOS deployment, including a performance success bonus.",
      budgetLabel: "750,000 FCFA (including iOS & Bonus)",
      terms: TERMS,

      clientSignerName: "Groupe ZONECINQ",
      issuerSignerName: "Obed Bolak Fuchu",
      issuerSignerRole: "Authorized Signature",
    },
  });

  for (const [phaseIndex, phase] of PHASES.entries()) {
    const section = await prisma.invoiceSection.create({
      data: {
        invoiceId: invoice.id,
        title: phase.title,
        subtitle: phase.subtitle,
        sortOrder: phaseIndex,
      },
    });

    await prisma.invoiceItem.createMany({
      data: phase.items.map(([label, description, amount], i) => ({
        invoiceId: invoice.id,
        sectionId: section.id,
        label,
        description,
        quantity: 1,
        unitPrice: amount,
        amount,
        sortOrder: i,
      })),
    });
  }

  await prisma.invoiceItem.createMany({
    data: EXTRAS.map(([label, description, amount], i) => ({
      invoiceId: invoice.id,
      sectionId: null,
      label,
      description,
      quantity: 1,
      unitPrice: amount,
      amount,
      sortOrder: i,
    })),
  });

  await prisma.invoiceInstallment.createMany({
    data: INSTALLMENTS.map((x, i) => ({
      invoiceId: invoice.id,
      label: `${ordinal(i + 1)} — ${x.percent}%`,
      percent: x.percent,
      trigger: x.trigger,
      amount: x.amount,
      status: "PENDING" as const,
      sortOrder: i,
    })),
  });

  // Same rule the admin actions follow: the header is the sum of the lines,
  // never a number somebody typed.
  const lines = await prisma.invoiceItem.findMany({
    where: { invoiceId: invoice.id },
    select: { amount: true },
  });
  const subtotal = lines.reduce((sum, l) => sum + Number(l.amount), 0);

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { subtotal, total: subtotal },
  });

  const scheduled = INSTALLMENTS.reduce((sum, x) => sum + x.amount, 0);

  console.log(`✓ ${NUMBER} — ${client.name}`);
  console.log(`  lines      ${lines.length}`);
  console.log(`  total      ${subtotal.toLocaleString("en-US")} FCFA`);
  console.log(`  scheduled  ${scheduled.toLocaleString("en-US")} FCFA`);

  if (subtotal !== 750_000) {
    console.warn(`  ! expected 750,000 FCFA — check the amounts above`);
  }
  if (scheduled !== subtotal) {
    console.warn(`  ! payment schedule does not add up to the total`);
  }

  console.log(`\n  /admin/invoices/${invoice.id}`);
  console.log(`  /api/invoices/${invoice.id}/pdf`);
  console.log(`  /verify/document?no=${NUMBER}&code=GZ5QUOTE`);
}

function ordinal(n: number) {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

main()
  .catch((err: unknown) => {
    const code = (err as { code?: string })?.code;

    if (code === "ETIMEDOUT" || code === "ECONNREFUSED" || code === "ENOTFOUND") {
      console.error(
        `\nCould not reach the database — ${describeTransport(connectionString!)} (${code}).\n` +
          `This is a connectivity problem, not a data one — nothing was written.\n\n` +
          `  · Run \`npm run db:ping\` — it tests both transports separately.\n` +
          `  · A Neon URL should be going over 443. If this says 5432, the\n` +
          `    hostname is not a .neon.tech one and the adapter fell back.\n` +
          `  · If the app itself cannot reach the database either, fix that\n` +
          `    first — this script is only the messenger.\n`,
      );
    } else {
      console.error(err);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
