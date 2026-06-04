import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, projectId, sessionId, languageCode } = await req.json();

  try {
    // ── Dialogflow ES REST API ──────────────────────────────────────────
    // Requires a service account access token.
    // Set DIALOGFLOW_ACCESS_TOKEN in your .env.local
    // To generate: use Google Auth Library or service account JSON key.

    const accessToken = process.env.DIALOGFLOW_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json({ reply: "Chatbot is not configured yet." });
    }

    const url = `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        queryInput: {
          text: {
            text,
            languageCode: languageCode ?? "en",
          },
        },
      }),
    });

    const data = await response.json();
    const reply =
      data?.queryResult?.fulfillmentText ??
      "I'm not sure how to respond to that.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Dialogflow error:", err);
    return NextResponse.json({ reply: "Something went wrong. Please try again." });
  }
}
