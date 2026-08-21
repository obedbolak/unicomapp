// prisma/seed.ts
// Loads the content that currently lives hardcoded in the app into Postgres.
// Safe to re-run: everything is an upsert keyed on a stable slug / unique field.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

/* ── Team (from app/about/page.tsx) ───────────────────────────────────────── */

const team = [
  {
    name: "Obed Bolak",
    email: "obed@unicomteam.com",
    title: "CEO & Full-Stack Developer",
    department: "ENGINEERING",
    image: "/team/ceo.png",
    role: ["ADMIN", "STAFF"],
  },
  {
    name: "Alvine Malyka",
    email: "alvine@unicomteam.com",
    title: "Core Systems Engineer",
    department: "ENGINEERING",
    image: "/team/bbty.png",
    role: ["STAFF"],
  },
  {
    name: "Fomusoh Stephanie",
    email: "stephanie@unicomteam.com",
    title: "Frontend & UI/UX Designer",
    department: "DESIGN",
    image: "/team/steph.png",
    role: ["STAFF"],
  },
  {
    name: "Lilian Martin",
    email: "lilian@unicomteam.com",
    title: "Frontend & UI Specialist",
    department: "DESIGN",
    image: "/team/lili.png",
    role: ["STAFF"],
  },
  {
    name: "Rosine Mbashi",
    email: "rosine@unicomteam.com",
    title: "Marketing & Business Strategist",
    department: "GROWTH",
    image: "/team/rosin.png",
    role: ["STAFF"],
  },
] as const;

/* ── Services (from app/services/data.ts) ─────────────────────────────────── */

const services = [
  {
    slug: "software-solutions",
    icon: "Code",
    title: "Software Solutions",
    tag: "Engineering",
    desc: "Tailored software architectures engineered for scale, security, and commercial performance. From API design to full-stack deployment.",
    details: [
      "Custom backend and frontend systems built to your exact business requirements.",
      "API development, microservices, cloud integration, and enterprise-grade reliability.",
      "Modern tooling for observability, CI/CD, and long-term maintainability.",
    ],
  },
  {
    slug: "digital-marketing",
    icon: "Globe",
    title: "Digital Marketing",
    tag: "Growth",
    desc: "Data-driven campaigns that convert. SEO, SEM, and growth hacking for modern businesses aiming to dominate their market.",
    details: [
      "Audience research, campaign strategy, and measurement frameworks.",
      "Search engine optimization, paid advertising, and conversion optimization.",
      "Performance analytics and growth loops that keep your marketing budget efficient.",
    ],
  },
  {
    slug: "mobile-web-development",
    icon: "Smartphone",
    title: "Mobile & Web Development",
    tag: "Development",
    desc: "Progressive web apps and native mobile experiences built with React, Next.js, and modern stacks that scale.",
    details: [
      "Cross-platform web apps, responsive UI, and performant mobile-first experiences.",
      "Native mobile strategy, PWA optimization, and fast loading interactions.",
      "Integration with backend services, payment systems, and secure authentication.",
    ],
  },
  {
    slug: "social-media-management",
    icon: "Share2",
    title: "Social Media Management",
    tag: "Social",
    desc: "Content strategy, community building, and analytics across Instagram, TikTok, Facebook, and beyond.",
    details: [
      "Publishing calendars, engagement strategies, and creative direction.",
      "Audience growth, influencer partnerships, and reputation management.",
      "Performance reporting that links social activity to business outcomes.",
    ],
  },
  {
    slug: "business-strategy",
    icon: "TrendingUp",
    title: "Business Strategy",
    tag: "Strategy",
    desc: "Operational consulting and digital transformation roadmaps for enterprise and startup growth.",
    details: [
      "Market positioning, product strategy, and digital transformation planning.",
      "Revenue models, operational process optimization, and scalable growth plans.",
      "Alignment of technology and business goals for measurable impact.",
    ],
  },
];

/* ── Projects (from app/projects/page.tsx) ────────────────────────────────── */

const projects = [
  {
    slug: "vihipex-university-portal",
    title: "VIHIPEX University Portal",
    category: "SOFTWARE_DEVELOPMENT",
    description:
      "An enterprise-grade university campus management infrastructure featuring secure student information systems, real-time grading metrics, and high-security administrative controls.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Framer Motion"],
    liveUrl: "https://vihipex.com",
    client: "VIHIPEX",
  },
  {
    slug: "ecommerce-fluid-architecture",
    title: "E-Commerce Fluid Architecture",
    category: "MOBILE_WEB_APP",
    description:
      "A conversion-optimized custom store platform featuring serverless instant checkouts, high-fidelity responsive filters, and sub-100ms render speeds.",
    tags: ["React Native", "TailwindCSS", "Node.js", "GraphQL"],
    liveUrl: null,
    client: null,
  },
  {
    slug: "gracy-global-ecosystem",
    title: "Gracy Global Ecosystem",
    category: "MOBILE_WEB_APP",
    description:
      "A multi-faceted community platform bridging telehealth counseling workflows, remote job acquisition pipelines, and digital skill education databases.",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "Real-time Chat"],
    liveUrl: "https://gracyglobal.com",
    client: "Gracy Global",
  },
  {
    slug: "legacy-language-center",
    title: "Legacy Language Center",
    category: "MOBILE_WEB_APP",
    description:
      "A specialized exam preparation platform providing expert coaching for IELTS, TOEFL, and French proficiency exams with personalized progress tracking.",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "UI/UX Design"],
    liveUrl: "https://legacylanguagecenter.com",
    client: "Legacy Language Center",
  },
  {
    slug: "mr-a-tutoring-agency",
    title: "Mr. A Tutoring Agency",
    category: "MOBILE_WEB_APP",
    description:
      "A custom K-12 STEM educational engine supporting interactive booking workflows, teacher profiles, and highly targeted lesson scheduling.",
    tags: ["React", "Node.js", "TailwindCSS", "Web Hosting"],
    liveUrl: "https://mratutoring.com",
    client: "Mr. A Tutoring Agency",
  },
  {
    slug: "earth-design-engineering",
    title: "Earth Design Engineering Ltd",
    category: "SOFTWARE_DEVELOPMENT",
    description:
      "An enterprise-grade engineering portal optimized for rapid portfolio loads, structural blueprints, and civil project telemetry.",
    tags: ["Next.js", "TailwindCSS", "Framer Motion", "SEO Optimization"],
    liveUrl: "https://earthdesignengineeringltd.com",
    client: "Earth Design Engineering Ltd",
  },
  {
    slug: "chicad-es-architecture",
    title: "Chicad-ES Architecture",
    category: "SOFTWARE_DEVELOPMENT",
    description:
      "A high-fidelity digital architecture portfolio showcasing minimalist spatial components, spatial design rendering layouts, and interactive case structures.",
    tags: ["React", "TypeScript", "TailwindCSS", "Creative Coding"],
    liveUrl: "https://chicad-es.com",
    client: "Chicad-ES",
  },
  {
    slug: "kingslife-enterprises",
    title: "Kingslife Enterprises",
    category: "DIGITAL_MARKETING",
    description:
      "A premium strategic brand ecosystem designed for enterprise growth hacking, cross-network distribution layers, and high-yield asset delivery.",
    tags: ["Automation", "Data Analytics", "Growth Hacking", "Webflow"],
    liveUrl: "https://kingslifeenterprises.com",
    client: "Kingslife Enterprises",
  },
  {
    slug: "omnichannel-strategic-engine",
    title: "OmniChannel Strategic Engine",
    category: "DIGITAL_MARKETING",
    description:
      "An automated multi-platform content delivery system engineered to manage high-yield acquisition layers across modern networks.",
    tags: ["Automation", "Data Analytics", "Growth Hacking"],
    liveUrl: null,
    client: null,
  },
];

/* ── Training programs (from app/trainings/page.tsx) ──────────────────────── */

const trainings = [
  {
    slug: "frontend-development",
    title: "Frontend Development",
    subtitle: "HTML · CSS · JavaScript · React",
    description:
      "Master the fundamentals of the web. Go from zero to building fully responsive, interactive UIs with React and modern CSS.",
    level: "BEGINNER",
    durationLabel: "3, 6 Months",
    durationMonths: [3, 6],
    sessionsLabel: "24 Live Sessions",
    mentorship: "1-on-1 Mentorship",
    outcome: "Portfolio + Certificate",
    topics: [] as string[],
    icon: "🖥️",
    accent: "rgba(255,140,0,0.12)",
    accentBorder: "rgba(255,140,0,0.25)",
    badgeText: "#22c55e",
    featured: false,
  },
  {
    slug: "backend-development",
    title: "Backend Development",
    subtitle: "Node.js · Express · PostgreSQL · REST APIs",
    description:
      "Build powerful server-side applications. Learn databases, authentication, REST API design, and deploy production-ready backends with confidence.",
    level: "INTERMEDIATE",
    durationLabel: "3, 6 Months",
    durationMonths: [3, 6],
    sessionsLabel: "48 Live Sessions",
    mentorship: "Weekly Reviews",
    outcome: "Portfolio + Certificate",
    topics: ["Auth & JWT", "SQL & ORMs", "Caching & Queues", "CI/CD Deploys"],
    icon: "⚙️",
    accent: "rgba(59,130,246,0.08)",
    accentBorder: "rgba(59,130,246,0.2)",
    badgeText: "#3b82f6",
    featured: false,
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    subtitle: "Figma · Design Systems · Prototyping",
    description:
      "Learn to design products people love. From wireframes to high-fidelity prototypes, build a designer's eye and a real-world portfolio.",
    level: "INTERMEDIATE",
    durationLabel: "3, 6 Months",
    durationMonths: [3, 6],
    sessionsLabel: "20 Live Sessions",
    mentorship: "Portfolio Reviews",
    outcome: "Figma Portfolio + Certificate",
    topics: [],
    icon: "🎨",
    accent: "rgba(168,85,247,0.08)",
    accentBorder: "rgba(168,85,247,0.2)",
    badgeText: "#a855f7",
    featured: false,
  },
  {
    slug: "full-stack-engineering",
    title: "Full-Stack Engineering",
    subtitle: "React · Node · Databases · DevOps",
    description:
      "The complete track. Build, deploy, and scale full-stack web applications end-to-end with industry-grade tooling and battle-tested engineering practices.",
    level: "ADVANCED",
    durationLabel: "3, 6 Months, 1Y",
    durationMonths: [3, 6, 12],
    sessionsLabel: "96 Live Sessions",
    mentorship: "Dedicated Mentor",
    outcome: "Full Portfolio + Certificate",
    topics: [
      "Frontend with React",
      "REST & GraphQL APIs",
      "Databases & Auth",
      "Docker & DevOps",
      "Testing & CI/CD",
      "System Design",
    ],
    icon: "🚀",
    accent: "rgba(255,140,0,0.12)",
    accentBorder: "rgba(255,140,0,0.25)",
    badgeText: "#ef4444",
    featured: true,
  },
  {
    slug: "digital-marketing-training",
    title: "Digital Marketing",
    subtitle: "SEO · Ads · Social Media · Analytics",
    description:
      "Drive traffic, generate leads, and grow brands online. Master SEO, paid ads, content strategy, and data-driven marketing.",
    level: "BEGINNER",
    durationLabel: "3, 6 Months",
    durationMonths: [3, 6],
    sessionsLabel: "18 Live Sessions",
    mentorship: "Strategy Reviews",
    outcome: "Campaign Portfolio + Certificate",
    topics: [],
    icon: "📈",
    accent: "rgba(34,197,94,0.08)",
    accentBorder: "rgba(34,197,94,0.2)",
    badgeText: "#22c55e",
    featured: false,
  },
  {
    slug: "mobile-development",
    title: "Mobile Development",
    subtitle: "React Native · Expo · App Store Deployment",
    description:
      "Build cross-platform mobile apps for iOS and Android. Learn React Native, state management, and ship real apps to the stores.",
    level: "INTERMEDIATE",
    durationLabel: "3, 6 Months, 1Y",
    durationMonths: [3, 6, 12],
    sessionsLabel: "40 Live Sessions",
    mentorship: "Weekly Reviews",
    outcome: "App Portfolio + Certificate",
    topics: ["RN Fundamentals", "Navigation", "Native APIs", "Store Deploy"],
    icon: "📱",
    accent: "rgba(251,191,36,0.08)",
    accentBorder: "rgba(251,191,36,0.2)",
    badgeText: "#fbbf24",
    featured: false,
  },
  {
    slug: "desktop-app-development",
    title: "Desktop App Development",
    subtitle: "Electron · Tauri · Cross-Platform Desktop",
    description:
      "Build native-feeling desktop applications for Windows, macOS, and Linux. Learn Electron and Tauri, packaging, auto-updates, and shipping installable apps.",
    level: "ADVANCED",
    durationLabel: "3, 6 Months, 1Y",
    durationMonths: [3, 6, 12],
    sessionsLabel: "36 Live Sessions",
    mentorship: "Weekly Reviews",
    outcome: "Desktop App Portfolio + Certificate",
    topics: [
      "Electron & Tauri",
      "Native Menus & APIs",
      "Packaging & Installers",
      "Auto-Updates",
    ],
    icon: "💻",
    accent: "rgba(14,165,233,0.08)",
    accentBorder: "rgba(14,165,233,0.2)",
    badgeText: "#0ea5e9",
    featured: false,
  },
];

const crashCourses = [
  {
    slug: "graphics-design-crash-course",
    title: "Graphics Design (Crash Course)",
    subtitle: "Photoshop · Illustrator · Canva",
    description:
      "Design logos, flyers, social posts, and brand kits in weeks. Perfect for freelancers and side hustles.",
    durationLabel: "1,2,4 Weeks",
    sessionsLabel: "8 Live Sessions",
    icon: "🎨",
    accent: "rgba(236,72,153,0.12)",
    accentBorder: "rgba(236,72,153,0.3)",
    badgeText: "#ec4899",
  },
  {
    slug: "microsoft-excel-crash-course",
    title: "Microsoft Excel (Crash Course)",
    subtitle: "Formulas · Pivot Tables · Dashboards",
    description:
      "Go from beginner to spreadsheet pro. Master formulas, charts, pivot tables, and automation that employers love.",
    durationLabel: "1,2,3 Weeks",
    sessionsLabel: "6 Live Sessions",
    icon: "📊",
    accent: "rgba(34,197,94,0.12)",
    accentBorder: "rgba(34,197,94,0.3)",
    badgeText: "#22c55e",
  },
  {
    slug: "microsoft-office-crash-course",
    title: "Microsoft Office (Crash Course)",
    subtitle: "Word · Excel · PowerPoint · Outlook",
    description:
      "Become office-ready fast. Master the everyday tools every workplace expects you to know inside out.",
    durationLabel: "1,2,4 Weeks",
    sessionsLabel: "8 Live Sessions",
    icon: "🗂️",
    accent: "rgba(59,130,246,0.12)",
    accentBorder: "rgba(59,130,246,0.3)",
    badgeText: "#3b82f6",
  },
];

const CRASH_PAYMENT_NOTE =
  "Send registration Fees to\nMOMO: 681529488\nName: Obed Bolak fuchu\n• Send Confirmation via WhatsApp";

/* ── Internship roles (from app/trainings/internships/page.tsx) ───────────── */

const internships = [
  {
    slug: "frontend-engineering-intern",
    title: "Frontend Engineering Intern",
    stack: "React · TypeScript · Tailwind",
    description:
      "Work alongside our engineers building real client-facing UIs. Ship features to production with mentor guidance.",
    durationLabel: "3–6 Months",
    durationMonths: [3, 6],
    workMode: "HYBRID",
    slots: 3,
    paid: true,
    icon: "🖥️",
    accent: "rgba(255,140,0,0.12)",
    accentBorder: "rgba(255,140,0,0.25)",
  },
  {
    slug: "backend-engineering-intern",
    title: "Backend Engineering Intern",
    stack: "Node.js · PostgreSQL · APIs",
    description:
      "Build and maintain APIs, work with databases, and learn production deployment in a real engineering team.",
    durationLabel: "6 Months",
    durationMonths: [6],
    workMode: "REMOTE",
    slots: 2,
    paid: true,
    icon: "⚙️",
    accent: "rgba(59,130,246,0.08)",
    accentBorder: "rgba(59,130,246,0.2)",
  },
  {
    slug: "ui-ux-design-intern",
    title: "UI/UX Design Intern",
    stack: "Figma · Prototyping · Research",
    description:
      "Contribute to live product designs, run user research, and build a portfolio of shipped work.",
    durationLabel: "3 Months",
    durationMonths: [3],
    workMode: "REMOTE",
    slots: 2,
    paid: false,
    icon: "🎨",
    accent: "rgba(168,85,247,0.08)",
    accentBorder: "rgba(168,85,247,0.2)",
  },
  {
    slug: "digital-marketing-intern",
    title: "Digital Marketing Intern",
    stack: "SEO · Ads · Content · Analytics",
    description:
      "Run real campaigns, manage social channels, and learn data-driven marketing on live brands.",
    durationLabel: "3 Months",
    durationMonths: [3],
    workMode: "HYBRID",
    slots: 2,
    paid: false,
    icon: "📈",
    accent: "rgba(34,197,94,0.08)",
    accentBorder: "rgba(34,197,94,0.2)",
  },
  {
    slug: "mobile-development-intern",
    title: "Mobile Development Intern",
    stack: "React Native · Expo",
    description:
      "Help build and ship cross-platform mobile apps to the app stores under senior mentorship.",
    durationLabel: "6 Months",
    durationMonths: [6],
    workMode: "REMOTE",
    slots: 1,
    paid: true,
    icon: "📱",
    accent: "rgba(251,191,36,0.08)",
    accentBorder: "rgba(251,191,36,0.2)",
  },
  {
    slug: "desktop-app-dev-intern",
    title: "Desktop App Dev Intern",
    stack: "Electron · Tauri",
    description:
      "Build installable desktop tools for Windows, macOS, and Linux while learning packaging and auto-updates.",
    durationLabel: "5 Months",
    durationMonths: [5],
    workMode: "REMOTE",
    slots: 1,
    paid: true,
    icon: "💻",
    accent: "rgba(14,165,233,0.08)",
    accentBorder: "rgba(14,165,233,0.2)",
  },
];

/* ── Run ─────────────────────────────────────────────────────────────────── */

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seeding UnicomTeam database…\n");

  // ── Team ───────────────────────────────────────────────────────────────
  const defaultPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const hashed = await bcrypt.hash(defaultPassword, 12);

  for (const member of team) {
    await prisma.user.upsert({
      where: { email: member.email },
      update: {
        name: member.name,
        title: member.title,
        department: member.department as any,
        image: member.image,
        role: member.role as any,
      },
      create: {
        name: member.name,
        email: member.email,
        title: member.title,
        department: member.department as any,
        image: member.image,
        role: member.role as any,
        password: hashed,
      },
    });
  }
  console.log(`✅ ${team.length} team members`);

  await prisma.organization.upsert({
    where: { slug: "unicomteam" },
    update: { name: "unicomteam" },
    create: { slug: "unicomteam", name: "unicomteam" },
  });
  console.log("✅ unicomteam organization holder");

  // ── Services ───────────────────────────────────────────────────────────
  for (const [i, s] of services.entries()) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: { ...s, sortOrder: i },
      create: { ...s, sortOrder: i },
    });
  }
  console.log(`✅ ${services.length} services`);

  // ── Clients + projects ─────────────────────────────────────────────────
  const ceo = await prisma.user.findUnique({
    where: { email: "obed@unicomteam.com" },
    select: { id: true },
  });

  for (const [i, p] of projects.entries()) {
    let clientId: string | undefined;

    if (p.client) {
      const client = await prisma.client.upsert({
        where: { slug: slugify(p.client) },
        update: { name: p.client, website: p.liveUrl ?? undefined },
        create: {
          name: p.client,
          slug: slugify(p.client),
          website: p.liveUrl ?? undefined,
          status: "ACTIVE",
        },
      });
      clientId = client.id;
    }

    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        category: p.category as any,
        description: p.description,
        tags: p.tags,
        liveUrl: p.liveUrl ?? undefined,
        clientId,
        published: true,
        sortOrder: i,
      },
      create: {
        title: p.title,
        slug: p.slug,
        category: p.category as any,
        description: p.description,
        tags: p.tags,
        liveUrl: p.liveUrl ?? undefined,
        clientId,
        leadId: ceo?.id,
        status: p.liveUrl ? "DELIVERED" : "IN_PROGRESS",
        published: true,
        sortOrder: i,
      },
    });
  }
  console.log(`✅ ${projects.length} projects (+ clients)`);

  // ── Programs ───────────────────────────────────────────────────────────
  for (const [i, t] of trainings.entries()) {
    const data = {
      kind: "TRAINING" as const,
      title: t.title,
      subtitle: t.subtitle,
      description: t.description,
      level: t.level as any,
      durationLabel: t.durationLabel,
      durationMonths: t.durationMonths,
      sessionsLabel: t.sessionsLabel,
      mentorship: t.mentorship,
      outcome: t.outcome,
      topics: t.topics,
      priceFrom: 75000,
      currency: "XAF",
      icon: t.icon,
      accent: t.accent,
      accentBorder: t.accentBorder,
      badgeText: t.badgeText,
      featured: t.featured,
      sortOrder: i,
    };
    await prisma.program.upsert({
      where: { slug: t.slug },
      update: data,
      create: { slug: t.slug, ...data },
    });
  }

  for (const [i, c] of crashCourses.entries()) {
    const data = {
      kind: "CRASH_COURSE" as const,
      title: c.title,
      subtitle: c.subtitle,
      description: c.description,
      level: "CRASH_COURSE" as const,
      durationLabel: c.durationLabel,
      durationMonths: [] as number[],
      sessionsLabel: c.sessionsLabel,
      topics: [] as string[],
      priceFrom: 25000,
      registrationFee: 5000,
      currency: "XAF",
      paymentNote: CRASH_PAYMENT_NOTE,
      icon: c.icon,
      accent: c.accent,
      accentBorder: c.accentBorder,
      badgeText: c.badgeText,
      sortOrder: 100 + i,
    };
    await prisma.program.upsert({
      where: { slug: c.slug },
      update: data,
      create: { slug: c.slug, ...data },
    });
  }

  for (const [i, n] of internships.entries()) {
    const data = {
      kind: "INTERNSHIP" as const,
      title: n.title,
      subtitle: n.stack,
      description: n.description,
      durationLabel: n.durationLabel,
      durationMonths: n.durationMonths,
      topics: [] as string[],
      stack: n.stack,
      workMode: n.workMode as any,
      slots: n.slots,
      paid: n.paid,
      icon: n.icon,
      accent: n.accent,
      accentBorder: n.accentBorder,
      sortOrder: 200 + i,
    };
    await prisma.program.upsert({
      where: { slug: n.slug },
      update: data,
      create: { slug: n.slug, ...data },
    });
  }
  console.log(
    `✅ ${trainings.length} trainings, ${crashCourses.length} crash courses, ${internships.length} internship roles`,
  );

  // ── The existing certificate (from lib/certificates.ts) ────────────────
  const supervisor = ceo?.id;
  await prisma.certificate.upsert({
    where: { certNo: "UCT-INT-2026-0015" },
    update: {},
    create: {
      certNo: "UCT-INT-2026-0015",
      name: "Mukete Sharon Enanga",
      type: "INTERNSHIP",
      program: "Full Stack Development Internship",
      department: "Full Stack Development",
      periodStart: new Date("2026-04-12"),
      periodEnd: new Date("2026-06-12"),
      dateIssued: new Date("2026-06-15"),
      status: "VALID",
      supervisorName: "Obed Bolak F.",
      supervisorTitle: "CEO & Internship Supervisor",
      supervisorId: supervisor,
    },
  });
  console.log("✅ 1 certificate");

  console.log(
    `\n🎉 Done. Sign in as obed@unicomteam.com / ${defaultPassword}\n   (change this immediately — set SEED_ADMIN_PASSWORD to override)`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
