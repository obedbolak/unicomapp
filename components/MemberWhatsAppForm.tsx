"use client";

import { useId, useState, type FormEvent } from "react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { MAX_MESSAGE_LENGTH, buildWhatsAppUrl } from "@/lib/whatsapp";

type MemberWhatsAppFormProps = {
  memberName: string;
  /** WhatsApp number, digits only with country code. */
  number: string;
};

/**
 * Lets a visitor type a first message and send it through WhatsApp.
 * Nothing is sent to our servers: the form only builds a wa.me link and opens it.
 */
export default function MemberWhatsAppForm({ memberName, number }: MemberWhatsAppFormProps) {
  const id = useId();
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openedUrl, setOpenedUrl] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (message.trim().length < 5) {
      setError("Please write a short message first (at least a few words).");
      setOpenedUrl("");
      return;
    }

    const url = buildWhatsAppUrl({ number, memberName, senderName, message });
    if (!url) {
      setError("We couldn't prepare this WhatsApp link. Please use the contact page instead.");
      setOpenedUrl("");
      return;
    }

    setError("");
    setOpenedUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="member-wa-form" onSubmit={handleSubmit} noValidate>
      <div className="member-wa-field">
        <label htmlFor={`${id}-name`}>
          Your name <span>(optional)</span>
        </label>
        <input
          id={`${id}-name`}
          type="text"
          name="name"
          autoComplete="name"
          maxLength={60}
          value={senderName}
          onChange={(event) => setSenderName(event.target.value)}
          placeholder="How should we address you?"
        />
      </div>

      <div className="member-wa-field">
        <label htmlFor={`${id}-message`}>Your first message</label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          maxLength={MAX_MESSAGE_LENGTH}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            if (error) setError("");
          }}
          placeholder={`Hi ${memberName}, I'd like to talk about…`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
        />
        <div className="member-wa-meta">
          <span id={`${id}-hint`}>Opens WhatsApp with this message ready to send.</span>
          <span>
            {message.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </div>
      </div>

      {error && (
        <p id={`${id}-error`} className="member-wa-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="member-wa-cta member-wa-submit">
        <WhatsAppIcon />
        Send via WhatsApp
      </button>

      {openedUrl && (
        <p className="member-wa-fallback" role="status">
          WhatsApp should be opening now.{" "}
          <a href={openedUrl} target="_blank" rel="noopener noreferrer">
            Didn&apos;t open? Tap here.
          </a>
        </p>
      )}
    </form>
  );
}
