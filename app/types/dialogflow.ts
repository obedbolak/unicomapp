// types/dialogflow.ts

export interface DialogflowRequest {
  message: string;
  sessionId: string;
}

export interface DialogflowResponse {
  response: string;
  intent: string;
  confidence: number;
  parameters: Record<string, unknown>;
}

export interface DialogflowError {
  message: string;
  error: string;
}

export interface ChatMessage {
  text: string;
  sender: "user" | "bot";
  intent?: string;
  confidence?: number;
  timestamp?: Date;
}

export interface DialogflowCredentials {
  private_key: string;
  client_email: string;
}

export interface EnvironmentVariables {
  GOOGLE_CLOUD_PROJECT_ID: string;
  GOOGLE_APPLICATION_CREDENTIALS?: string;
  GOOGLE_CLOUD_PRIVATE_KEY?: string;
  GOOGLE_CLOUD_CLIENT_EMAIL?: string;
}

// Extended NextApiRequest type for Pages Router
export interface DialogflowApiRequest {
  method: string;
  body: DialogflowRequest;
}

// Import actual types from Google Cloud Dialogflow
import type { protos } from "@google-cloud/dialogflow";

// Re-export for convenience with proper typing
export type DetectIntentRequest =
  protos.google.cloud.dialogflow.v2.IDetectIntentRequest;
export type DetectIntentResponse =
  protos.google.cloud.dialogflow.v2.IDetectIntentResponse;
export type QueryResult = protos.google.cloud.dialogflow.v2.IQueryResult;
export type Intent = protos.google.cloud.dialogflow.v2.IIntent;

// Tuple type for detectIntent response
export type DetectIntentResponseTuple = [
  protos.google.cloud.dialogflow.v2.IDetectIntentResponse,
  protos.google.cloud.dialogflow.v2.IDetectIntentRequest | undefined,
  protos.google.rpc.IStatus | undefined
];
