"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { conciergeAPI } from "@/lib/api";
import type { ConciergeSession } from "@/lib/concierge-types";

const GUEST_KEY = "xoxo_concierge_guest";
const SESSION_KEY = "xoxo_concierge_session";

export function useConcierge() {
  const [session, setSession] = useState<ConciergeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([]);
  const streamBuffer = useRef("");

  const init = useCallback(async () => {
    setLoading(true);
    try {
      const { data: p } = await conciergeAPI.prompts();
      setPrompts(p.data || []);

      const savedId = localStorage.getItem(SESSION_KEY);
      if (savedId) {
        try {
          const { data } = await conciergeAPI.getSession(savedId);
          setSession(data.data);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      }

      const { data } = await conciergeAPI.createSession();
      if (data.guestId) localStorage.setItem(GUEST_KEY, data.guestId);
      localStorage.setItem(SESSION_KEY, data.data.id);
      setSession(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const send = useCallback(
    async (message: string) => {
      if (!session?.id || !message.trim()) return;
      setSending(true);
      setStreaming(true);
      streamBuffer.current = "";

      const userMsg = { role: "user" as const, content: message.trim() };
      setSession((s) =>
        s ? { ...s, messages: [...s.messages, userMsg, { role: "assistant", content: "" }] } : s
      );

      try {
        await conciergeAPI.streamMessage(
          session.id,
          message.trim(),
          (token) => {
            streamBuffer.current += token;
            setSession((s) => {
              if (!s) return s;
              const msgs = [...s.messages];
              const last = msgs[msgs.length - 1];
              if (last?.role === "assistant") {
                msgs[msgs.length - 1] = { ...last, content: streamBuffer.current };
              }
              return { ...s, messages: msgs };
            });
          },
          (updated) => {
            setSession(updated);
            localStorage.setItem(SESSION_KEY, updated.id);
          }
        );
      } catch {
        const { data } = await conciergeAPI.sendMessage(session.id, message.trim());
        setSession(data.data);
      } finally {
        setSending(false);
        setStreaming(false);
      }
    },
    [session?.id]
  );

  const newSession = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    await init();
  }, [init]);

  return { session, loading, sending, streaming, prompts, send, newSession };
}
