// app/api/dialogflow/route.ts
import { NextRequest, NextResponse } from "next/server";
import type {
  DialogflowRequest,
  DialogflowResponse,
  DialogflowError,
} from "../../types/dialogflow-comprehensive";
import {
  createSessionsClient,
  detectIntent,
  validateEnvironmentVariables,
} from "../../lib/dialogflow";

export async function POST(
  request: NextRequest
): Promise<NextResponse<DialogflowResponse | DialogflowError>> {
  try {
    const body: unknown = await request.json();

    // Type guard for request body
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          message: "Invalid request body",
          error: "Request body must be a valid JSON object",
        },
        { status: 400 }
      );
    }

    const { message, sessionId } = body as Record<string, unknown>;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          message: "Invalid request",
          error: "Message is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        {
          message: "Invalid request",
          error: "SessionId is required and must be a string",
        },
        { status: 400 }
      );
    }

    const requestData: DialogflowRequest = { message, sessionId };
    const { projectId } = validateEnvironmentVariables();
    const sessionClient = createSessionsClient();

    const dialogflowResponse = await detectIntent(
      sessionClient,
      projectId,
      requestData.sessionId,
      requestData.message
    );

    return NextResponse.json(dialogflowResponse);
  } catch (error: unknown) {
    console.error("Dialogflow error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    const errorResponse: DialogflowError = {
      message: "Error processing request",
      error: errorMessage,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse<{ message: string }>> {
  return NextResponse.json({ message: "Dialogflow API endpoint is working" });
}
