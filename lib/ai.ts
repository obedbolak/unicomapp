// lib/ai.ts
// Provider-agnostic chat completion with automatic failover.
//
// Every free AI tier has a hard daily cap. A customer-facing bot that stops
// answering at request 51 is worse than no bot, so instead of binding to one
// provider we try them in order and fall through on failure. Configure as many
// as you like — whichever have keys are used.
//
// Pick the first choice with AI_PROVIDER=groq|gemini|openrouter.
// Everything else that has a key becomes a fallback, in the order listed below.

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ProviderName = "groq" | "groq-lite" | "gemini" | "openrouter";

type Provider = {
  name: ProviderName;
  /** Only attempted when this returns true. */
  configured: () => boolean;
  complete: (messages: ChatMessage[], maxTokens: number) => Promise<string>;
};

/** Shared shape for every OpenAI-compatible endpoint (Groq, OpenRouter, …). */
async function openAiCompatible(opts: {
  url: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  maxTokens: number;
  extraHeaders?: Record<string, string>;
}): Promise<string> {
  const res = await fetch(opts.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
      ...opts.extraHeaders,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      max_tokens: opts.maxTokens,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text().catch(() => "")}`.trim());
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content;
  if (!reply) throw new Error("Empty completion");
  return reply as string;
}

const PROVIDERS: Provider[] = [
  /* ── Groq — 30 req/min, ~1,000/day, no card. Fastest of the free tiers,
       and the primary provider now that Azure is gone. ── */
  {
    name: "groq",
    configured: () => !!process.env.GROQ_API_KEY,
    complete: (messages, maxTokens) =>
      openAiCompatible({
        url: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: process.env.GROQ_API_KEY!,
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        messages,
        maxTokens,
      }),
  },

  /* ── Groq, smaller model — same key, but llama-3.1-8b-instant has a much
       higher rate limit. Catches the case where the 70B model is throttled
       mid-conversation; a faster, slightly weaker answer beats none. ── */
  {
    name: "groq-lite",
    configured: () => !!process.env.GROQ_API_KEY,
    complete: (messages, maxTokens) =>
      openAiCompatible({
        url: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: process.env.GROQ_API_KEY!,
        model: process.env.GROQ_FALLBACK_MODEL ?? "llama-3.1-8b-instant",
        messages,
        maxTokens,
      }),
  },

  /* ── Google Gemini — generous context, but note that outside the EU/UK/EEA
       Google may use free-tier prompts to improve its models. Keep that in
       mind for a bot that collects names, emails and budgets. ── */
  {
    name: "gemini",
    configured: () => !!process.env.GEMINI_API_KEY,
    complete: async (messages, maxTokens) => {
      const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

      // Gemini splits the system prompt out and calls the assistant "model".
      const system = messages.find((m) => m.role === "system")?.content;
      const contents = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY!,
          },
          body: JSON.stringify({
            contents,
            ...(system
              ? { systemInstruction: { parts: [{ text: system }] } }
              : {}),
            generationConfig: {
              maxOutputTokens: maxTokens,
              temperature: 0.4,
            },
          }),
        },
      );

      if (!res.ok) {
        throw new Error(
          `${res.status} ${await res.text().catch(() => "")}`.trim(),
        );
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) throw new Error("Empty completion");
      return reply as string;
    },
  },

  /* ── OpenRouter — 20 req/min but only 50/day, so it sits below the others
       as a last-resort free option. ── */
  {
    name: "openrouter",
    configured: () => !!process.env.OPENROUTER_API_KEY,
    complete: (messages, maxTokens) =>
      openAiCompatible({
        url: "https://openrouter.ai/api/v1/chat/completions",
        apiKey: process.env.OPENROUTER_API_KEY!,
        model:
          process.env.OPENROUTER_MODEL ??
          "meta-llama/llama-3.3-70b-instruct:free",
        messages,
        maxTokens,
        extraHeaders: {
          // OpenRouter attributes traffic with these.
          "HTTP-Referer": "https://unicomteam.com",
          "X-Title": "UnicomTeam Assistant",
        },
      }),
  },

];

/** Preferred provider first, then every other configured one as a fallback. */
function providerChain(): Provider[] {
  const preferred = process.env.AI_PROVIDER as ProviderName | undefined;
  const configured = PROVIDERS.filter((p) => p.configured());

  if (!preferred) return configured;

  return [
    ...configured.filter((p) => p.name === preferred),
    ...configured.filter((p) => p.name !== preferred),
  ];
}

export type ChatResult = {
  /** null when every configured provider failed. */
  reply: string | null;
  /** Which provider actually answered — handy for debugging quota problems. */
  provider: ProviderName | null;
};

/**
 * Tries each configured provider in turn. Returns reply: null only when every
 * one failed, so the caller can serve its own fallback copy.
 */
export async function chatComplete(
  messages: ChatMessage[],
  maxTokens = 500,
): Promise<ChatResult> {
  const chain = providerChain();

  if (chain.length === 0) {
    console.error(
      "[ai] No provider configured. Set GROQ_API_KEY (or GEMINI_API_KEY / OPENROUTER_API_KEY) in .env",
    );
    return { reply: null, provider: null };
  }

  for (const provider of chain) {
    try {
      const reply = await provider.complete(messages, maxTokens);
      return { reply, provider: provider.name };
    } catch (err) {
      // Rate limits and quota exhaustion are expected on free tiers — log and
      // move to the next provider rather than failing the request.
      console.warn(
        `[ai] ${provider.name} failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  return { reply: null, provider: null };
}
