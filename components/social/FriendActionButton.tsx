"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, Check, X, Clock, Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { friendsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export type FriendStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "friends"
  | "self"
  | "loading";

interface FriendActionButtonProps {
  userId: string;
  userName?: string;
  compact?: boolean;
  className?: string;
  /** Pre-fetched status from bulk endpoint */
  initialStatus?: FriendStatus;
  initialFriendshipId?: string;
  onStatusChange?: () => void;
}

export function FriendActionButton({
  userId,
  userName,
  compact = false,
  className = "",
  initialStatus,
  initialFriendshipId,
  onStatusChange,
}: FriendActionButtonProps) {
  const me = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<FriendStatus>(initialStatus || "loading");
  const [friendshipId, setFriendshipId] = useState<string | undefined>(initialFriendshipId);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!me || me._id === userId) {
      setStatus("self");
      return;
    }
    if (initialStatus && initialStatus !== "loading") return;
    try {
      const { data } = await friendsAPI.getStatus(userId);
      setStatus(data.data.status);
      setFriendshipId(data.data.friendshipId);
    } catch {
      setStatus("none");
    }
  }, [me, userId, initialStatus]);

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
      setFriendshipId(initialFriendshipId);
      return;
    }
    load();
  }, [load, initialStatus, initialFriendshipId]);

  const send = async () => {
    setBusy(true);
    try {
      const { data } = await friendsAPI.sendRequest(userId);
      setStatus("pending_sent");
      setFriendshipId(data.data._id);
      toast.success(`Friend request sent${userName ? ` to ${userName}` : ""}`);
      onStatusChange?.();
    } catch (e: unknown) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Couldn't send request"
      );
    } finally {
      setBusy(false);
    }
  };

  const respond = async (action: "accept" | "reject") => {
    if (!friendshipId) return;
    setBusy(true);
    try {
      await friendsAPI.respond(friendshipId, action);
      setStatus(action === "accept" ? "friends" : "none");
      toast.success(action === "accept" ? "Friend added!" : "Declined");
      onStatusChange?.();
    } catch {
      toast.error("Couldn't update request");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!friendshipId) return;
    setBusy(true);
    try {
      await friendsAPI.remove(friendshipId);
      setStatus("none");
      setFriendshipId(undefined);
      toast.success("Request cancelled");
      onStatusChange?.();
    } catch {
      toast.error("Couldn't cancel");
    } finally {
      setBusy(false);
    }
  };

  if (!me || status === "self") return null;

  if (status === "loading") {
    return (
      <span className={`inline-flex items-center text-text-grey ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    );
  }

  if (status === "friends") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-dark bg-green-50 px-2.5 py-1 rounded-full">
          <Users className="h-3.5 w-3.5" /> Friends
        </span>
        <Link
          href={`/chat?peer=${userId}`}
          className={`text-xs font-semibold text-green-dark hover:underline ${compact ? "" : "px-3 py-1.5 rounded-full border border-green-dark"}`}
        >
          Message
        </Link>
      </div>
    );
  }

  if (status === "pending_sent") {
    return (
      <button
        type="button"
        onClick={cancel}
        disabled={busy}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-text-grey ${className}`}
        aria-label="Cancel friend request"
      >
        <Clock className="h-3.5 w-3.5" /> Pending
      </button>
    );
  }

  if (status === "pending_received") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => respond("accept")}
          disabled={busy}
          aria-label="Accept friend request"
          className="h-8 w-8 rounded-full bg-green-neon text-white flex items-center justify-center"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => respond("reject")}
          disabled={busy}
          aria-label="Reject friend request"
          className="h-8 w-8 rounded-full border border-red-300 text-red-500 flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={send}
      disabled={busy}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors disabled:opacity-60 ${
        compact
          ? "text-xs text-green-dark hover:underline px-0 py-0"
          : "text-sm bg-white border border-green-dark text-green-dark px-4 py-2 hover:bg-green-dark hover:text-white"
      } ${className}`}
      aria-label={`Send friend request to ${userName || "user"}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
      {!compact && "Add friend"}
    </button>
  );
}

/** Badge-only indicator for lists */
export function FriendStatusBadge({ status }: { status: FriendStatus }) {
  if (status === "friends") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wide text-green-dark bg-green-50 px-2 py-0.5 rounded-full">
        Friend
      </span>
    );
  }
  if (status === "pending_sent" || status === "pending_received") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
        Pending
      </span>
    );
  }
  return null;
}
