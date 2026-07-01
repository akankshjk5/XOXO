"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Send, Loader2, X, Reply, MapPin } from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import toast from "react-hot-toast";
import { chatAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { getSocket, joinUserRoom } from "@/lib/socket";
import { EmptyState, LoadingSkeleton } from "@/components/motion";
import { EASE_OUT } from "@/lib/motion";
import { InviteGuidePanel, type RoomGuide } from "@/components/chat/InviteGuidePanel";
import { SafetyDisclaimer } from "@/components/social/SafetyDisclaimer";
import { MessageStatus } from "@/components/chat/MessageStatus";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { VerifiedBadge } from "@/components/social/VerifiedBadge";

interface Msg {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt?: string;
  isRead?: boolean;
  replyTo?: { content: string; senderName?: string };
}

interface Conversation {
  peerId: string;
  roomId: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  peer?: { _id?: string; name?: string; avatar?: string; isVerified?: boolean };
}

function formatMsgTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return `Yesterday ${format(d, "h:mm a")}`;
  return format(d, "MMM d, h:mm a");
}

const IMAGE_URL_RE = /^https?:\/\/.+\.(png|jpe?g|gif|webp)(\?.*)?$/i;

function MessageBody({ content, mine }: { content: string; mine: boolean }) {
  if (IMAGE_URL_RE.test(content.trim())) {
    return (
      <a href={content.trim()} target="_blank" rel="noopener noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.trim()} alt="Shared image" className="max-w-full rounded-lg max-h-48 object-cover" />
      </a>
    );
  }
  return <span className={mine ? "text-white" : "text-text-dark"}>{content}</span>;
}

export function ChatClient() {
  const user = useAuthStore((s) => s.user);
  const params = useSearchParams();
  const initialPeer = params ? params.get("peer") : null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePeer, setActivePeer] = useState<string | null>(initialPeer);
  const [peerInfo, setPeerInfo] = useState<{ name?: string; avatar?: string; isVerified?: boolean } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomGuides, setRoomGuides] = useState<RoomGuide[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [peerTyping, setPeerTyping] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConvo = useMemo(
    () => conversations.find((c) => c.peerId === activePeer),
    [conversations, activePeer]
  );

  const peerIsGuide = useMemo(
    () => roomGuides.some((g) => String(g._id) === String(activePeer)),
    [roomGuides, activePeer]
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const loadConversations = async () => {
    try {
      const { data } = await chatAPI.conversations();
      setConversations(data.data);
    } catch {
      toast.error("Couldn't load conversations.");
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
    stickToBottomRef.current = true;
    (async () => {
      try {
        const { data } = await chatAPI.thread(activePeer);
        setMessages(data.data.messages);
        setRoomId(data.data.roomId);
        setRoomGuides(data.data.guides || []);
        setPeerInfo(data.data.peer);
        getSocket().emit("joinRoom", data.data.roomId);
      } catch {
        toast.error("Couldn't load this conversation.");
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
          stickToBottomRef.current = true;
        }
      }
      loadConversations();
    };
    const onTyping = (uid: string) => {
      if (uid === activePeer) setPeerTyping(true);
    };
    const onStopTyping = (uid: string) => {
      if (uid === activePeer) setPeerTyping(false);
    };
    socket.on("newMessage", onNew);
    socket.on("userTyping", onTyping);
    socket.on("userStoppedTyping", onStopTyping);
    return () => {
      socket.off("newMessage", onNew);
      socket.off("userTyping", onTyping);
      socket.off("userStoppedTyping", onStopTyping);
    };
  }, [roomId, activePeer, user?._id]);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    scrollToBottom(messages.length > 2 ? "smooth" : "auto");
  }, [messages, loading, peerTyping, scrollToBottom]);

  const handleMessagesScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stickToBottomRef.current = nearBottom;
  };

  const emitTyping = (value: string) => {
    if (!roomId || !user?._id) return;
    const socket = getSocket();
    if (value.trim()) {
      socket.emit("typing", { roomId, userId: user._id });
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socket.emit("stopTyping", { roomId, userId: user._id });
      }, 1200);
    } else {
      socket.emit("stopTyping", { roomId, userId: user._id });
    }
  };

  const buildPayload = (content: string) => {
    const base = content.trim();
    if (!replyTo) return base;
    const prefix = `↩ ${replyTo.content.slice(0, 60)}${replyTo.content.length > 60 ? "…" : ""}\n`;
    return prefix + base;
  };

  const send = async () => {
    if (!text.trim() || !activePeer || sending) return;
    const content = buildPayload(text);
    setText("");
    setReplyTo(null);
    setSending(true);
    stickToBottomRef.current = true;
    if (roomId && user?._id) {
      getSocket().emit("stopTyping", { roomId, userId: user._id });
    }
    try {
      const { data } = await chatAPI.send(activePeer, content);
      setMessages((prev) =>
        prev.some((x) => x._id === data.data._id) ? prev : [...prev, data.data]
      );
    } catch {
      setText(content);
      toast.error("Message failed to send. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl.length > 500_000) {
        toast.error("Image too large. Share a link instead.");
        return;
      }
      setText(dataUrl);
      toast.success("Image ready — tap send to share preview link");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const lastMineId = [...messages].reverse().find((m) => String(m.sender) === String(user?._id))?._id;

  const presenceLabel = peerTyping
    ? "typing…"
    : activeConvo?.lastAt
      ? `Last seen ${formatDistanceToNow(new Date(activeConvo.lastAt), { addSuffix: true })}`
      : "Offline";

  return (
    <div className="pt-[88px] container-x pb-[calc(56px+env(safe-area-inset-bottom)+1rem)] md:pb-8">
      <h1 className="text-2xl font-black text-text-dark mb-3 tracking-tight">Messages</h1>
      <SafetyDisclaimer className="mb-4" />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-0 md:gap-4 border border-[#EBEBEB] rounded-2xl overflow-hidden h-[calc(100dvh-220px)] min-h-[420px] max-h-[min(720px,100dvh-12rem)] md:h-[70vh] shadow-premium supports-[height:100svh]:max-h-[min(720px,calc(100svh-12rem))]">
        <aside className={`border-r border-[#EBEBEB] overflow-y-auto bg-white min-h-0 ${activePeer ? "hidden md:block" : ""}`}>
          {listLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4">
              <EmptyState variant="compact" icon="💬" title="No conversations yet" description="Connect with travelers on Match or Nearby." cta="Find travelers" href="/match" />
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.peerId}
                type="button"
                onClick={() => setActivePeer(c.peerId)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[#F2F2F2] hover:bg-off-white touch-target transition-colors min-h-[56px] ${activePeer === c.peerId ? "bg-off-white" : ""}`}
              >
                <span className="relative h-10 w-10 rounded-full bg-green-dark text-white flex items-center justify-center font-bold shrink-0 overflow-hidden">
                  {c.peer?.avatar ? (
                    <Image src={c.peer.avatar} alt="" width={40} height={40} className="object-cover h-full w-full" />
                  ) : (
                    (c.peer?.name || "?").charAt(0).toUpperCase()
                  )}
                  {activePeer === c.peerId && peerTyping && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-text-dark truncate flex items-center gap-1">
                    {c.peer?.name || "User"}
                    {c.peer?.isVerified && <VerifiedBadge className="!text-[9px]" />}
                  </p>
                  <p className="text-xs text-text-grey truncate">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="h-5 min-w-5 px-1 rounded-full bg-green-neon text-white text-[10px] font-bold flex items-center justify-center">{c.unread}</span>
                )}
              </button>
            ))
          )}
        </aside>

        <section className={`flex flex-col bg-white min-h-0 min-w-0 ${activePeer ? "" : "hidden md:flex"}`}>
          {!activePeer ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState variant="compact" icon="💬" title="Select a conversation" description="Pick a chat from the list to start messaging." cta="Find travelers" href="/match" />
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-[#EBEBEB] flex items-center gap-3 shrink-0">
                <button type="button" onClick={() => setActivePeer(null)} className="md:hidden text-text-grey touch-target px-2 min-h-[44px]" aria-label="Back to conversations">←</button>
                <span className="relative h-9 w-9 rounded-full bg-green-dark text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                  {peerInfo?.avatar ? (
                    <Image src={peerInfo.avatar} alt="" width={36} height={36} className="object-cover h-full w-full" />
                  ) : (
                    (peerInfo?.name || "?").charAt(0).toUpperCase()
                  )}
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${peerTyping ? "bg-emerald-400" : "bg-slate-300"}`}
                    aria-hidden
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-dark truncate flex items-center gap-1.5 flex-wrap">
                    {peerInfo?.name || "User"}
                    {peerInfo?.isVerified && <VerifiedBadge className="!text-[9px]" />}
                    {peerIsGuide && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                        <MapPin className="h-3 w-3" aria-hidden /> Guide
                      </span>
                    )}
                  </p>
                  <p className={`text-xs truncate ${peerTyping ? "text-green-dark font-medium" : "text-text-grey"}`}>
                    {presenceLabel}
                  </p>
                </div>
              </div>

              <InviteGuidePanel peerId={activePeer} guides={roomGuides} onGuidesChange={setRoomGuides} onSystemMessage={(content) => {
                setMessages((prev) => [...prev, { sender: String(user?._id), receiver: activePeer, content, createdAt: new Date().toISOString() }]);
                loadConversations();
              }} />

              <div
                ref={messagesRef}
                onScroll={handleMessagesScroll}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-off-white/40 min-h-0"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label="Chat messages"
              >
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <LoadingSkeleton key={i} className="h-10 rounded-2xl" />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-8">
                    <EmptyState variant="compact" icon="👋" title="Start the conversation" description="Send a message to break the ice." />
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const mine = String(m.sender) === String(user?._id);
                    const isLastMine = mine && m._id === lastMineId;
                    return (
                      <motion.div
                        key={m._id || `msg-${i}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, ease: EASE_OUT }}
                        className={`flex flex-col group ${mine ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-end gap-1 max-w-[88%] sm:max-w-[78%]">
                          {!mine && (
                            <button
                              type="button"
                              onClick={() => setReplyTo(m)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-text-grey hover:text-green-dark transition-opacity shrink-0"
                              aria-label="Reply"
                            >
                              <Reply className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm shadow-sm break-words [overflow-wrap:anywhere] ${mine ? "bg-green-neon text-white rounded-br-md" : "bg-white border border-[#EBEBEB] rounded-bl-md"}`}>
                            <MessageBody content={m.content} mine={mine} />
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-0.5 px-1 ${mine ? "flex-row-reverse" : ""}`}>
                          <time className="text-[10px] text-text-grey tabular-nums" dateTime={m.createdAt}>
                            {formatMsgTime(m.createdAt)}
                          </time>
                          {mine && (
                            <MessageStatus
                              sent
                              delivered={!!m._id}
                              seen={isLastMine && !!m.isRead}
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
                {peerTyping && (
                  <div className="flex justify-start">
                    <TypingIndicator />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {replyTo && (
                <div className="px-3 py-2 border-t border-[#EBEBEB] bg-off-white/80 flex items-center gap-2 text-xs">
                  <Reply className="h-3.5 w-3.5 text-green-dark shrink-0" aria-hidden />
                  <span className="truncate text-text-grey flex-1">Replying to: {replyTo.content.slice(0, 80)}</span>
                  <button type="button" onClick={() => setReplyTo(null)} className="text-text-grey hover:text-text-dark p-1" aria-label="Cancel reply">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="px-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[#EBEBEB] flex items-end gap-1.5 sm:gap-2 shrink-0 bg-white relative z-10">
                <EmojiPicker onPick={(e) => setText((t) => t + e)} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImagePick}
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="touch-target rounded-full text-text-grey hover:text-green-dark min-h-[44px] min-w-[44px] flex items-center justify-center text-lg"
                  aria-label="Attach image"
                >
                  📷
                </button>
                <input
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    emitTyping(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Type a message…"
                  aria-label="Message"
                  disabled={sending}
                  className="flex-1 border border-[#E0E0E0] rounded-full px-4 py-3 min-h-[44px] focus:border-green-dark outline-none text-base sm:text-sm disabled:opacity-60 min-w-0"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || !text.trim()}
                  className="touch-target rounded-full bg-green-neon text-white flex items-center justify-center hover:bg-green-dark transition-colors shrink-0 disabled:opacity-50 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright focus-visible:ring-offset-2"
                  aria-label={sending ? "Sending message" : "Send message"}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
