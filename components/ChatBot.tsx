"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2 } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
}

const WELCOME: Message = {
  id: 0,
  role: "bot",
  text: "Hi! I'm UnicomBot 👋 How can I help you today?",
};

// ── Dialogflow connection ─────────────────────────────────────────────────
// Replace these with your actual Dialogflow ES credentials
const DIALOGFLOW_PROJECT_ID = "YOUR_PROJECT_ID";
const DIALOGFLOW_SESSION_ID  = Math.random().toString(36).slice(2);
const DIALOGFLOW_LANGUAGE    = "en";

async function sendToDialogflow(text: string): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        projectId: DIALOGFLOW_PROJECT_ID,
        sessionId: DIALOGFLOW_SESSION_ID,
        languageCode: DIALOGFLOW_LANGUAGE,
      }),
    });
    const data = await res.json();
    return data.reply ?? "I didn't catch that. Could you rephrase?";
  } catch {
    return "Something went wrong. Please try again.";
  }
}
// ─────────────────────────────────────────────────────────────────────────

export default function ChatBot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { id: Date.now(), role: "user", text }]);
    setLoading(true);
    const reply = await sendToDialogflow(text);
    setMessages((m) => [...m, { id: Date.now() + 1, role: "bot", text: reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: "fixed", bottom: "1.75rem", right: "1.75rem", zIndex: 100,
          width: "52px", height: "52px", borderRadius: "50%",
          background: "var(--color-primary)", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 4px 24px rgba(255,140,0,0.4)",
          color: "#000",
        }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={22} /></motion.span>
            : <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Bot size={22} /></motion.span>
          }
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
              position: "fixed", bottom: "5.5rem", right: "1.75rem", zIndex: 100,
              width: "clamp(300px, 90vw, 360px)",
              borderRadius: "1.25rem",
              background: "rgba(0,8,20,0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: "0.75rem",
            }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "rgba(255,140,0,0.15)", border: "1px solid rgba(255,140,0,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--color-primary)", flexShrink: 0,
              }}>
                <Bot size={16} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text)", margin: 0 }}>
                  UnicomBot
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.6875rem", color: "var(--color-text-muted)", margin: 0, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                  Online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "1rem",
              display: "flex", flexDirection: "column", gap: "0.75rem",
              maxHeight: "320px", scrollbarWidth: "none",
            }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{
                    maxWidth: "80%",
                    padding: "0.6rem 0.875rem",
                    borderRadius: msg.role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                    background: msg.role === "user" ? "var(--color-primary)" : "rgba(255,255,255,0.06)",
                    color: msg.role === "user" ? "#000" : "var(--color-text)",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.8125rem",
                    lineHeight: 1.5,
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{
                    padding: "0.6rem 0.875rem", borderRadius: "1rem 1rem 1rem 0.25rem",
                    background: "rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    color: "var(--color-text-muted)",
                  }}>
                    <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.8125rem" }}>Typing…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: "0.75rem 1rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", gap: "0.5rem", alignItems: "center",
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message…"
                style={{
                  flex: 1, background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.625rem",
                  padding: "0.55rem 0.875rem", color: "var(--color-text)",
                  fontFamily: "var(--font-display)", fontSize: "0.8125rem",
                  outline: "none",
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                style={{
                  width: "36px", height: "36px", borderRadius: "0.625rem", flexShrink: 0,
                  background: input.trim() && !loading ? "var(--color-primary)" : "rgba(255,255,255,0.06)",
                  border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: input.trim() && !loading ? "#000" : "var(--color-text-dim)",
                  transition: "background 0.2s",
                }}
              >
                <Send size={15} />
              </button>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
