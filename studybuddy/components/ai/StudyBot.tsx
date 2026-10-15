// components/ai/StudyBot.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Bot, Loader2, Volume2, VolumeX, Sparkles,
  HelpCircle, ListOrdered, BookOpen, RotateCcw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  {
    icon: HelpCircle,
    label: "Explain simply",
    prompt: "Explain this concept in the simplest way possible with an analogy: ",
    placeholder: true,
  },
  {
    icon: ListOrdered,
    label: "3 Practice Questions",
    prompt: "Create 3 practice questions with detailed step-by-step solutions on: ",
    placeholder: true,
  },
  {
    icon: BookOpen,
    label: "Key Formulas",
    prompt: "List all the key formulas I need to know for: ",
    placeholder: true,
  },
  {
    icon: Sparkles,
    label: "Solve this",
    prompt: "Solve this problem step by step: ",
    placeholder: true,
  },
];

export default function StudyBot() {
  const { closeBot } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm **StudyBot** 👋 — your AI tutor powered by Gemini. I can explain concepts, create practice questions, list formulas, and solve problems. What would you like to learn today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [interactionId, setInteractionId] = useState<string | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, "").replace(/#+\s/g, "").replace(/[`\$]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const sendMessage = async (messageText: string) => {
    let text = messageText.trim();
    if (!text || loading) return;

    if (
      text.endsWith("on:") ||
      text.endsWith("on: ") ||
      text.endsWith("for:") ||
      text.endsWith("for: ")
    ) {
      text += " Mechanics & Calculus";
    }

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, previousInteractionId: interactionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setInteractionId(data.interactionId);

      const assistantMsg: Message = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speak(data.reply);
    } catch (err) {
      const errorMsg: Message = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: "Sorry, I encountered an error: " + (err instanceof Error ? err.message : "Unknown error") + ". Please check your connection or verify `GEMINI_API_KEY` in `.env.local`.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (qp: (typeof QUICK_PROMPTS)[0]) => {
    if (qp.placeholder) {
      setInput(qp.prompt);
      inputRef.current?.focus();
    } else {
      sendMessage(qp.prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "Chat cleared! What would you like to study?",
        timestamp: new Date(),
      },
    ]);
    setInteractionId(undefined);
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">StudyBot</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Powered by Gemini 3.8 Flash
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (ttsEnabled) window.speechSynthesis.cancel();
              setTtsEnabled(!ttsEnabled);
            }}
            className={cn(
              "rounded-lg p-2 transition",
              ttsEnabled
                ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            title={ttsEnabled ? "Disable voice" : "Enable voice (TTS)"}
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={clearChat}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Clear chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={closeBot}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-100 p-3 dark:border-slate-800">
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            onClick={() => handleQuickPrompt(qp)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition"
          >
            <qp.icon className="h-3 w-3" />
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "rounded-tr-sm bg-indigo-500 text-white"
                  : "rounded-tl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 shadow-sm"
              )}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none break-words">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
              <p className={cn(
                "mt-1.5 text-[10px]",
                msg.role === "user" ? "text-indigo-200" : "text-slate-400"
              )}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-700">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Shift+Enter for new line)"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-slate-400">
          StudyBot can make mistakes. Verify important information.
        </p>
      </div>
    </motion.div>
  );
}
