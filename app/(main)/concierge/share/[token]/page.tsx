"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { conciergeAPI } from "@/lib/api";
import { ItineraryTimeline } from "@/components/concierge/ItineraryTimeline";
import { BudgetDashboard } from "@/components/concierge/BudgetDashboard";
import type { ConciergePlan } from "@/lib/concierge-types";

export default function ConciergeSharePage() {
  const params = useParams();
  const token = params.token as string;
  const [plan, setPlan] = useState<ConciergePlan | null>(null);
  const [title, setTitle] = useState("Shared trip");

  useEffect(() => {
    if (!token) return;
    conciergeAPI.getShared(token).then(({ data }) => {
      setPlan(data.data.plan);
      setTitle(data.data.title || "Shared trip");
    });
  }, [token]);

  return (
    <div className="pt-[88px] container-x pb-16 max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-text-dark mb-6">{title}</h1>
      <div className="space-y-6">
        <BudgetDashboard plan={plan} />
        <ItineraryTimeline plan={plan} />
      </div>
    </div>
  );
}
