"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Eye, MousePointer, Heart, Share2, CalendarCheck } from "lucide-react";

export function AdminAnalyticsModule() {
  const [data, setData] = useState<{
    byEvent?: Record<string, number>;
    topPackages?: { id: string; title: string; views: number }[];
    topCountries?: { _id: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    adminAPI.getAnalyticsSummary().then((res) => setData(res.data.data)).catch(() => {});
  }, []);

  const events = data?.byEvent || {};

  return (
    <>
      <AdminHeader title="Analytics" subtitle="Views, clicks, wishlist, shares — last 30 days" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <AdminStatCard label="Views" value={events.view ?? 0} icon={Eye} />
          <AdminStatCard label="Clicks" value={events.click ?? 0} icon={MousePointer} />
          <AdminStatCard label="Wishlist" value={events.wishlist ?? 0} icon={Heart} />
          <AdminStatCard label="Shares" value={events.share ?? 0} icon={Share2} />
          <AdminStatCard label="Bookings" value={events.booking ?? 0} icon={CalendarCheck} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="admin-card p-5">
            <h3 className="font-medium text-text-dark mb-4">Popular packages</h3>
            <ul className="space-y-2">
              {(data?.topPackages ?? []).length === 0 ? (
                <li className="text-sm text-text-grey">No view data yet</li>
              ) : (
                data?.topPackages?.map((p) => (
                  <li key={p.id} className="flex justify-between text-sm rounded-xl bg-[var(--admin-bg)] px-3 py-2">
                    <span className="truncate font-medium">{p.title}</span>
                    <span className="text-text-grey">{p.views} views</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="admin-card p-5">
            <h3 className="font-medium text-text-dark mb-4">Top countries</h3>
            <ul className="space-y-2">
              {(data?.topCountries ?? []).length === 0 ? (
                <li className="text-sm text-text-grey">No geo data yet</li>
              ) : (
                data?.topCountries?.map((c) => (
                  <li key={c._id} className="flex justify-between text-sm rounded-xl bg-[var(--admin-bg)] px-3 py-2">
                    <span>{c._id || "Unknown"}</span>
                    <span className="text-text-grey">{c.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
