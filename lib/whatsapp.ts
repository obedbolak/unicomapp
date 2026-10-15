export const MAX_MESSAGE_LENGTH = 1000;
const MAX_NAME_LENGTH = 60;

/**
 * Reduce a phone number to the digits wa.me expects (country code first, no "+").
 * Returns null when the result can't be a real international number.
 */
export function normalizeWhatsAppNumber(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

type MessageInput = {
  memberName: string;
  senderName?: string;
  message: string;
};

/** The text that will be pre-filled in the visitor's WhatsApp chat. */
export function buildWhatsAppMessage({ memberName, senderName, message }: MessageInput): string {
  const sender = (senderName ?? "").trim().slice(0, MAX_NAME_LENGTH);
  const body = message.trim().slice(0, MAX_MESSAGE_LENGTH);

  const lines = [`Hello ${memberName}, I found your profile on UnicomTeam.`, "", body];
  if (sender) lines.push("", `— ${sender}`);

  return lines.join("\n");
}

/** A wa.me link that opens a chat with `number` and the message already typed in. */
export function buildWhatsAppUrl(input: MessageInput & { number: string }): string | null {
  const number = normalizeWhatsAppNumber(input.number);
  if (!number || !input.message.trim()) return null;

  return `https://wa.me/${number}?text=${encodeURIComponent(buildWhatsAppMessage(input))}`;
}
