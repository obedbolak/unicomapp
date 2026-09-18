export interface CourseVariant {
  duration: string;
  price: string;
  sessions: string;
  mentorship: string;
  outcome: string;
}

export interface Course {
  slug: string;
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
}

export const programs: Course[] = [
  {
    slug: "frontend-development",
    badge: "Beginner",
    badgeColor: "rgba(34,197,94,0.15)",
    badgeBorder: "rgba(34,197,94,0.3)",
    badgeText: "#22c55e",
    title: "Frontend Development",
    subtitle: "HTML · CSS · JavaScript · React",
    description:
      "Master the fundamentals of the web. Go from zero to building fully responsive, interactive UIs with React and modern CSS.",
    category: "Beginner",
    icon: "🖥️",
    accent: "rgba(255,140,0,0.12)",
    accentBorder: "rgba(255,140,0,0.25)",
    featured: false,
    topics: null,
    variants: [
      {
        duration: "3 Months",
        price: "75,000 FCFA",
        sessions: "24 Live Sessions",
        mentorship: "1-on-1 Mentorship",
        outcome: "Portfolio + Certificate",
      },
      {
        duration: "6 Months",
        price: "135,000 FCFA",
        sessions: "48 Live Sessions",
        mentorship: "1-on-1 Mentorship",
        outcome: "Advanced Portfolio + Certificate",
      },
    ],
  },
  {
    slug: "backend-development",
    badge: "Intermediate",
    badgeColor: "rgba(59,130,246,0.15)",
    badgeBorder: "rgba(59,130,246,0.3)",
    badgeText: "#3b82f6",
    title: "Backend Development",
    subtitle: "Node.js · Express · PostgreSQL · REST APIs",
    description:
      "Build powerful server-side applications. Learn databases, authentication, REST API design, and deploy production-ready backends with confidence.",
    category: "Intermediate",
    icon: "⚙️",
    accent: "rgba(59,130,246,0.08)",
    accentBorder: "rgba(59,130,246,0.2)",
    featured: false,
    topics: ["Auth & JWT", "SQL & ORMs", "Caching & Queues", "CI/CD Deploys"],
    variants: [
      {
        duration: "3 Months",
        price: "75,000 FCFA",
        sessions: "24 Live Sessions",
        mentorship: "Weekly Reviews",
        outcome: "Portfolio + Certificate",
      },
      {
        duration: "6 Months",
        price: "135,000 FCFA",
        sessions: "48 Live Sessions",
        mentorship: "Weekly Reviews",
        outcome: "Advanced Portfolio + Certificate",
      },
    ],
  },
  {
    slug: "ui-ux-design",
    badge: "Intermediate",
    badgeColor: "rgba(168,85,247,0.15)",
    badgeBorder: "rgba(168,85,247,0.3)",
    badgeText: "#a855f7",
    title: "UI/UX Design",
    subtitle: "Figma · Design Systems · Prototyping",
    description:
      "Learn to design products people love. From wireframes to high-fidelity prototypes, build a designer's eye and a real-world portfolio.",
    category: "Intermediate",
    icon: "🎨",
    accent: "rgba(168,85,247,0.08)",
    accentBorder: "rgba(168,85,247,0.2)",
    featured: false,
    topics: null,
    variants: [
      {
        duration: "3 Months",
        price: "75,000 FCFA",
        sessions: "20 Live Sessions",
        mentorship: "Portfolio Reviews",
        outcome: "Figma Portfolio + Certificate",
      },
      {
        duration: "6 Months",
        price: "135,000 FCFA",
        sessions: "40 Live Sessions",
        mentorship: "Portfolio Reviews",
        outcome: "Advanced Figma Portfolio + Certificate",
      },
    ],
  },
  {
    slug: "full-stack-engineering",
    badge: "Advanced",
    badgeColor: "rgba(239,68,68,0.15)",
    badgeBorder: "rgba(239,68,68,0.3)",
    badgeText: "#ef4444",
    title: "Full-Stack Engineering",
    subtitle: "React · Node · Databases · DevOps",
    description:
      "The complete track. Build, deploy, and scale full-stack web applications end-to-end with industry-grade tooling and battle-tested engineering practices.",
    category: "Advanced",
    icon: "🚀",
    accent: "rgba(255,140,0,0.12)",
    accentBorder: "rgba(255,140,0,0.25)",
    featured: true,
    topics: [
      "Frontend with React",
      "REST & GraphQL APIs",
      "Databases & Auth",
      "Docker & DevOps",
      "Testing & CI/CD",
      "System Design",
    ],
    variants: [
      {
        duration: "3 Months",
        price: "75,000 FCFA",
        sessions: "48 Live Sessions",
        mentorship: "Dedicated Mentor",
        outcome: "Full Portfolio + Certificate",
      },
      {
        duration: "6 Months",
        price: "135,000 FCFA",
        sessions: "96 Live Sessions",
        mentorship: "Dedicated Mentor",
        outcome: "Full Portfolio + Certificate",
      },
      {
        duration: "1 Year",
        price: "250,000 FCFA",
        sessions: "192 Live Sessions",
        mentorship: "Dedicated Mentor",
        outcome: "Mastery Portfolio + Certificate",
      },
    ],
  },
  {
    slug: "digital-marketing",
    badge: "Beginner",
    badgeColor: "rgba(34,197,94,0.15)",
    badgeBorder: "rgba(34,197,94,0.3)",
    badgeText: "#22c55e",
    title: "Digital Marketing",
    subtitle: "SEO · Ads · Social Media · Analytics",
    description:
      "Drive traffic, generate leads, and grow brands online. Master SEO, paid ads, content strategy, and data-driven marketing.",
    category: "Beginner",
    icon: "📈",
    accent: "rgba(34,197,94,0.08)",
    accentBorder: "rgba(34,197,94,0.2)",
    featured: false,
    topics: null,
    variants: [
      {
        duration: "3 Months",
        price: "75,000 FCFA",
        sessions: "18 Live Sessions",
        mentorship: "Strategy Reviews",
        outcome: "Campaign Portfolio + Certificate",
      },
      {
        duration: "6 Months",
        price: "135,000 FCFA",
        sessions: "36 Live Sessions",
        mentorship: "Strategy Reviews",
        outcome: "Campaign Portfolio + Certificate",
      },
    ],
  },
  {
    slug: "mobile-development",
    badge: "Intermediate",
    badgeColor: "rgba(251,191,36,0.15)",
    badgeBorder: "rgba(251,191,36,0.3)",
    badgeText: "#fbbf24",
    title: "Mobile Development",
    subtitle: "React Native · Expo · App Store Deployment",
    description:
      "Build cross-platform mobile apps for iOS and Android. Learn React Native, state management, and ship real apps to the stores.",
    category: "Intermediate",
    icon: "📱",
    accent: "rgba(251,191,36,0.08)",
    accentBorder: "rgba(251,191,36,0.2)",
    featured: false,
    topics: ["RN Fundamentals", "Navigation", "Native APIs", "Store Deploy"],
    variants: [
      {
        duration: "3 Months",
        price: "75,000 FCFA",
        sessions: "20 Live Sessions",
        mentorship: "Weekly Reviews",
        outcome: "App Portfolio + Certificate",
      },
      {
        duration: "6 Months",
        price: "135,000 FCFA",
        sessions: "40 Live Sessions",
        mentorship: "Weekly Reviews",
        outcome: "App Portfolio + Certificate",
      },
      {
        duration: "1 Year",
        price: "250,000 FCFA",
        sessions: "80 Live Sessions",
        mentorship: "Weekly Reviews",
        outcome: "Store Deployments + Certificate",
      },
    ],
  },
  {
    slug: "desktop-app-development",
    badge: "Advanced",
    badgeColor: "rgba(14,165,233,0.15)",
    badgeBorder: "rgba(14,165,233,0.3)",
    badgeText: "#0ea5e9",
    title: "Desktop App Development",
    subtitle: "Electron · Tauri · Cross-Platform Desktop",
    description:
      "Build native-feeling desktop applications for Windows, macOS, and Linux. Learn Electron and Tauri, packaging, auto-updates, and shipping installable apps.",
    category: "Advanced",
    icon: "💻",
    accent: "rgba(14,165,233,0.08)",
    accentBorder: "rgba(14,165,233,0.2)",
    featured: false,
    topics: [
      "Electron & Tauri",
      "Native Menus & APIs",
      "Packaging & Installers",
      "Auto-Updates",
    ],
    variants: [
      {
        duration: "3 Months",
        price: "75,000 FCFA",
        sessions: "18 Live Sessions",
        mentorship: "Weekly Reviews",
        outcome: "Desktop App Portfolio + Certificate",
      },
      {
        duration: "6 Months",
        price: "135,000 FCFA",
        sessions: "36 Live Sessions",
        mentorship: "Weekly Reviews",
        outcome: "Desktop App Portfolio + Certificate",
      },
      {
        duration: "1 Year",
        price: "250,000 FCFA",
        sessions: "72 Live Sessions",
        mentorship: "Weekly Reviews",
        outcome: "Shipped Applications + Certificate",
      },
    ],
  },
];

export const crashCourses: Course[] = [
  {
    slug: "graphics-design-crash",
    title: "Graphics Design (Crash Course)",
    subtitle: "Photoshop · Illustrator · Canva",
    description:
      "Design logos, flyers, social posts, and brand kits in weeks. Perfect for freelancers and side hustles.",
    category: "Crash Course",
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
    title: "Microsoft Excel (Crash Course)",
    subtitle: "Formulas · Pivot Tables · Dashboards",
    description:
      "Go from beginner to spreadsheet pro. Master formulas, charts, pivot tables, and automation that employers love.",
    category: "Crash Course",
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
    title: "Microsoft Office (Crash Course)",
    subtitle: "Word · Excel · PowerPoint · Outlook",
    description:
      "Become office-ready fast. Master the everyday tools every workplace expects you to know inside out.",
    category: "Crash Course",
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
