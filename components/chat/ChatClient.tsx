"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { chatAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { getSocket, joinUserRoom } from "@/lib/socket";
import { EmptyState, LoadingSkeleton } from "@/components/motion";
import { EASE_OUT } from "@/lib/motion";

interface Msg {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt?: string;
}
interface Conversation {
  peerId: string;
  roomId: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  peer?: { _id?: string; name?: string; avatar?: string };
}

export function ChatClient() {
  const user = useAuthStore((s) => s.user);
  const params = useSearchParams();
  const initialPeer = params ? params.get("peer") : null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePeer, setActivePeer] = useState<string | null>(initialPeer);
  const [peerInfo, setPeerInfo] = useState<{ name?: string; avatar?: string } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const loadConversations = async () => {
    try {
      const { data } = await chatAPI.conversations();
      setConversations(data.data);
    } catch {
      /* ignore */
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadConversations();
    joinUserRoom(user._id);
  }, [user]);

  useEffect(() => {
    if (!activePeer) return;
    setLoading(true);
    (async () => {
      try {
        const { data } = await chatAPI.thread(activePeer);
        setMessages(data.data.messages);
        setRoomId(data.data.roomId);
        setPeerInfo(data.data.peer);
        getSocket().emit("joinRoom", data.data.roomId);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [activePeer]);

  useEffect(() => {
    const socket = getSocket();
    const onNew = (m: Msg) => {
      if (roomId && (m.sender === activePeer || m.receiver === activePeer)) {
        setMessages((prev) => {
          if (m._id && prev.some((x) => x._id === m._id)) return prev;
          return [...prev, m];
        });
        if (String(m.sender) !== String(user?._id)) {
          setLiveAnnouncement(`New message: ${m.content.slice(0, 80)}`);
        }
      }
      loadConversations();
    };
    socket.on("newMessage", onNew);
    return () => {
      socket.off("newMessage", onNew);
    };
  }, [roomId, activePeer, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !activePeer) return;
    const content = text.trim();
    setText("");
    try {
      const { data } = await chatAPI.send(activePeer, content);
      setMessages((prev) =>
        prev.some((x) => x._id === data.data._id) ? prev : [...prev, data.data]
      );
    } catch {
      setText(content);
    }
  };

  return (
    <div className="pt-[88px] container-x pb-8">
      <h1 className="text-2xl font-black text-text-dark mb-4 tracking-tight">Messages</h1>

      {/* Screen reader announcements for incoming messages */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-0 md:gap-4 border border-[#EBEBEB] rounded-2xl overflow-hidden min-h-[60vh] md:h-[70vh] shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <aside className={`border-r border-[#EBEBEB] overflow-y-auto bg-white ${activePeer ? "hidden md:block" : ""}`}>
          {listLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                variant="compact"
                icon="💬"
                title="No conversations yet"
                description="Connect with travelers on Match or Nearby, then message them here."
                cta="Find travelers"
                href="/match"
              />
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.peerId}
                onClick={() => setActivePeer(c.peerId)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[#F2F2F2] hover:bg-off-white touch-target transition-colors ${
                  activePeer === c.peerId ? "bg-off-white" : ""
                }`}
              >
                <span className="h-10 w-10 rounded-full bg-green-dark text-white flex items-center justify-center font-bold shrink-0 overflow-hidden">
                  {c.peer?.avatar ? (
                    <Image src={c.peer.avatar} alt="" width={40} height={40} className="object-cover h-full w-full" />
                  ) : (
                    (c.peer?.name || "?").charAt(0).toUpperCase()
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-text-dark truncate">{c.peer?.name || "User"}</p>
                  <p className="text-xs text-text-grey truncate">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="h-5 min-w-5 px-1 rounded-full bg-green-neon text-white text-[10px] font-bold flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </aside>

        <section className={`flex flex-col bg-white ${activePeer ? "" : "hidden md:flex"}`}>
          {!activePeer ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text-grey p-8">
              <MessageCircle className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">Select a conversation to start chatting.</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-[#EBEBEB] flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setActivePeer(null)}
                  className="md:hidden text-text-grey touch-target px-2"
                  aria-label="Back to conversations"
                >
                  ←
                </button>
                <span className="h-8 w-8 rounded-full bg-green-dark text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                  {peerInfo?.avatar ? (
                    <Image src={peerInfo.avatar} alt="" width={32} height={32} className="object-cover h-full w-full" />
                  ) : (
                    (peerInfo?.name || "?").charAt(0).toUpperCase()
                  )}
                </span>
                <p className="font-semibold text-text-dark">{peerInfo?.name || "User"}</p>
              </div>

              <div
                className="flex-1 overflow-y-auto p-4 space-y-2 bg-off-white/40"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label="Chat messages"
              >
                {loading ? (
                  <div className="flex justify-center pt-6">
                    <Loader2 className="h-5 w-5 animate-spin text-text-grey" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-text-grey pt-6">Say hi 👋</p>
                ) : (
                  messages.map((m, i) => {
                    const mine = String(m.sender) === String(user?._id);
                    return (
                      <motion.div
                        key={m._id || i}
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.22, ease: EASE_OUT }}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${
                            mine ? "bg-green-neon text-white rounded-br-sm" : "bg-white border border-[#EBEBEB] rounded-bl-sm"
                          }`}
                        >
                          {m.content}
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="p-3 border-t border-[#EBEBEB] flex items-center gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message…"
                  aria-label="Message"
                  className="flex-1 border border-[#E0E0E0] rounded-full px-4 py-3 min-h-[44px] focus:border-green-dark outline-none text-base sm:text-sm"
                />
                <button
                  type="button"
                  onClick={send}
                  className="touch-target rounded-full bg-green-neon text-white flex items-center justify-center hover:bg-green-dark transition-colors shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
