// types/dialogflow-comprehensive.ts
import type { protos } from "@google-cloud/dialogflow";

// Google Cloud Dialogflow Types
export type GCDetectIntentRequest =
  protos.google.cloud.dialogflow.v2.IDetectIntentRequest;
export type GCDetectIntentResponse =
  protos.google.cloud.dialogflow.v2.IDetectIntentResponse;
export type GCQueryResult = protos.google.cloud.dialogflow.v2.IQueryResult;
export type GCIntent = protos.google.cloud.dialogflow.v2.IIntent;
export type GCTextInput = protos.google.cloud.dialogflow.v2.ITextInput;
export type GCQueryInput = protos.google.cloud.dialogflow.v2.IQueryInput;

// Response tuple from detectIntent method
export type DetectIntentResponseTuple = [
  GCDetectIntentResponse,
  GCDetectIntentRequest | undefined,
  GCQueryResult | undefined
];

// Application Types
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

export interface SessionsClientConfig {
  projectId: string;
  keyFilename?: string;
  credentials?: DialogflowCredentials;
}

// Type guards
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
    typeof (data as Record<string, unknown>).confidence === "number" &&
    typeof (data as Record<string, unknown>).parameters === "object"
  );
}

export function isDialogflowError(data: unknown): data is DialogflowError {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    "error" in data &&
    typeof (data as Record<string, unknown>).message === "string" &&
    typeof (data as Record<string, unknown>).error === "string"
  );
}

export function isChatMessage(data: unknown): data is ChatMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "text" in data &&
    "sender" in data &&
    typeof (data as Record<string, unknown>).text === "string" &&
    ((data as Record<string, unknown>).sender === "user" ||
      (data as Record<string, unknown>).sender === "bot")
  );
}
