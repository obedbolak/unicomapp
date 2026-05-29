// components/AIAssistant.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext"; // Updated import path
import type {
  DialogflowResponse,
  DialogflowError,
} from "../types/dialogflow-comprehensive";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  typing?: boolean;
  intent?: string;
  confidence?: number;
}

interface QuickAction {
  label: string;
  message: string;
  icon: string;
}

export default function AIAssistant() {
  const { colors, isDark } = useTheme();

  // Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Map context colors to component theme structure
  const theme = mounted
    ? {
        bg: isDark
          ? "from-gray-950 via-black to-gray-950"
          : "from-amber-50 via-orange-50 to-yellow-50",
        text: colors.text.primary,
        textSecondary: colors.text.secondary,
        textMuted: colors.text.muted,
        accent: colors.text.accent,
        card: colors.card.background,
        cardHover: isDark
          ? "hover:shadow-amber-500/30 hover:border-amber-400/40"
          : "hover:shadow-amber-500/30 hover:border-orange-400/50",
        button: colors.form.button,
      }
    : {
        // Default theme for server-side rendering
        bg: "from-gray-950 via-black to-gray-950",
        text: "text-white",
        textSecondary: "text-white/90",
        textMuted: "text-white/70",
        accent: "text-amber-300",
        card: "bg-gray-900/90 backdrop-blur-lg border-amber-500/20",
        cardHover: "hover:shadow-amber-500/30 hover:border-amber-400/40",
        button:
          "from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500",
      };

  // Quick action buttons - updated for Unicom Team context
  const quickActions: QuickAction[] = [
    {
      label: "Services",
      message: "Tell me about your web development and mobile app services",
      icon: "💼",
    },
    {
      label: "Portfolio",
      message: "Show me some of your recent projects and work",
      icon: "🎨",
    },
    {
      label: "Pricing",
      message: "What are your pricing and packages for web development?",
      icon: "💰",
    },
    {
      label: "Team",
      message: "Tell me about your team and expertise",
      icon: "👥",
    },
    {
      label: "Contact",
      message: "How can I get in touch to start a project?",
      icon: "📞",
    },
  ];

  // Generate session ID on component mount
  useEffect(() => {
    if (!sessionId && mounted) {
      const newSessionId = `unicom-session-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setSessionId(newSessionId);
    }
  }, [sessionId, mounted]);

  // Initial greeting message
  useEffect(() => {
    if (messages.length === 0 && mounted) {
      const greeting = {
        id: "greeting",
        content: `Hi there! 👋 I'm your Unicom Team AI Assistant. I can help you learn about our digital services including web development, mobile apps, UI/UX design, and custom solutions. We've successfully delivered 150+ projects and helped 80+ clients transform their ideas into digital reality. How can I assist you today?`,
        sender: "ai" as const,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [messages.length, mounted]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Updated sendMessage function for Unicom Team context
  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageContent.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: "typing",
      content: "AI is thinking...",
      sender: "ai",
      timestamp: new Date(),
      typing: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      // Use Dialogflow API with Unicom Team context
      const response = await fetch("/api/dialogflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          sessionId: sessionId,
          context: "unicom-team", // Add context identifier
        }),
      });

      const data: DialogflowResponse | DialogflowError = await response.json();

      if (!response.ok) {
        const errorData = data as DialogflowError;
        throw new Error(errorData.error || "Failed to get response from AI");
      }

      const dialogflowResponse = data as DialogflowResponse;

      // Remove typing and add response
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => m.id !== "typing");
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content:
            dialogflowResponse.response ||
            "I'm sorry, I couldn't process that request. Please feel free to contact us directly at contact@unicomteam.com for immediate assistance.",
          sender: "ai",
          timestamp: new Date(),
          intent: dialogflowResponse.intent,
          confidence: dialogflowResponse.confidence,
        };
        return [...withoutTyping, aiResponse];
      });

      // Log intent and confidence for debugging
      if (dialogflowResponse.intent) {
        console.log("Dialogflow Intent:", dialogflowResponse.intent);
        console.log("Confidence:", dialogflowResponse.confidence);
      }
      if (
        dialogflowResponse.parameters &&
        Object.keys(dialogflowResponse.parameters).length > 0
      ) {
        console.log("Dialogflow Parameters:", dialogflowResponse.parameters);
      }
    } catch (error) {
      console.error("Dialogflow Error:", error);

      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => m.id !== "typing");
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content:
            "I'm having trouble connecting right now. Please try again in a moment, or feel free to contact us directly at contact@unicomteam.com or +1 (555) 123-4567.",
          sender: "ai",
          timestamp: new Date(),
        };
        return [...withoutTyping, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    const newSessionId = `unicom-session-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setSessionId(newSessionId);

    setTimeout(() => {
      const greeting = {
        id: "greeting-new",
        content: `Chat cleared! How can I help you today with Unicom Team's digital services? Whether you need web development, mobile apps, or custom solutions, I'm here to assist! 🚀`,
        sender: "ai" as const,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }, 100);
  };

  return (
    <>
      {/* AI Assistant Button - Updated with Unicom Team styling */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r ${theme.button} text-white shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transform hover:scale-110 transition-all duration-300 flex items-center justify-center group`}
          aria-label="Open Unicom AI Assistant"
        >
          <svg
            className="w-7 h-7 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>

          {/* Pulsing indicator */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </button>
      )}

      {/* AI Assistant Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] ${
            isMinimized ? "h-16" : "h-[600px] max-h-[calc(100vh-3rem)]"
          } ${
            theme.card
          } border rounded-2xl shadow-2xl backdrop-blur-lg transition-all duration-300 flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div
            className={`p-4 border-b ${
              isDark ? "border-amber-500/20" : "border-amber-300/60"
            } flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-orange-600/10`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className={`font-semibold ${theme.text} text-sm`}>
                  Unicom AI Assistant
                </h3>
                <p className={`text-xs ${theme.textMuted}`}>
                  Digital Solutions Expert
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className={`p-1.5 rounded-lg hover:bg-amber-500/20 transition-colors ${theme.textSecondary}`}
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                  />
                </svg>
              </button>

              <button
                onClick={clearChat}
                className={`p-1.5 rounded-lg hover:bg-amber-500/20 transition-colors ${theme.textSecondary}`}
                aria-label="Clear chat"
                title="Clear chat"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg hover:bg-amber-500/20 transition-colors ${theme.textSecondary}`}
                aria-label="Close"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.sender === "user"
                          ? `bg-gradient-to-r ${theme.button} text-white`
                          : `${
                              isDark ? "bg-gray-800/90" : "bg-amber-50/90"
                            } border ${
                              isDark
                                ? "border-amber-500/20"
                                : "border-amber-300/60"
                            } ${theme.text}`
                      } ${
                        message.typing ? "animate-pulse" : ""
                      } backdrop-blur-sm`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p
                          className={`text-xs ${
                            message.sender === "user"
                              ? "text-white/70"
                              : theme.textMuted
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {/* Show intent and confidence for debugging */}
                        {message.intent &&
                          process.env.NODE_ENV === "development" && (
                            <p className={`text-xs opacity-50 italic`}>
                              {message.intent} (
                              {message.confidence
                                ? Math.round(message.confidence * 100)
                                : 0}
                              %)
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div
                  className={`p-4 border-t ${
                    isDark ? "border-amber-500/20" : "border-amber-300/60"
                  }`}
                >
                  <p className={`text-xs ${theme.textMuted} mb-3`}>
                    Quick actions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleQuickAction(action)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                          isDark
                            ? "bg-gray-800/50 hover:bg-gray-700/50"
                            : "bg-amber-50/50 hover:bg-amber-100/50"
                        } border ${
                          isDark
                            ? "border-amber-500/20 hover:border-amber-400/30"
                            : "border-amber-300/60 hover:border-amber-400/30"
                        } transition-all text-xs ${theme.textSecondary} hover:${
                          theme.text
                        }`}
                        disabled={isLoading}
                      >
                        <span className="text-sm">{action.icon}</span>
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div
                className={`p-4 border-t ${
                  isDark ? "border-amber-500/20" : "border-amber-300/60"
                }`}
              >
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about our web development, mobile apps, or custom solutions..."
                    disabled={isLoading}
                    className={`flex-1 px-4 py-3 rounded-lg ${
                      colors.form.background
                    } border ${
                      isDark ? "border-amber-500/20" : "border-amber-300/60"
                    } ${theme.text} ${
                      isDark ? "placeholder-white/50" : "placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-amber-500/60 text-sm disabled:opacity-50 transition-all duration-200`}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={`px-4 py-3 bg-gradient-to-r ${theme.button} text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 duration-200`}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    )}
                  </button>
                </form>

                <p className={`text-xs ${theme.textMuted} mt-2 text-center`}>
                  Powered by Unicom Team • Session: {sessionId.slice(-8)}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
