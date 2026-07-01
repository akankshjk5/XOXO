"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Minus, Maximize2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { aiAPI } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "I have ₹1.5 lakh",
  "Suggest honeymoon",
  "Need visa free",
  "Only beaches",
];

const GREETING =
  "Hi! I'm your XOXO AI concierge. Ask about budgets, honeymoons, visa-free trips, or beaches — I'll suggest packages, flights & hotels.";

const HIDE_ON = ["/login", "/signup", "/admin", "/concierge", "/chat", "/match"];

export function FloatingConcierge() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hidden = HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (hidden) return null;

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || typing) return;
    const history = [...messages, { role: "user" as const, content }];
    setMessages(history);
    setInput("");
    setTyping(true);
    try {
      const payload = history.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const { data } = await aiAPI.chatExpert(payload);
      const reply: string =
        data.message ||
        data.data?.message ||
        "I'd love to help! Open Concierge for a full personalized plan with flights & hotels.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      toast.error("Concierge busy — try again or open full planner.");
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 z-50 flex h-[min(420px,70vh)] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-2xl md:bottom-6"
            role="dialog"
            aria-label="AI Concierge chat"
          >
            <div className="flex items-center justify-between bg-green-dark px-4 py-3 text-white">
              <span className="flex items-center gap-2 font-semibold text-sm">
                <Sparkles className="h-4 w-4" aria-hidden /> AI Concierge
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => router.push("/concierge")}
                  className="rounded-lg p-1.5 hover:bg-white/10"
                  aria-label="Open full concierge"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-white/10"
                  aria-label="Minimize"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-3 py-2 max-w-[90%] ${
                    m.role === "user"
                      ? "ml-auto bg-green-dark text-white"
                      : "bg-off-white text-text-dark"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {typing && <p className="text-xs text-text-grey animate-pulse">Thinking…</p>}
              <div ref={bottomRef} />
            </div>
            <div className="flex flex-wrap gap-1 border-t border-[#EBEBEB] p-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="rounded-full bg-off-white px-2 py-1 text-[10px] font-medium text-text-grey hover:bg-green-dark/10"
                >
                  {p}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2 border-t border-[#EBEBEB] p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 rounded-xl border border-[#EBEBEB] px-3 py-2 text-sm outline-none focus:border-green-bright"
                aria-label="Message to concierge"
              />
              <button
                type="submit"
                disabled={typing}
                className="rounded-xl bg-green-neon p-2 text-white disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ai-fab fixed bottom-[calc(56px+env(safe-area-inset-bottom)+12px)] right-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-green-dark via-green-mid to-green-neon text-white shadow-lg hover:brightness-105 transition-all md:bottom-6 md:px-4 md:py-3 md:h-auto h-14 w-14 md:w-auto justify-center"
          aria-label="Open FREE AI Planner"
        >
          <Sparkles className="h-6 w-6 shrink-0" />
          <span className="hidden md:flex flex-col items-start leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-bright">✨ FREE AI</span>
            <span className="text-sm font-semibold whitespace-nowrap">AI Planner</span>
          </span>
        </button>
      )}
    </>
  );
}
