"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { reviewsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface ReviewItem {
  _id: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  user?: { name?: string; avatar?: string };
}

export function PackageReviews({ packageId }: { packageId: string }) {
  const user = useAuthStore((s) => s.user);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const { data } = await reviewsAPI.getForPackage(packageId);
      setReviews(data.data);
    } catch {
      toast.error("Couldn't load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId]);

  const submit = async () => {
    if (!user) {
      toast.error("Please log in to write a review.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a short review.");
      return;
    }
    setSubmitting(true);
    try {
      await reviewsAPI.create({ packageId, rating, comment });
      toast.success("Thanks for your review!");
      setComment("");
      setRating(5);
      load();
    } catch {
      toast.error("Couldn't submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Write a review */}
      {user && (
        <div className="border border-[#EBEBEB] rounded-xl p-4">
          <h4 className="font-bold text-text-dark mb-3">Write a review</h4>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} star`}>
                <Star
                  className={`h-6 w-6 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience…"
            className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none resize-none mb-3"
          />
          <button
            onClick={submit}
            disabled={submitting}
            className="px-5 py-2 rounded-full bg-green-neon text-white font-semibold hover:bg-green-dark transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit review
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-text-grey">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-text-grey">No reviews yet. Be the first to share your experience!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-[#EBEBEB] pb-4">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="h-9 w-9 rounded-full bg-green-dark text-white flex items-center justify-center font-bold text-sm">
                  {(r.user?.name || "G").charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-text-dark text-sm">{r.user?.name || "Traveller"}</p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {r.comment && <p className="text-sm text-text-grey">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
