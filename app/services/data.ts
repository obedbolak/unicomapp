import type { LucideIcon } from "lucide-react";
import { Code, Globe, Smartphone, Share2, TrendingUp } from "lucide-react";

export type Service = {
  slug: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
  details: string[];
};

export const services: Service[] = [
  {
    slug: "software-solutions",
    icon: Code,
    title: "Software Solutions",
    desc: "Tailored software architectures engineered for scale, security, and commercial performance. From API design to full-stack deployment.",
    tag: "Engineering",
    details: [
      "Custom backend and frontend systems built to your exact business requirements.",
      "API development, microservices, cloud integration, and enterprise-grade reliability.",
      "Modern tooling for observability, CI/CD, and long-term maintainability.",
    ],
  },
  {
    slug: "digital-marketing",
    icon: Globe,
    title: "Digital Marketing",
    desc: "Data-driven campaigns that convert. SEO, SEM, and growth hacking for modern businesses aiming to dominate their market.",
    tag: "Growth",
    details: [
      "Audience research, campaign strategy, and measurement frameworks.",
      "Search engine optimization, paid advertising, and conversion optimization.",
      "Performance analytics and growth loops that keep your marketing budget efficient.",
    ],
  },
  {
    slug: "mobile-web-development",
    icon: Smartphone,
    title: "Mobile & Web Development",
    desc: "Progressive web apps and native mobile experiences built with React, Next.js, and modern stacks that scale.",
    tag: "Development",
    details: [
      "Cross-platform web apps, responsive UI, and performant mobile-first experiences.",
      "Native mobile strategy, PWA optimization, and fast loading interactions.",
      "Integration with backend services, payment systems, and secure authentication.",
    ],
  },
  {
    slug: "social-media-management",
    icon: Share2,
    title: "Social Media Management",
    desc: "Content strategy, community building, and analytics across Instagram, TikTok, Facebook, and beyond.",
    tag: "Social",
    details: [
      "Publishing calendars, engagement strategies, and creative direction.",
      "Audience growth, influencer partnerships, and reputation management.",
      "Performance reporting that links social activity to business outcomes.",
    ],
  },
  {
    slug: "business-strategy",
    icon: TrendingUp,
    title: "Business Strategy",
    desc: "Operational consulting and digital transformation roadmaps for enterprise and startup growth.",
    tag: "Strategy",
    details: [
      "Market positioning, product strategy, and digital transformation planning.",
      "Revenue models, operational process optimization, and scalable growth plans.",
      "Alignment of technology and business goals for measurable impact.",
    ],
  },
];

export function findServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
