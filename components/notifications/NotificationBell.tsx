"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { notificationsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { getSocket, joinUserRoom } from "@/lib/socket";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Notif {
  _id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const user = useAuthStore((s) => s.user);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const { data } = await notificationsAPI.getMy();
      setItems(data.data);
      setUnread(data.unread);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!user) return;
    load();
    joinUserRoom(user._id);
    const socket = getSocket();
    const onNotif = (n: Notif) => {
      setItems((prev) => [n, ...prev].slice(0, 50));
      setUnread((u) => u + 1);
    };
    socket.on("notification", onNotif);
    return () => {
      socket.off("notification", onNotif);
    };
  }, [user]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAll = async () => {
    try {
      await notificationsAPI.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="relative text-white p-1.5 hover:opacity-80"
        aria-label="Notifications"
        whileTap={reduced ? undefined : { scale: 0.92 }}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <motion.span
            initial={reduced ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={
              mobile
                ? "fixed left-3 right-3 top-[72px] max-h-[min(70vh,calc(100dvh-88px))] overflow-y-auto overscroll-contain bg-white rounded-2xl shadow-2xl border border-[#EBEBEB] z-[200]"
                : "absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] max-h-[min(420px,70vh)] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#EBEBEB] z-[95]"
            }
          >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBEBEB] sticky top-0 bg-white">
            <span className="font-bold text-text-dark">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-green-dark font-medium flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-text-grey">No notifications yet.</p>
          ) : (
            items.map((n, i) => {
              const content = (
                <motion.div
                  initial={reduced ? false : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduced ? 0 : i * 0.04 }}
                  className={`px-4 py-3 border-b border-[#F2F2F2] hover:bg-off-white transition-colors ${
                    n.isRead ? "" : "bg-green-dark/5"
                  }`}
                >
                  <p className="text-sm font-semibold text-text-dark">{n.title}</p>
                  {n.body && (
                    <p className="text-xs text-text-grey mt-0.5 break-words whitespace-pre-wrap line-clamp-4">
                      {n.body}
                    </p>
                  )}
                  <p className="text-[10px] text-text-grey/70 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </motion.div>
              );
              return n.link ? (
                <Link key={n._id} href={n.link} onClick={() => setOpen(false)}>
                  {content}
                </Link>
              ) : (
                <div key={n._id}>{content}</div>
              );
            })
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
