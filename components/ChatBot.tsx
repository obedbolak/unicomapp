"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot } from "lucide-react";

/** Milliseconds between revealed word chunks when the bot "types". */
const TYPE_INTERVAL_MS = 24;

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
}

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Message = {
  id: 0,
  role: "bot",
  text: "Hi! I'm UnicomTeam Assistant 👋 How can I help you today?",
};

async function sendMessage(
  text: string,
  history: ConversationTurn[],
): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history }),
    });
    const data = await res.json();
    return data.reply ?? "I didn't catch that. Could you rephrase?";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

function renderMessageText(text: string): ReactNode[] {
  const linkPattern =
    /(https?:\/\/[^\s]+|mailto:[^\s]+|tel:\+?[0-9]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\+\d[\d\s-]{7,}\d)/gi;
  const linkTest =
    /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:\+?[0-9]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\+\d[\d\s-]{7,}\d)$/i;

  return text.split(linkPattern).map((part, index) => {
    if (!linkTest.test(part)) return part;

    const trailingPunctuation = part.match(/[.,!?)]$/)?.[0] ?? "";
    const value = trailingPunctuation ? part.slice(0, -1) : part;
    const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
    const isPhone = /^\+\d[\d\s-]{7,}\d$/.test(value);
    const href = isEmail
      ? `mailto:${value}`
      : isPhone
        ? `tel:${value.replace(/[^\d+]/g, "")}`
        : value;
    const label = href.startsWith("mailto:")
      ? href.replace("mailto:", "")
      : href.startsWith("tel:")
        ? value.replace("tel:", "")
        : href;

    return (
      <span key={`${href}-${index}`}>
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          style={{
            color: "inherit",
            fontWeight: 700,
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            overflowWrap: "anywhere",
          }}
        >
          {label}
        </a>
        {trailingPunctuation}
      </span>
    );
  });
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  /** True while a reply is being revealed word by word. */
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build Anthropic-format history from messages (excluding the welcome message)
  const buildHistory = (msgs: Message[]): ConversationTurn[] =>
    msgs
      .filter((m) => m.id !== 0)
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Never leave a timer running after the widget unmounts.
  useEffect(() => {
    return () => {
      if (typeTimer.current) clearTimeout(typeTimer.current);
    };
  }, []);

  const stopTyping = () => {
    if (typeTimer.current) clearTimeout(typeTimer.current);
    typeTimer.current = null;
    setTyping(false);
  };

  /**
   * Reveals `full` into the message with `id`, a word at a time.
   *
   * Word chunks rather than characters: partial URLs would otherwise flicker
   * through renderMessageText as half-formed links, and per-character updates
   * re-render the list far more often for no visible gain.
   */
  const typeOut = (id: number, full: string) =>
    new Promise<void>((resolve) => {
      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reducedMotion) {
        setMessages((m) =>
          m.map((msg) => (msg.id === id ? { ...msg, text: full } : msg)),
        );
        resolve();
        return;
      }

      // Keep the separators so whitespace is preserved exactly.
      const chunks = full.split(/(\s+)/);
      let i = 0;

      const step = () => {
        i += 1;
        const shown = chunks.slice(0, i).join("");
        setMessages((m) =>
          m.map((msg) => (msg.id === id ? { ...msg, text: shown } : msg)),
        );

        if (i >= chunks.length) {
          typeTimer.current = null;
          setTyping(false);
          resolve();
          return;
        }
        typeTimer.current = setTimeout(step, TYPE_INTERVAL_MS);
      };

      setTyping(true);
      step();
    });

  const send = async () => {
    const text = input.trim();
    if (!text || loading || typing) return;

    setInput("");

    const userMessage: Message = { id: Date.now(), role: "user", text };
    setMessages((m) => [...m, userMessage]);
    setLoading(true);

    // Pass conversation history (excluding the new user message, which is sent separately)
    const history = buildHistory(messages);
    const reply = await sendMessage(text, history);

    // Drop the dots, then type the answer into an initially empty bubble.
    const replyId = Date.now() + 1;
    setLoading(false);
    setMessages((m) => [...m, { id: replyId, role: "bot", text: "" }]);
    await typeOut(replyId, reply);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: "fixed",
          bottom: "clamp(0.875rem, 4vw, 1.75rem)",
          right: "clamp(0.875rem, 4vw, 1.75rem)",
          zIndex: 100,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "var(--color-primary)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(255,140,0,0.4)",
          color: "#000",
        }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Bot size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              bottom: "calc(clamp(0.875rem, 4vw, 1.75rem) + 4rem)",
              right: "clamp(0.5rem, 4vw, 1.75rem)",
              left: "auto",
              zIndex: 100,
              width:
                "min(360px, calc(100vw - (clamp(0.5rem, 4vw, 1.75rem) * 2)))",
              borderRadius: "1.25rem",
              background: "rgba(0,8,20,0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(255,140,0,0.15)",
                  border: "1px solid rgba(255,140,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-primary)",
                  flexShrink: 0,
                }}
              >
                <Bot size={16} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "var(--color-text)",
                    margin: 0,
                  }}
                >
                  UT Assistant
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6875rem",
                    color: "var(--color-text-muted)",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      display: "inline-block",
                    }}
                  />
                  Online
                </p>
              </div>

              {/* Clear chat button */}
              <button
                onClick={() => {
                  stopTyping();
                  setMessages([WELCOME]);
                }}
                title="Clear chat"
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  fontSize: "0.65rem",
                  fontFamily: "var(--font-display)",
                  opacity: 0.6,
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                Clear
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                maxHeight: "320px",
                scrollbarWidth: "none",
              }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    className={
                      typing &&
                      msg.role === "bot" &&
                      i === messages.length - 1
                        ? "chat-caret"
                        : undefined
                    }
                    style={{
                      maxWidth: "80%",
                      padding: "0.6rem 0.875rem",
                      borderRadius:
                        msg.role === "user"
                          ? "1rem 1rem 0.25rem 1rem"
                          : "1rem 1rem 1rem 0.25rem",
                      background:
                        msg.role === "user"
                          ? "var(--color-primary)"
                          : "rgba(255,255,255,0.06)",
                      color: msg.role === "user" ? "#000" : "var(--color-text)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8125rem",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {renderMessageText(msg.text)}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: "flex", justifyContent: "flex-start" }}
                >
                  <div
                    className="chat-typing"
                    aria-label="Assistant is typing"
                    role="status"
                  >
                    <span className="chat-dot" />
                    <span className="chat-dot" />
                    <span className="chat-dot" />
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: "0.75rem clamp(0.75rem, 3.5vw, 1rem)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: "clamp(0.375rem, 2vw, 0.5rem)",
                alignItems: "center",
                width: "100%",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={typing}
                placeholder="Type a message…"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: "42px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.625rem",
                  padding: "0 0.875rem",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading || typing}
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "0.625rem",
                  flexShrink: 0,
                  background:
                    input.trim() && !loading && !typing
                      ? "var(--color-primary)"
                      : "rgba(255,255,255,0.06)",
                  border: "none",
                  cursor:
                    input.trim() && !loading && !typing ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color:
                    input.trim() && !loading && !typing
                      ? "#000"
                      : "var(--color-text-dim)",
                  transition: "background 0.2s",
                }}
              >
                <Send size={15} />
              </button>
            </div>

            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }

              /* Three dots easing up and back down, staggered by 160ms — the
                 same cadence as a messaging app's "is typing" bubble. */
              .chat-typing {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 0.75rem 0.9rem;
                border-radius: 1rem 1rem 1rem 0.25rem;
                background: rgba(255, 255, 255, 0.06);
              }

              .chat-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: var(--color-text-muted);
                animation: chatDot 1.2s ease-in-out infinite;
              }

              .chat-dot:nth-child(2) { animation-delay: 0.16s; }
              .chat-dot:nth-child(3) { animation-delay: 0.32s; }

              @keyframes chatDot {
                0%, 60%, 100% {
                  transform: translateY(0);
                  opacity: 0.35;
                }
                30% {
                  transform: translateY(-4px);
                  opacity: 1;
                }
              }

              /* Blinking caret on the bubble currently being typed into. */
              .chat-caret::after {
                content: "";
                display: inline-block;
                width: 2px;
                height: 0.85em;
                margin-left: 2px;
                vertical-align: text-bottom;
                background: var(--color-primary);
                animation: chatCaret 0.9s steps(1) infinite;
              }

              @keyframes chatCaret {
                0%, 50% { opacity: 1; }
                50.01%, 100% { opacity: 0; }
              }

              @media (prefers-reduced-motion: reduce) {
                .chat-dot,
                .chat-caret::after {
                  animation: none;
                }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
