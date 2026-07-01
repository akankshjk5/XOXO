"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Minus, Maximize2, Plane } from "lucide-react";
import toast from "react-hot-toast";
import { aiAPI } from "@/lib/api";
import { getPageContextFromPath } from "@/lib/concierge-page-context";
import type { ConciergeIntent } from "@/lib/concierge-types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const SUGGESTIONS = [
  "Plan a Bali honeymoon 🌴",
  "Best family destination under ₹1L",
  "Visa-free destinations from India",
  "7-day Europe itinerary",
];

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Welcome — I'm your **XOXO Luxury Travel Concierge**. Tell me your budget, dates, and travel style, and I'll build a premium itinerary with hotels, flights, and curated XOXO packages.",
  ts: Date.now(),
};

export function PlanWithXOXO() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const intentMemory = useRef<Partial<ConciergeIntent>>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const magnet = (e: React.MouseEvent) => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  };
  const resetMagnet = () => {
    if (btnRef.current) btnRef.current.style.transform = "translate(0,0)";
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || typing) return;

    const userMsg: ChatMessage = { role: "user", content, ts: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setTyping(true);

    try {
      const payload = history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));
      const pageContext = getPageContextFromPath(pathname, searchParams);
      const { data } = await aiAPI.chatExpert(payload, {
        pageContext: pageContext || undefined,
        intentMemory: intentMemory.current,
      });
      if (data.intent) intentMemory.current = { ...intentMemory.current, ...data.intent };
      const reply: string = data.message || "Sorry, I didn't catch that. Could you rephrase?";

      // word-by-word reveal
      setTyping(false);
      const words = reply.split(" ");
      setMessages((m) => [...m, { role: "assistant", content: "", ts: Date.now() }]);
      for (let i = 0; i < words.length; i++) {
        await new Promise((res) => setTimeout(res, 22));
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: words.slice(0, i + 1).join(" "),
          };
          return copy;
        });
      }
    } catch {
      setTyping(false);
      toast.error("Couldn't reach Trippie. Please try again.");
    }
  };

  return (
    <>
      {/* Floating button (hidden while panel open) */}
      {!open && (
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen(true)}
          onMouseMove={magnet}
          onMouseLeave={resetMagnet}
          aria-label="Open Trippie AI chat"
          className="fixed bottom-[calc(52px+env(safe-area-inset-bottom)+12px)] md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-center magnetic animate-float group"
        >
          <span className="h-[72px] w-[72px] sm:h-20 sm:w-20 rounded-full bg-white border-[3px] border-green-bright flex items-center justify-center text-3xl animate-pulse-glow transition-transform duration-300 group-hover:scale-110">
            ✈️
          </span>
          <span className="mt-1.5 text-[11px] font-bold text-green-dark bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
            Plan with XOXO
          </span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[calc(52px+env(safe-area-inset-bottom)+8px)] md:bottom-4 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[360px] h-[min(70vh,520px)] sm:h-[480px] bg-white rounded-2xl shadow-2xl border border-[#EBEBEB] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-green-dark text-white shrink-0">
              <span className="h-9 w-9 rounded-full bg-green-bright/20 border border-green-bright flex items-center justify-center">
                <Plane className="h-4 w-4 text-green-bright" />
              </span>
              <div className="flex-1">
                <p className="font-bold text-[15px] leading-tight">XOXO AI · Trippie</p>
                <p className="text-[11px] text-white/70">Your travel concierge</p>
              </div>
              <button
                onClick={() => router.push("/concierge")}
                className="p-1.5 hover:bg-white/10 rounded-lg"
                aria-label="Open full AI trip planner"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg"
                aria-label="Minimize"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-off-white scrollbar-hide">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 text-[13.5px] leading-relaxed rounded-2xl ${
                      m.role === "user"
                        ? "bg-green-neon text-white rounded-br-sm"
                        : "bg-white text-text-dark shadow-sm border border-[#EBEBEB] rounded-bl-sm"
                    }`}
                  >
                    {m.content || "…"}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm border border-[#EBEBEB] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 rounded-full bg-text-grey/50 animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick suggestions only at start */}
              {messages.length === 1 && !typing && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-[12px] px-3 py-1.5 rounded-full border border-green-neon/40 text-green-dark bg-white hover:bg-green-bright/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 p-3 border-t border-[#EBEBEB] bg-white shrink-0"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Trippie anything…"
                className="flex-1 text-[14px] px-3 py-2.5 rounded-full bg-off-white border border-[#EBEBEB] outline-none focus:border-green-neon"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="h-10 w-10 rounded-full bg-green-neon text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 transition-transform"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
