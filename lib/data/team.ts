export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  image: string;
  /** Short one-line motto shown under the name. */
  slogan: string;
  summary: string;
  /** Longer "about" text, one string per paragraph. */
  bio: string[];
  /** What this person is to UnicomTeam, in a sentence or two. */
  companyRole: string;
  /** Day-to-day responsibilities at UnicomTeam. */
  responsibilities: string[];
  focus: string[];
  /** Personal phone as shown on the page, e.g. "+237 6XX XXX XXX". Falls back to the company line. */
  phone?: string;
  /** Personal email. Falls back to the company address. */
  email?: string;
  /**
   * WhatsApp number in international format, digits only (country code, no "+"
   * or spaces), e.g. "237681529488". Defaults to `phone` when that is set,
   * otherwise to the company line.
   */
  whatsapp?: string;
};

/** UnicomTeam's shared contact details, used when a member has none of their own. */
export const COMPANY_CONTACT = {
  phone: "+237 681 529 488",
  email: "contact@unicomteam.com",
  whatsapp: "237681529488",
  location: "Remote — worldwide",
} as const;

export const teamMembers: TeamMember[] = [
  {
    slug: "alvine-malyka",
    name: "Alvine Malyka",
    role: "Core Systems Engineer",
    image: "/team/bbty.png",
    slogan: "Built to be dependable.",
    summary:
      "Alvine helps shape the reliable systems behind UnicomTeam's digital products, turning complex technical needs into dependable, scalable solutions.",
    bio: [
      "Alvine works on the foundations of UnicomTeam's products: the systems and services that have to keep running quietly while everything else is built on top of them.",
      "Complex technical needs rarely arrive neatly. Alvine breaks them down, finds the cause behind the symptom, and turns them into solutions that stay dependable as products and teams grow.",
    ],
    companyRole:
      "The engineer UnicomTeam relies on for the core of its products, from the way systems are structured to how reliably they run.",
    responsibilities: [
      "Designs and maintains the core systems behind UnicomTeam products",
      "Diagnoses technical problems and turns them into lasting fixes",
      "Keeps products reliable and ready to scale as they grow",
    ],
    focus: ["Systems engineering", "Technical problem-solving", "Product reliability"],
  },
  {
    slug: "fomusoh-stephanie",
    name: "Fomusoh Stephanie",
    role: "Frontend & UI/UX Designer",
    image: "/team/steph.png",
    slogan: "Clear design, polished delivery.",
    summary:
      "Stephanie bridges interface design and front-end delivery, creating clear, polished experiences that make digital products easy to use.",
    bio: [
      "Stephanie works where design meets code. She shapes how UnicomTeam's products look and feel, then carries that design all the way into the finished interface.",
      "Her focus is simple: products should be easy to understand and pleasant to use. That means clear layouts, consistent design systems, and front-end work that stays faithful to the design.",
    ],
    companyRole:
      "UnicomTeam's bridge between design and front-end delivery, making sure what is designed is what ships.",
    responsibilities: [
      "Designs interfaces and user flows for client and in-house products",
      "Builds and maintains design systems so every screen feels consistent",
      "Turns designs into responsive, polished front-end experiences",
    ],
    focus: ["UI/UX design", "Front-end development", "Design systems"],
    phone: "+237 674 85 45 81",
    email: "stephanie@unicomteam.com",
  },
  {
    slug: "rosine-mbashi",
    name: "Rosine Mbashi",
    role: "Marketing & Business Strategist",
    image: "/team/rosin.png",
    slogan: "Strategy that turns ideas into growth.",
    summary:
      "Rosine connects product decisions to business goals, helping teams clarify their market, messaging, and path to sustainable growth.",
    bio: [
      "Rosine links what UnicomTeam builds to the business reasons behind it. She looks at the market, the audience, and the goals, then helps shape a clear path forward.",
      "From sharpening a message to planning how a product reaches the people who need it, her work helps clients grow in a way that lasts rather than chasing quick wins.",
    ],
    companyRole:
      "UnicomTeam's voice on strategy and growth, helping clients and the team decide where to aim and how to get there.",
    responsibilities: [
      "Shapes business strategy and positioning for clients and for UnicomTeam",
      "Plans digital marketing and messaging that speaks to the right audience",
      "Turns goals into practical growth plans the team can act on",
    ],
    focus: ["Business strategy", "Digital marketing", "Growth planning"],
    phone: "+237 696 76 79 23",
    email: "rosine@unicomteam.com",
  },
  {
    slug: "lilian-martin",
    name: "Lilian Martin",
    role: "Frontend & UI Specialist",
    image: "/team/lili.png",
    slogan: "Craft in every detail.",
    summary:
      "Lilian focuses on thoughtful interfaces and front-end craftsmanship, helping UnicomTeam turn product ideas into engaging digital experiences.",
    bio: [
      "Lilian cares about the details people feel but rarely name: spacing, motion, responsiveness, and the small touches that make an interface feel finished.",
      "Working closely with design and engineering, Lilian turns product ideas into interfaces that look sharp on every screen and are a pleasure to use.",
    ],
    companyRole:
      "A front-end specialist who gives UnicomTeam's products their finish, so ideas become experiences people enjoy.",
    responsibilities: [
      "Builds responsive, accessible interfaces for web products",
      "Refines interface details so every screen feels considered",
      "Works with design and engineering to ship ideas quickly and cleanly",
    ],
    focus: ["Front-end development", "Interface design", "Responsive experiences"],
    phone: "+237 670 83 40 19",
    email: "lilian@unicomteam.com",
  },
  {
    slug: "obedbolakfuchu",
    name: "Obed Bolak",
    role: "CEO & Full-Stack Developer",
    image: "/team/ceo.png",
    slogan: "Build it right. Build it to grow.",
    summary:
      "Obed leads UnicomTeam's technical and product direction. He brings strategy, user experience, and full-stack engineering together to build digital products that are practical, polished, and ready to grow.",
    bio: [
      "Obed leads UnicomTeam and stays hands-on with the code. He sets the technical and product direction while building across the full stack himself.",
      "He brings strategy, user experience, and engineering together, so the products UnicomTeam delivers are practical, polished, and ready to grow with the people who use them.",
    ],
    companyRole:
      "The CEO of UnicomTeam, setting the company's direction and leading its technical and product work.",
    responsibilities: [
      "Leads UnicomTeam's vision, direction, and client relationships",
      "Architects and builds products across the full stack",
      "Guides the team on technical decisions and quality",
    ],
    focus: ["Full-stack development", "Product architecture", "Technical leadership"],
    phone: "+237 681 52 94 88",
    email: "obedbolak@unicomteam.com",
  },
];

export function findTeamMember(slug: string) {
  return teamMembers.find((member) => member.slug === slug);
}

/** Everything the profile page shows under "contact", with company fallbacks filled in. */
export function contactFor(member: TeamMember) {
  const phone = member.phone ?? COMPANY_CONTACT.phone;
  const phoneDigits = phone.replace(/\D/g, "");

  return {
    phone,
    phoneHref: `tel:+${phoneDigits}`,
    email: member.email ?? COMPANY_CONTACT.email,
    whatsapp: member.whatsapp ?? (member.phone ? phoneDigits : COMPANY_CONTACT.whatsapp),
    location: COMPANY_CONTACT.location,
    /** True when the phone shown is the shared UnicomTeam line, not the person's own. */
    sharedPhone: !member.phone,
    sharedEmail: !member.email,
  };
}
