import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// ── Scraper ────────────────────────────────────────────────────────────────────

async function scrapePageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "UnicomBot/1.0 (internal assistant)",
      },
    });
    if (!res.ok) return "";
    const html = await res.text();
    const $ = cheerio.load(html);

    $(
      "script, style, nav, header, footer, head, noscript, svg, iframe",
    ).remove();

    const title = $("title").text().trim();
    const metaDesc = $('meta[name="description"]').attr("content") ?? "";
    const h1s = $("h1")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" | ");
    const h2s = $("h2")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" | ");
    const bodyText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);

    return `Title: ${title}\nDescription: ${metaDesc}\nH1: ${h1s}\nH2: ${h2s}\nContent: ${bodyText}`;
  } catch {
    return "";
  }
}

// ── Pages to scrape ────────────────────────────────────────────────────────────

const BASE = "https://unicomteam.com";

const SITE_KNOWLEDGE = `
== OFFICIAL CUSTOMER SERVICE DETAILS ==
Company: UnicomTeam
Website: ${BASE}
Email: contact@unicomteam.com
Email link: mailto:contact@unicomteam.com
Phone: +237 681 529 488
Phone link: tel:+237681529488
Location: Remote - worldwide
Typical response time: within 24 hours

Social links:
- Instagram: https://www.instagram.com/unicomteam1
- Facebook: https://www.facebook.com/share/18keP13dmW
- TikTok: https://tiktok.com/@unicomteam0

== BEST PAGES TO SHARE ==
- Home: ${BASE}/
- About UnicomTeam: ${BASE}/about
- Services overview: ${BASE}/services
- Software Solutions: ${BASE}/services/software-solutions
- Digital Marketing: ${BASE}/services/digital-marketing
- Mobile & Web Development: ${BASE}/services/mobile-web-development
- Social Media Management: ${BASE}/services/social-media-management
- Business Strategy: ${BASE}/services/business-strategy
- Projects / case studies: ${BASE}/projects
- Trainings: ${BASE}/trainings
- Internship information: ${BASE}/trainings/internships
- Training enrollment: ${BASE}/trainings/enroll
- Contact form: ${BASE}/contact
- Privacy Policy: ${BASE}/privacy
- Terms of Service: ${BASE}/terms

== WHAT UNICOMTEAM HELPS WITH ==
UnicomTeam helps businesses, founders, students, and organizations with software solutions, web and mobile development, digital marketing, social media management, business strategy, trainings, and internships.

Services:
- Software Solutions: custom frontend/backend systems, APIs, cloud integration, observability, CI/CD, secure architecture. Link: ${BASE}/services/software-solutions
- Digital Marketing: SEO, paid ads, audience research, campaign strategy, analytics, conversion optimization. Link: ${BASE}/services/digital-marketing
- Mobile & Web Development: responsive websites, progressive web apps, mobile strategy, integrations, payment systems, authentication. Link: ${BASE}/services/mobile-web-development
- Social Media Management: publishing calendars, creative direction, audience growth, influencer partnerships, reputation management. Link: ${BASE}/services/social-media-management
- Business Strategy: market positioning, product strategy, digital transformation planning, revenue models, process optimization. Link: ${BASE}/services/business-strategy

Training programs:
- Frontend Development, Backend Development, UI/UX Design, Full-Stack Engineering, Digital Marketing, Mobile Development, Desktop App Development.
- Crash courses: Graphics Design, Microsoft Excel, Microsoft Office.
- Training durations vary by program and include options such as 1-4 week crash courses and 3, 6, or 12 month programs.
- Send training questions to ${BASE}/trainings and enrollment requests to ${BASE}/trainings/enroll.
`.trim();

const PAGES_TO_SCRAPE: { label: string; url: string }[] = [
  { label: "Home", url: `${BASE}` },
  { label: "About", url: `${BASE}/about` },
  { label: "Services", url: `${BASE}/services` },
  { label: "Software Solutions", url: `${BASE}/services/software-solutions` },
  { label: "Digital Marketing", url: `${BASE}/services/digital-marketing` },
  {
    label: "Mobile & Web Development",
    url: `${BASE}/services/mobile-web-development`,
  },
  {
    label: "Social Media Management",
    url: `${BASE}/services/social-media-management`,
  },
  { label: "Business Strategy", url: `${BASE}/services/business-strategy` },
  { label: "Projects", url: `${BASE}/projects` },
  { label: "Contact", url: `${BASE}/contact` },
  { label: "Trainings", url: `${BASE}/trainings` },
  { label: "Internships", url: `${BASE}/trainings/internships` },
  { label: "Training Enrollment", url: `${BASE}/trainings/enroll` },
  { label: "Privacy", url: `${BASE}/privacy` },
  { label: "Terms", url: `${BASE}/terms` },
];

// ── In-memory cache (resets on server restart) ─────────────────────────────────

let cachedContext: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getSiteContext(): Promise<string> {
  const now = Date.now();
  if (cachedContext && now - cacheTimestamp < CACHE_TTL) {
    return cachedContext;
  }

  const results = await Promise.all(
    PAGES_TO_SCRAPE.map(async ({ label, url }) => {
      const text = await scrapePageText(url);
      return text
        ? `\n== ${label.toUpperCase()} PAGE (${url}) ==\n${text}`
        : "";
    }),
  );

  const scrapedContext = results.filter(Boolean).join("\n");
  cachedContext = `${SITE_KNOWLEDGE}\n\n${scrapedContext}`.trim();
  cacheTimestamp = now;
  return cachedContext;
}

function normalizeReply(reply: string): string {
  return reply.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1: $2");
}

// ── API Route ──────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { message, history = [] } = await req.json();

  if (!message) {
    return NextResponse.json(
      { reply: "No message provided." },
      { status: 400 },
    );
  }

  const siteContent = await getSiteContext();

  const systemPrompt = `
You are UnicomTeam Assistant, the official AI assistant for UnicomTeam.com.
You are friendly, concise, professional, and warmly human. Sound like a helpful customer-service representative, not a search result.

Use the website content below for facts about UnicomTeam. You may also answer simple general questions about technology, programming, design, marketing, business, internships, and learning paths when they are related to UnicomTeam services or trainings.
- For related general questions, answer the question first in simple beginner-friendly language, then connect it naturally to the relevant UnicomTeam service or training page.
- Example: if asked "what is programming?", explain that programming is writing instructions a computer can follow to build websites, apps, automations, and software. Then invite them to explore training at ${BASE}/trainings or software services at ${BASE}/services/software-solutions.
- For questions unrelated to UnicomTeam's work, politely redirect to UnicomTeam services, trainings, or contact.
- If asked for contact info, phone numbers, emails, social media, or location, share the official details directly.
- Always include the most relevant clickable URL when directing someone to a page.
- For service questions, briefly explain the service and link to the matching service page.
- For project or portfolio questions, link to ${BASE}/projects.
- For training questions, link to ${BASE}/trainings. For enrollment, link to ${BASE}/trainings/enroll.
- For pricing, quotes, timelines, or custom project scope, explain that pricing depends on the work and invite them to contact UnicomTeam at ${BASE}/contact, contact@unicomteam.com, or +237 681 529 488.
- If a visitor seems ready to buy, enroll, book, or start, ask for the most useful next detail: their name, email/phone, project type, budget, timeline, or preferred course.
- If the answer is not found in the provided content, say: "For the most accurate info, please reach out via the Contact page: ${BASE}/contact"
- Never make up or assume information not present in the content.
- Keep responses short, clear, and helpful: usually 2-5 sentences.
- When listing multiple items, use short bullet points.
- Do not use markdown link syntax like [text](url). Write full URLs in plain text so the chat can make them clickable.

WEBSITE CONTENT:
${siteContent}
`.trim();

  // Build messages: include last 10 turns of history for context
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10),
    { role: "user", content: message },
  ];

  const response = await fetch(
    `${process.env.AZURE_OPENAI_ENDPOINT}/openai/v1/responses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_KEY!,
      },
      body: JSON.stringify({
        input: messages,
        model: process.env.AZURE_OPENAI_DEPLOYMENT,
        max_output_tokens: 500,
      }),
    },
  );

  if (!response.ok) {
    return NextResponse.json({
      reply:
        "I could not reach the assistant service right now. You can still contact UnicomTeam at contact@unicomteam.com, +237 681 529 488, or https://unicomteam.com/contact",
    });
  }

  const data = await response.json();
  const reply =
    data.output?.[0]?.content?.[0]?.text ??
    "I couldn't generate a response. Please try again.";

  return NextResponse.json({ reply: normalizeReply(reply) });
}
