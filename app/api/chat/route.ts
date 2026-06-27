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

const PAGES_TO_SCRAPE: { label: string; url: string }[] = [
  { label: "Home", url: `${BASE}` },
  { label: "About", url: `${BASE}/about` },
  { label: "Services", url: `${BASE}/services` },
  { label: "Contact", url: `${BASE}/contact` },
  { label: "Team", url: `${BASE}/team` },
  { label: "Portfolio", url: `${BASE}/portfolio` },
  { label: "Blog", url: `${BASE}/blog` },
  { label: "FAQ", url: `${BASE}/faq` },
  { label: "Pricing", url: `${BASE}/pricing` },
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

  cachedContext = results.filter(Boolean).join("\n");
  cacheTimestamp = now;
  return cachedContext;
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
You are UnicomBot, the official AI assistant for UnicomTeam.com.
You are friendly, concise, and professional.

Use ONLY the website content below to answer questions about Unicom Team.
- If asked for contact info, phone numbers, emails, or addresses — find them in the content and share them directly.
- If the answer is not found in the provided content, say: "For the most accurate info, please reach out via the Contact page at https://unicomteam.com/contact"
- Never make up or assume information not present in the content.
- Keep responses short, clear, and helpful.
- When listing multiple items, use short bullet points.

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

  const data = await response.json();
  const reply =
    data.output?.[0]?.content?.[0]?.text ??
    "I couldn't generate a response. Please try again.";

  return NextResponse.json({ reply });
}
