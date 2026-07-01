"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useConcierge } from "@/hooks/useConcierge";
import { useAuthStore } from "@/store/authStore";
import { conciergeAPI } from "@/lib/api";
import { ConciergeChat } from "@/components/concierge/ConciergeChat";
import { ItineraryTimeline } from "@/components/concierge/ItineraryTimeline";
import { BudgetDashboard } from "@/components/concierge/BudgetDashboard";
import { BookingSidebar } from "@/components/concierge/BookingSidebar";
import { MapPreview } from "@/components/concierge/MapPreview";

export function ConciergeWorkspace() {
  const pathname = usePathname() || "/concierge";
  const user = useAuthStore((s) => s.user);
  const { session, loading, sending, streaming, prompts, send, newSession } = useConcierge(pathname);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast.error("Please log in to save your itinerary.");
      return;
    }
    if (!session?.id) return;
    setSaving(true);
    try {
      await conciergeAPI.saveItinerary(session.id);
      toast.success("Itinerary saved to your dashboard!");
    } catch {
      toast.error("Couldn't save itinerary.");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (!session?.shareToken) return;
    const url = `${window.location.origin}/concierge/share/${session.shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied!");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-grey gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-green-dark" />
        Starting your concierge session…
      </div>
    );
  }

  return (
    <div className="pt-[88px] pb-16">
      <div className="container-x mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-green-dark font-semibold text-sm mb-1">AI Travel Concierge</p>
          <h1 className="text-3xl sm:text-4xl font-black text-text-dark tracking-tight">
            Plan your complete trip
          </h1>
          <p className="text-text-grey text-sm mt-2 max-w-xl">
            Natural language planning with live flights, hotels, activities, visa info, and social
            matches — all in one workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => newSession()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-grey hover:text-green-dark"
        >
          <RotateCcw className="h-4 w-4" />
          New trip
        </button>
      </div>

      <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]">
        <div className="lg:col-span-4 flex flex-col min-h-[480px]">
          <ConciergeChat
            messages={session?.messages || []}
            prompts={prompts}
            sending={sending}
            streaming={streaming}
            onSend={send}
          />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <MapPreview plan={session?.plan || null} />
          <ItineraryTimeline plan={session?.plan || null} intent={session?.intent} />
          {session?.plan?.highlights && session.plan.highlights.length > 0 && (
            <div className="rounded-2xl border border-green-bright/30 bg-green-bright/5 p-4">
              <p className="text-xs font-bold text-green-dark uppercase mb-2">Highlights</p>
              <ul className="text-sm text-text-dark space-y-1 list-disc list-inside">
                {session.plan.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <BudgetDashboard plan={session?.plan || null} />
          <div className="mt-4">
            <BookingSidebar
              session={session}
              saving={saving}
              onSave={handleSave}
              onShare={handleShare}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
