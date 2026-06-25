"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import type { ConciergeMessage } from "@/lib/concierge-types";

interface ConciergeChatProps {
  messages: ConciergeMessage[];
  prompts: string[];
  sending: boolean;
  streaming: boolean;
  onSend: (text: string) => void;
}

export function ConciergeChat({ messages, prompts, sending, streaming, onSend }: ConciergeChatProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  return (
    <div className="flex flex-col h-full min-h-[420px] rounded-2xl border border-[#E8E8E8] bg-white shadow-elevated overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#EBEBEB] bg-gradient-to-r from-green-dark to-green-mid text-white">
        <Sparkles className="h-4 w-4 text-green-bright shrink-0" />
        <div>
          <p className="text-sm font-bold">XOXO Concierge</p>
          <p className="text-[11px] text-white/70">Natural language · live search · full trip planning</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.map((m, i) => (
          <div
            key={m._id || i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-green-dark text-white rounded-br-md"
                  : "bg-off-white text-text-dark border border-[#EBEBEB] rounded-bl-md"
              }`}
            >
              {m.content}
              {streaming && m.role === "assistant" && i === messages.length - 1 && !m.content && (
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-text-grey animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-grey animate-bounce [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-grey animate-bounce [animation-delay:0.3s]" />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {prompts.length > 0 && messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {prompts.slice(0, 3).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onSend(p)}
              className="text-left text-xs px-3 py-2 rounded-full border border-green-bright/40 bg-green-bright/10 text-green-dark hover:bg-green-bright/20 transition-colors"
            >
              {p.length > 52 ? `${p.slice(0, 52)}…` : p}
            </button>
          ))}
        </div>
      )}

      <form
        className="p-3 border-t border-[#EBEBEB] flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || sending) return;
          onSend(input);
          setInput("");
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your dream trip…"
          className="flex-1 rounded-full border border-[#E0E0E0] px-4 py-2.5 text-sm outline-none focus:border-green-bright"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="h-11 w-11 rounded-full bg-green-dark text-white flex items-center justify-center disabled:opacity-50 shrink-0"
          aria-label="Send"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
