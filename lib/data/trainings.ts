// lib/data/trainings.ts
//
// The single source for the training catalogue. `prisma/seed.ts` loads this
// into the database and `lib/data/catalog.ts` falls back to it if the database
// is unreachable, so the public pages never go blank.
//
// Professional trainings are priced 75,000 / 150,000 / 220,000 FCFA for
// 3 months / 6 months / 1 year. Online (self-paced) course prices are
// placeholders — edit them here (or in the DB) before launch.

export type DeliveryMode = "PHYSICAL" | "LIVE_ONLINE" | "SELF_PACED";
export type CourseKind = "TRAINING" | "CRASH_COURSE" | "ONLINE_COURSE";

export const MODE_LABEL: Record<DeliveryMode, string> = {
  PHYSICAL: "Physical",
  LIVE_ONLINE: "Live Online",
  SELF_PACED: "Online · Self-paced",
};

export interface CourseVariant {
  duration: string;
  months?: number;
  price: string;
  sessions: string;
  mentorship: string;
  outcome: string;
}

export type LessonType = "VIDEO" | "PDF" | "ARTICLE";

export interface Lesson {
  title: string;
  type: LessonType;
  /** Hosted file/video URL. Without one the lesson shows as "coming soon". */
  url?: string;
  minutes?: number;
  /** Free preview, viewable without enrolling. */
  free?: boolean;
}

export interface CourseSection {
  title: string;
  lessons: Lesson[];
}

export interface Course {
  slug: string;
  kind: CourseKind;
  modes: DeliveryMode[];
  badge: string;
  badgeColor: string;
  badgeBorder: string;
  badgeText: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  icon: string;
  accent: string;
  accentBorder: string;
  featured: boolean;
  topics: string[] | null;
  variants: CourseVariant[];
  curriculum?: CourseSection[];
  instructor?: string;
}

/* ── Pricing ─────────────────────────────────────────────────────────────── */

export const PROFESSIONAL_TIERS = [
  { duration: "3 Months", months: 3, price: "75,000 FCFA", mult: 1 },
  { duration: "6 Months", months: 6, price: "150,000 FCFA", mult: 2 },
  { duration: "1 Year", months: 12, price: "220,000 FCFA", mult: 4 },
] as const;

export const PROFESSIONAL_MODES: DeliveryMode[] = ["PHYSICAL", "LIVE_ONLINE"];

/** 3 / 6 / 12-month variants; session counts scale with the length. */
function tiers(
  baseSessions: number,
  mentorship: string,
  outcome: [string, string, string],
): CourseVariant[] {
  return PROFESSIONAL_TIERS.map((t, i) => ({
    duration: t.duration,
    months: t.months,
    price: t.price,
    sessions: `${baseSessions * t.mult} Live Sessions`,
    mentorship,
    outcome: outcome[i],
  }));
}

const colour = (rgb: string) => ({
  badgeColor: `rgba(${rgb},0.15)`,
  badgeBorder: `rgba(${rgb},0.3)`,
  accent: `rgba(${rgb},0.08)`,
  accentBorder: `rgba(${rgb},0.2)`,
});

/* ── Professional trainings (physical or live online) ────────────────────── */

export const programs: Course[] = [
  {
    slug: "frontend-development",
    kind: "TRAINING",
    modes: PROFESSIONAL_MODES,
    ...colour("34,197,94"),
    badge: "Beginner",
    badgeText: "#22c55e",
    title: "Frontend Development",
    subtitle: "HTML · CSS · JavaScript · React",
    description:
      "Master the fundamentals of the web. Go from zero to building fully responsive, interactive UIs with React and modern CSS.",
    category: "Web",
    icon: "🖥️",
    featured: false,
    topics: [
      "HTML & CSS",
      "JavaScript",
      "React & Next.js",
      "Responsive Design",
    ],
    variants: tiers(24, "1-on-1 Mentorship", [
      "Portfolio + Certificate",
      "Advanced Portfolio + Certificate",
      "Mastery Portfolio + Certificate",
    ]),
  },
  {
    slug: "backend-development",
    kind: "TRAINING",
    modes: PROFESSIONAL_MODES,
    ...colour("59,130,246"),
    badge: "Intermediate",
    badgeText: "#3b82f6",
    title: "Backend Development",
    subtitle: "Node.js · Express · PostgreSQL · REST APIs",
    description:
      "Build powerful server-side applications. Learn databases, authentication, REST API design, and deploy production-ready backends with confidence.",
    category: "Web",
    icon: "⚙️",
    featured: false,
    topics: ["Auth & JWT", "SQL & ORMs", "Caching & Queues", "CI/CD Deploys"],
    variants: tiers(24, "Weekly Reviews", [
      "Portfolio + Certificate",
      "Advanced Portfolio + Certificate",
      "Production Projects + Certificate",
    ]),
  },
  {
    slug: "ui-ux-design",
    kind: "TRAINING",
    modes: PROFESSIONAL_MODES,
    ...colour("168,85,247"),
    badge: "Intermediate",
    badgeText: "#a855f7",
    title: "UI/UX Design",
    subtitle: "Figma · Design Systems · Prototyping",
    description:
      "Learn to design products people love. From wireframes to high-fidelity prototypes, build a designer's eye and a real-world portfolio.",
    category: "Design",
    icon: "🎨",
    featured: false,
    topics: ["Figma", "Wireframing", "Design Systems", "User Research"],
    variants: tiers(20, "Portfolio Reviews", [
      "Figma Portfolio + Certificate",
      "Advanced Figma Portfolio + Certificate",
      "Case-Study Portfolio + Certificate",
    ]),
  },
  {
    slug: "full-stack-engineering",
    kind: "TRAINING",
    modes: PROFESSIONAL_MODES,
    ...colour("239,68,68"),
    badge: "Advanced",
    badgeText: "#ef4444",
    title: "Full-Stack Engineering",
    subtitle: "Build Web Apps · React · Node · Databases · DevOps",
    description:
      "The complete web track. Build, deploy, and scale full-stack web applications end-to-end with industry-grade tooling and battle-tested engineering practices.",
    category: "Web",
    icon: "🚀",
    featured: true,
    topics: [
      "Frontend with React",
      "REST & GraphQL APIs",
      "Databases & Auth",
      "Docker & DevOps",
      "Testing & CI/CD",
      "System Design",
    ],
    variants: tiers(48, "Dedicated Mentor", [
      "Full Portfolio + Certificate",
      "Full Portfolio + Certificate",
      "Mastery Portfolio + Certificate",
    ]),
  },
  {
    slug: "digital-marketing",
    kind: "TRAINING",
    modes: PROFESSIONAL_MODES,
    ...colour("34,197,94"),
    badge: "Beginner",
    badgeText: "#22c55e",
    title: "Digital Marketing",
    subtitle: "SEO · Ads · Social Media · Analytics",
    description:
      "Drive traffic, generate leads, and grow brands online. Master SEO, paid ads, content strategy, and data-driven marketing.",
    category: "Marketing",
    icon: "📈",
    featured: false,
    topics: ["SEO", "Paid Ads", "Content Strategy", "Analytics"],
    variants: tiers(18, "Strategy Reviews", [
      "Campaign Portfolio + Certificate",
      "Campaign Portfolio + Certificate",
      "Agency-Ready Portfolio + Certificate",
    ]),
  },
  {
    slug: "mobile-development",
    kind: "TRAINING",
    modes: PROFESSIONAL_MODES,
    ...colour("251,191,36"),
    badge: "Intermediate",
    badgeText: "#fbbf24",
    title: "Mobile Development",
    subtitle: "Build Mobile Apps · React Native · Expo · Store Deployment",
    description:
      "Build cross-platform mobile apps for iOS and Android. Learn React Native, state management, and ship real apps to the stores.",
    category: "Mobile",
    icon: "📱",
    featured: false,
    topics: ["RN Fundamentals", "Navigation", "Native APIs", "Store Deploy"],
    variants: tiers(20, "Weekly Reviews", [
      "App Portfolio + Certificate",
      "App Portfolio + Certificate",
      "Store Deployments + Certificate",
    ]),
  },
  {
    slug: "desktop-app-development",
    kind: "TRAINING",
    modes: PROFESSIONAL_MODES,
    ...colour("14,165,233"),
    badge: "Advanced",
    badgeText: "#0ea5e9",
    title: "Desktop App Development",
    subtitle: "Build Desktop Apps · Electron · Tauri · Windows, macOS, Linux",
    description:
      "Build native-feeling desktop applications for Windows, macOS, and Linux. Learn Electron and Tauri, packaging, auto-updates, and shipping installable apps.",
    category: "Desktop",
    icon: "💻",
    featured: false,
    topics: [
      "Electron & Tauri",
      "Native Menus & APIs",
      "Packaging & Installers",
      "Auto-Updates",
    ],
    variants: tiers(18, "Weekly Reviews", [
      "Desktop App Portfolio + Certificate",
      "Desktop App Portfolio + Certificate",
      "Shipped Applications + Certificate",
    ]),
  },
];

/* ── Crash courses (physical or live online) ─────────────────────────────── */

const CRASH_MODES: DeliveryMode[] = ["PHYSICAL", "LIVE_ONLINE"];

export const crashCourses: Course[] = [
  {
    slug: "graphics-design-crash",
    kind: "CRASH_COURSE",
    modes: CRASH_MODES,
    title: "Graphics Design (Crash Course)",
    subtitle: "Photoshop · Illustrator · Canva",
    description:
      "Design logos, flyers, social posts, and brand kits in weeks. Perfect for freelancers and side hustles.",
    category: "Design",
    icon: "🎨",
    accent: "rgba(236,72,153,0.12)",
    accentBorder: "rgba(236,72,153,0.3)",
    badgeText: "#ec4899",
    badge: "Crash Course",
    badgeColor: "rgba(236,72,153,0.15)",
    badgeBorder: "rgba(236,72,153,0.3)",
    featured: false,
    topics: null,
    variants: [
      {
        duration: "1 Week",
        price: "25,000 FCFA",
        sessions: "4 Live Sessions",
        mentorship: "Basic Review",
        outcome: "Basics Certificate",
      },
      {
        duration: "2 Weeks",
        price: "45,000 FCFA",
        sessions: "8 Live Sessions",
        mentorship: "Basic Review",
        outcome: "Intermediate Certificate",
      },
      {
        duration: "4 Weeks",
        price: "75,000 FCFA",
        sessions: "16 Live Sessions",
        mentorship: "Detailed Review",
        outcome: "Advanced Certificate",
      },
    ],
  },
  {
    slug: "microsoft-excel-crash",
    kind: "CRASH_COURSE",
    modes: CRASH_MODES,
    title: "Microsoft Excel (Crash Course)",
    subtitle: "Formulas · Pivot Tables · Dashboards",
    description:
      "Go from beginner to spreadsheet pro. Master formulas, charts, pivot tables, and automation that employers love.",
    category: "Office",
    icon: "📊",
    accent: "rgba(34,197,94,0.12)",
    accentBorder: "rgba(34,197,94,0.3)",
    badgeText: "#22c55e",
    badge: "Crash Course",
    badgeColor: "rgba(34,197,94,0.15)",
    badgeBorder: "rgba(34,197,94,0.3)",
    featured: false,
    topics: null,
    variants: [
      {
        duration: "1 Week",
        price: "25,000 FCFA",
        sessions: "3 Live Sessions",
        mentorship: "Basic Review",
        outcome: "Basics Certificate",
      },
      {
        duration: "2 Weeks",
        price: "45,000 FCFA",
        sessions: "6 Live Sessions",
        mentorship: "Basic Review",
        outcome: "Intermediate Certificate",
      },
      {
        duration: "3 Weeks",
        price: "60,000 FCFA",
        sessions: "9 Live Sessions",
        mentorship: "Detailed Review",
        outcome: "Advanced Certificate",
      },
    ],
  },
  {
    slug: "microsoft-office-crash",
    kind: "CRASH_COURSE",
    modes: CRASH_MODES,
    title: "Microsoft Office (Crash Course)",
    subtitle: "Word · Excel · PowerPoint · Outlook",
    description:
      "Become office-ready fast. Master the everyday tools every workplace expects you to know inside out.",
    category: "Office",
    icon: "🗂️",
    accent: "rgba(59,130,246,0.12)",
    accentBorder: "rgba(59,130,246,0.3)",
    badgeText: "#3b82f6",
    badge: "Crash Course",
    badgeColor: "rgba(59,130,246,0.15)",
    badgeBorder: "rgba(59,130,246,0.3)",
    featured: false,
    topics: null,
    variants: [
      {
        duration: "1 Week",
        price: "25,000 FCFA",
        sessions: "4 Live Sessions",
        mentorship: "Basic Review",
        outcome: "Basics Certificate",
      },
      {
        duration: "2 Weeks",
        price: "45,000 FCFA",
        sessions: "8 Live Sessions",
        mentorship: "Basic Review",
        outcome: "Intermediate Certificate",
      },
      {
        duration: "4 Weeks",
        price: "75,000 FCFA",
        sessions: "16 Live Sessions",
        mentorship: "Detailed Review",
        outcome: "Advanced Certificate",
      },
    ],
  },
];

/* ── Online, self-paced courses (video + PDF, Udemy-style) ───────────────── */
//
// Curricula below are OUTLINES. Lessons have no `url` yet, so the course page
// shows them as "coming soon" until you upload the video/PDF and paste its URL
// (or we add the admin uploader in stage 2).

const v = (title: string, free = false): Lesson => ({
  title,
  type: "VIDEO",
  free,
});
const pdf = (title: string): Lesson => ({ title, type: "PDF" });

const ONLINE_MODES: DeliveryMode[] = ["SELF_PACED"];

function online(
  c: Omit<Course, "kind" | "modes" | "badge" | "featured" | "variants"> & {
    price: string;
  },
): Course {
  const { price, ...rest } = c;
  return {
    ...rest,
    kind: "ONLINE_COURSE",
    modes: ONLINE_MODES,
    badge: "Online Course",
    featured: false,
    variants: [
      {
        duration: "Lifetime access",
        price,
        sessions: "Video lessons + PDF notes",
        mentorship: "Community Q&A",
        outcome: "Certificate of Completion",
      },
    ],
  };
}

export const onlineCourses: Course[] = [
  online({
    slug: "ai-tools-prompt-engineering",
    title: "AI Tools & Prompt Engineering for Work",
    subtitle: "ChatGPT · Claude · Automation · Productivity",
    description:
      "Use AI assistants to write, research, analyse and automate everyday work — and learn to prompt them properly.",
    category: "AI",
    icon: "🤖",
    ...colour("168,85,247"),
    badgeText: "#a855f7",
    topics: ["Prompting basics", "Research & writing", "Automation", "Ethics"],
    price: "20,000 FCFA",
    curriculum: [
      {
        title: "Getting started with AI",
        lessons: [v("What AI assistants can and cannot do", true), v("Writing your first effective prompt"), pdf("Prompt templates cheat sheet")],
      },
      {
        title: "AI for everyday work",
        lessons: [v("Research and summarising documents"), v("Emails, reports and proposals"), v("Spreadsheets and data help")],
      },
      {
        title: "Automate it",
        lessons: [v("Connecting AI to your daily tools"), v("Responsible use and verifying outputs"), pdf("Workflow checklist")],
      },
    ],
  }),
  online({
    slug: "data-analysis-excel-power-bi",
    title: "Data Analysis with Excel & Power BI",
    subtitle: "Cleaning · Pivot Tables · Dashboards",
    description:
      "Turn raw data into decisions. Clean, analyse and present data with Excel and build interactive Power BI dashboards.",
    category: "Data",
    icon: "📊",
    ...colour("34,197,94"),
    badgeText: "#22c55e",
    topics: ["Data cleaning", "Pivot tables", "Power BI dashboards", "Reporting"],
    price: "25,000 FCFA",
    curriculum: [
      {
        title: "Excel for analysis",
        lessons: [v("Cleaning messy data", true), v("Formulas that matter"), v("Pivot tables and charts"), pdf("Formula reference")],
      },
      {
        title: "Power BI",
        lessons: [v("Importing and modelling data"), v("Building a dashboard"), v("Publishing and sharing")],
      },
    ],
  }),
  online({
    slug: "python-for-beginners",
    title: "Python Programming for Beginners",
    subtitle: "Python · Automation · Data basics",
    description:
      "Learn Python from zero: variables, logic, functions, files and small automation projects you can actually use.",
    category: "Programming",
    icon: "🐍",
    ...colour("251,191,36"),
    badgeText: "#fbbf24",
    topics: ["Syntax & logic", "Functions", "Files & automation", "Mini projects"],
    price: "25,000 FCFA",
    curriculum: [
      {
        title: "Python basics",
        lessons: [v("Installing Python and your first program", true), v("Variables, types and operators"), v("Conditions and loops")],
      },
      {
        title: "Building real things",
        lessons: [v("Functions and modules"), v("Working with files"), v("Project: automate a boring task"), pdf("Practice exercises")],
      },
    ],
  }),
  online({
    slug: "cybersecurity-essentials",
    title: "Cybersecurity Essentials",
    subtitle: "Threats · Safe Practices · Networks",
    description:
      "Understand how attacks work and how to protect yourself, your team and your business online.",
    category: "Security",
    icon: "🛡️",
    ...colour("239,68,68"),
    badgeText: "#ef4444",
    topics: ["Common threats", "Passwords & MFA", "Network basics", "Incident response"],
    price: "25,000 FCFA",
    curriculum: [
      {
        title: "Know the threats",
        lessons: [v("Phishing, malware and social engineering", true), v("How attackers think")],
      },
      {
        title: "Defend",
        lessons: [v("Passwords, MFA and device hygiene"), v("Securing networks and Wi-Fi"), pdf("Security checklist for small businesses")],
      },
    ],
  }),
  online({
    slug: "cloud-devops-fundamentals",
    title: "Cloud & DevOps Fundamentals",
    subtitle: "Git · Docker · AWS · CI/CD",
    description:
      "Ship software like a professional: version control, containers, cloud hosting and automated deployments.",
    category: "Cloud",
    icon: "☁️",
    ...colour("14,165,233"),
    badgeText: "#0ea5e9",
    topics: ["Git & GitHub", "Docker", "Cloud hosting", "CI/CD"],
    price: "30,000 FCFA",
    curriculum: [
      {
        title: "Foundations",
        lessons: [v("Git and GitHub workflow", true), v("Linux command line essentials")],
      },
      {
        title: "Containers and cloud",
        lessons: [v("Docker from scratch"), v("Deploying to the cloud"), v("Automating with CI/CD"), pdf("Deployment checklist")],
      },
    ],
  }),
  online({
    slug: "social-media-content-creation",
    title: "Social Media & Content Creation",
    subtitle: "Strategy · Reels · Community · Growth",
    description:
      "Plan, create and grow a brand on social media — content calendars, short video, and measuring what works.",
    category: "Marketing",
    icon: "📱",
    ...colour("236,72,153"),
    badgeText: "#ec4899",
    topics: ["Content strategy", "Short video", "Community", "Analytics"],
    price: "20,000 FCFA",
    curriculum: [
      {
        title: "Strategy",
        lessons: [v("Defining audience and voice", true), v("Building a content calendar"), pdf("Content calendar template")],
      },
      {
        title: "Create and grow",
        lessons: [v("Shooting and editing short video"), v("Growing and engaging a community"), v("Reading your analytics")],
      },
    ],
  }),
  online({
    slug: "freelancing-remote-work",
    title: "Freelancing & Remote Work Mastery",
    subtitle: "Profiles · Proposals · Pricing · Getting Paid",
    description:
      "Land your first international clients: build a profile, write winning proposals, price your work and get paid.",
    category: "Career",
    icon: "🌍",
    ...colour("255,140,0"),
    badgeText: "#ff8c00",
    topics: ["Profiles", "Proposals", "Pricing", "Getting paid from Cameroon"],
    price: "20,000 FCFA",
    curriculum: [
      {
        title: "Get started",
        lessons: [v("Choosing a service and niche", true), v("Building a profile and portfolio")],
      },
      {
        title: "Win and deliver",
        lessons: [v("Writing proposals that win"), v("Pricing and contracts"), v("Receiving international payments"), pdf("Proposal templates")],
      },
    ],
  }),
  online({
    slug: "video-editing-motion-graphics",
    title: "Video Editing & Motion Graphics",
    subtitle: "Editing · Titles · Colour · Export",
    description:
      "Edit professional-looking videos for clients, brands and your own channel, from cutting to finishing.",
    category: "Design",
    icon: "🎬",
    ...colour("244,63,94"),
    badgeText: "#f43f5e",
    topics: ["Editing basics", "Titles & motion", "Colour & sound", "Export"],
    price: "25,000 FCFA",
    curriculum: [
      {
        title: "Editing",
        lessons: [v("Interface, import and the timeline", true), v("Cutting, pacing and transitions")],
      },
      {
        title: "Finishing",
        lessons: [v("Titles and simple motion graphics"), v("Colour and audio clean-up"), v("Exporting for every platform"), pdf("Export settings guide")],
      },
    ],
  }),
];

/* ── Internship placements ───────────────────────────────────────────────── */

export const internshipPlacements = {
  perMonth: "15,000 FCFA",
  duration: "3, 6 or 12 months",
  blurb:
    "We place trainees and graduates on real client and in-house projects with our engineers — build a portfolio, earn references, and get considered for permanent roles.",
};

/* ── Everything, in display order ────────────────────────────────────────── */

export const allCourses: Course[] = [
  ...programs,
  ...onlineCourses,
  ...crashCourses,
];

export function findCourse(slug: string) {
  return allCourses.find((c) => c.slug === slug);
}
