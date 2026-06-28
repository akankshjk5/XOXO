"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { newsletterAPI } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await newsletterAPI.subscribe({ email: email.trim(), source: "footer" });
      trackEvent("newsletter", { entityType: "page", meta: { email: email.trim() } });
      toast.success("You're on the list! ✈️");
      setEmail("");
    } catch {
      toast.error("Couldn't subscribe. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 max-w-md">
      <p className="text-sm font-semibold text-white/80 mb-2">Get travel deals in your inbox</p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-green-bright"
          aria-label="Email for newsletter"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-xl bg-green-bright px-4 py-2.5 text-sm font-bold text-green-dark hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "…" : "Subscribe"}
        </button>
      </div>
    </form>
  );
}
