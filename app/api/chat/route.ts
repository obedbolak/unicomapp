import { NextRequest, NextResponse } from "next/server";
import { SessionsClient } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";

const rawCreds = process.env.GOOGLE_CREDENTIALS;
let parsedCreds: any | undefined;
try {
  parsedCreds = rawCreds ? JSON.parse(rawCreds) : undefined;
} catch (e) {
  console.error("Invalid GOOGLE_CREDENTIALS JSON:", e);
  parsedCreds = undefined;
}
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID || parsedCreds?.project_id;

let client: SessionsClient | undefined;
if (parsedCreds) {
  client = new SessionsClient({ credentials: parsedCreds });
}

export async function POST(req: NextRequest) {
  try {
    if (!client || !PROJECT_ID) {
      console.error(
        "Dialogflow not configured; client or project id missing.",
        {
          hasRawCreds: !!rawCreds,
          hasParsedCreds: !!parsedCreds,
          hasProjectId: !!PROJECT_ID,
        },
      );
      return NextResponse.json(
        {
          reply: "Chatbot is not configured yet.",
          configured: {
            hasRawCreds: !!rawCreds,
            hasParsedCreds: !!parsedCreds,
            hasProjectId: !!PROJECT_ID,
          },
        },
        { status: 500 },
      );
    }

    const { message, text, sessionId, languageCode } = await req.json();
    const input = message ?? text;
    if (!input) {
      return NextResponse.json(
        { reply: "No message provided." },
        { status: 400 },
      );
    }

    const session = sessionId || uuidv4();

    const sessionPath = client.projectAgentSessionPath(PROJECT_ID, session);

    const [response] = await client.detectIntent({
      session: sessionPath,
      queryInput: {
        text: {
          text: input,
          languageCode: languageCode ?? "en-US",
        },
      },
    });

    const reply =
      response.queryResult?.fulfillmentText ||
      "I didn't understand that. Can you rephrase?";

    return NextResponse.json({ reply, sessionId: session });
  } catch (err) {
    console.error("Dialogflow error:", err);
    return NextResponse.json(
      { error: "Failed to connect to Dialogflow" },
      { status: 500 },
    );
  }
}
