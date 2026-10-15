export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  image: string;
  summary: string;
  focus: string[];
};

export const teamMembers: TeamMember[] = [
  {
    slug: "alvine-malyka",
    name: "Alvine Malyka",
    role: "Core Systems Engineer",
    image: "/team/bbty.png",
    summary:
      "Alvine helps shape the reliable systems behind UnicomTeam's digital products, turning complex technical needs into dependable, scalable solutions.",
    focus: ["Systems engineering", "Technical problem-solving", "Product reliability"],
  },
  {
    slug: "fomusoh-stephanie",
    name: "Fomusoh Stephanie",
    role: "Frontend & UI/UX Designer",
    image: "/team/steph.png",
    summary:
      "Stephanie bridges interface design and front-end delivery, creating clear, polished experiences that make digital products easy to use.",
    focus: ["UI/UX design", "Front-end development", "Design systems"],
  },
  {
    slug: "rosine-mbashi",
    name: "Rosine Mbashi",
    role: "Marketing & Business Strategist",
    image: "/team/rosin.png",
    summary:
      "Rosine connects product decisions to business goals, helping teams clarify their market, messaging, and path to sustainable growth.",
    focus: ["Business strategy", "Digital marketing", "Growth planning"],
  },
  {
    slug: "lilian-martin",
    name: "Lilian Martin",
    role: "Frontend & UI Specialist",
    image: "/team/lili.png",
    summary:
      "Lilian focuses on thoughtful interfaces and front-end craftsmanship, helping UnicomTeam turn product ideas into engaging digital experiences.",
    focus: ["Front-end development", "Interface design", "Responsive experiences"],
  },
  {
    slug: "obedbolakfuchu",
    name: "Obed Bolak",
    role: "CEO & Full-Stack Developer",
    image: "/team/ceo.png",
    summary:
      "Obed leads UnicomTeam's technical and product direction. He brings strategy, user experience, and full-stack engineering together to build digital products that are practical, polished, and ready to grow.",
    focus: [
      "Full-stack development",
      "Product architecture",
      "Technical leadership",
    ],
  },
];

export function findTeamMember(slug: string) {
  return teamMembers.find((member) => member.slug === slug);
}
