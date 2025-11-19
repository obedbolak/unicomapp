// utils/dialogflow.ts
import { SessionsClient } from "@google-cloud/dialogflow";
import type { protos } from "@google-cloud/dialogflow";
import type {
  DialogflowCredentials,
  DetectIntentRequest,
  DetectIntentResponseTuple,
  DialogflowResponse,
} from "../types/dialogflow";

export class DialogflowConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DialogflowConfigError";
  }
}

export function validateEnvironmentVariables(): {
  projectId: string;
  credentials: DialogflowCredentials | null;
  keyFilename: string | null;
} {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

  if (!projectId || typeof projectId !== "string") {
    throw new DialogflowConfigError(
      "GOOGLE_CLOUD_PROJECT_ID environment variable is required"
    );
  }

  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;

  let credentials: DialogflowCredentials | null = null;

  if (privateKey && clientEmail) {
    credentials = {
      private_key: privateKey.replace(/\\n/g, "\n"),
      client_email: clientEmail,
    };
  } else if (!keyFilename) {
    throw new DialogflowConfigError(
      "Either GOOGLE_APPLICATION_CREDENTIALS or both GOOGLE_CLOUD_PRIVATE_KEY and GOOGLE_CLOUD_CLIENT_EMAIL must be provided"
    );
  }

  return {
    projectId,
    credentials,
    keyFilename: keyFilename || null,
  };
}

export function createSessionsClient(): SessionsClient {
  const { projectId, credentials, keyFilename } =
    validateEnvironmentVariables();

  if (keyFilename) {
    return new SessionsClient({
      projectId,
      keyFilename,
    });
  } else if (credentials) {
    return new SessionsClient({
      projectId,
      credentials,
    });
  }

  throw new DialogflowConfigError("Unable to create SessionsClient");
}

export async function detectIntent(
  sessionClient: SessionsClient,
  projectId: string,
  sessionId: string,
  message: string,
  languageCode: string = "en-US"
): Promise<DialogflowResponse> {
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  const request: DetectIntentRequest = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode,
      },
    },
  };

  const [response]: DetectIntentResponseTuple =
    await sessionClient.detectIntent(request);
  const result:
    | protos.google.cloud.dialogflow.v2.IQueryResult
    | null
    | undefined = response.queryResult;

  return {
    response: result?.fulfillmentText || "No response received",
    intent: result?.intent?.displayName || "Unknown",
    confidence: result?.intentDetectionConfidence || 0,
    parameters: result?.parameters?.fields || {},
  };
}

export function generateSessionId(): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `session-${timestamp}-${randomString}`;
}

export function isDialogflowResponse(
  data: unknown
): data is DialogflowResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "response" in data &&
    "intent" in data &&
    "confidence" in data &&
    "parameters" in data &&
    typeof (data as Record<string, unknown>).response === "string" &&
    typeof (data as Record<string, unknown>).intent === "string" &&
    typeof (data as Record<string, unknown>).confidence === "number"
  );
}

export function isDialogflowError(
  data: unknown
): data is import("../types/dialogflow").DialogflowError {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    "error" in data &&
    typeof (data as Record<string, unknown>).message === "string" &&
    typeof (data as Record<string, unknown>).error === "string"
  );
}
