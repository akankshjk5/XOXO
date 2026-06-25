"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Loader2, X, Check, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { verificationAPI } from "@/lib/api";

interface PendingItem {
  _id: string;
  documentUrl: string;
  idType: string;
  createdAt: string;
  user: { _id: string; name: string; email: string; avatar?: string };
}

export function VerificationQueue() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await verificationAPI.pending();
      setItems(data.data || []);
    } catch {
      toast.error("Couldn't load verification queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (id: string, action: "approve" | "reject") => {
    setReviewing(id);
    try {
      await verificationAPI.review(id, action, note[id]);
      toast.success(action === "approve" ? "User verified" : "Request rejected");
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch {
      toast.error("Review failed");
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div className="pt-[88px] max-w-[900px] mx-auto px-4 sm:px-6 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard" className="text-sm text-green-dark font-semibold">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-black text-text-dark mt-2 flex items-center gap-2">
            <BadgeCheck className="h-7 w-7 text-green-dark" />
            Verification queue
          </h1>
          <p className="text-text-grey text-sm mt-1">Review ID submissions and award the Trusted Traveller badge.</p>
        </div>
        <span className="text-sm font-semibold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
          {items.length} pending
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-text-grey" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E0E0E0] rounded-2xl">
          <BadgeCheck className="h-10 w-10 text-green-dark mx-auto mb-3 opacity-40" />
          <p className="text-text-grey">No pending verifications. All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item._id}
              className="border border-[#EBEBEB] rounded-2xl p-5 bg-white shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-text-dark">{item.user.name}</p>
                  <p className="text-sm text-text-grey">{item.user.email}</p>
                  <p className="text-xs text-text-grey mt-1 capitalize">
                    {item.idType.replace("_", " ")} · Submitted{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <a
                    href={item.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-green-dark font-semibold mt-2 hover:underline"
                  >
                    View document <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.documentUrl}
                    alt={`ID document for ${item.user.name}`}
                    className="h-24 w-36 object-cover rounded-lg border border-[#EBEBEB]"
                  />
                </div>
              </div>

              <textarea
                value={note[item._id] || ""}
                onChange={(e) => setNote((n) => ({ ...n, [item._id]: e.target.value }))}
                placeholder="Admin note (optional; shown to user if rejected)"
                rows={2}
                className="w-full mt-4 text-sm border border-[#E0E0E0] rounded-xl px-3 py-2 resize-none focus:border-green-dark outline-none"
              />

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => review(item._id, "approve")}
                  disabled={reviewing === item._id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-green-neon text-white font-bold hover:bg-green-dark disabled:opacity-60"
                >
                  {reviewing === item._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => review(item._id, "reject")}
                  disabled={reviewing === item._id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border border-red-300 text-red-600 font-bold hover:bg-red-50 disabled:opacity-60"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
