"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  IndianRupee,
  Users,
  CreditCard,
  XCircle,
  Star,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminMiniChart } from "@/components/admin/AdminMiniChart";
import { AdminActivityFeed } from "@/components/admin/AdminActivityFeed";
import { adminAPI } from "@/lib/api";
import type { AdminDashboardData } from "@/lib/admin/types";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="admin-skeleton h-16 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="admin-skeleton h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="admin-skeleton h-56" />
        <div className="admin-skeleton h-56" />
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminAPI
      .getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => setError("Could not load dashboard stats. Try refreshing."));
  }, []);

  if (!data && !error) return <DashboardSkeleton />;

  const stats = data?.stats;
  const bookingChart =
    data?.charts.monthlyBookings.map((p) => ({
      label: p._id,
      value: p.count || 0,
    })) ?? [];
  const revenueChart =
    data?.charts.monthlyRevenue.map((p) => ({
      label: p._id,
      value: p.revenue || 0,
    })) ?? [];

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Live overview of your travel platform" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <AdminStatCard
            label="Today's Bookings"
            value={stats?.todayBookings ?? "—"}
            icon={CalendarCheck}
          />
          <AdminStatCard
            label="Today's Revenue"
            value={stats ? formatINR(stats.todayRevenue) : "—"}
            icon={IndianRupee}
          />
          <AdminStatCard
            label="Active Users"
            value={stats?.activeUsers ?? "—"}
            icon={Users}
            trend="Last 30 days"
          />
          <AdminStatCard
            label="Pending Payments"
            value={stats?.pendingPayments ?? "—"}
            icon={CreditCard}
          />
          <AdminStatCard
            label="Cancelled Trips"
            value={stats?.cancelledTrips ?? "—"}
            icon={XCircle}
          />
          <AdminStatCard label="New Reviews" value={stats?.newReviews ?? "—"} icon={Star} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AdminMiniChart title="Bookings (this month)" data={bookingChart.slice(-14)} />
          <AdminMiniChart
            title="Revenue (this month)"
            data={revenueChart.slice(-14)}
            valuePrefix="₹"
            barClassName="bg-green-bright"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="admin-card p-5">
            <h3 className="font-medium text-text-dark">Top Packages</h3>
            <ul className="mt-4 space-y-2">
              {(data?.charts.topPackages ?? []).length === 0 ? (
                <li className="py-4 text-center text-sm text-text-grey">No bookings yet</li>
              ) : (
                data?.charts.topPackages.map((pkg) => (
                  <li
                    key={pkg.id}
                    className="flex items-center justify-between rounded-xl bg-[var(--admin-bg)] px-3 py-2 text-sm"
                  >
                    <span className="truncate font-medium">{pkg.title}</span>
                    <span className="text-text-grey">{pkg.count} bookings</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="admin-card p-5">
            <h3 className="font-medium text-text-dark">Popular Destinations</h3>
            <ul className="mt-4 space-y-2">
              {(data?.charts.topDestinations ?? []).map((dest) => (
                <li
                  key={dest.slug || dest.name}
                  className="flex items-center justify-between rounded-xl bg-[var(--admin-bg)] px-3 py-2 text-sm"
                >
                  <span className="font-medium">{dest.name}</span>
                  <span className="text-text-grey">{dest.country}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <AdminActivityFeed
            title="Recent Bookings"
            items={(data?.activity.recentBookings ?? []).map((b) => {
              const booking = b as {
                _id: string;
                user?: { name?: string };
                package?: { title?: string };
                status?: string;
                createdAt?: string;
              };
              return {
                id: booking._id,
                title: booking.package?.title || "Booking",
                subtitle: `${booking.user?.name || "Guest"} · ${booking.status}`,
                time: booking.createdAt,
              };
            })}
          />
          <AdminActivityFeed
            title="Recent Users"
            items={(data?.activity.recentUsers ?? []).map((u) => {
              const user = u as { _id: string; name?: string; email?: string; createdAt?: string };
              return {
                id: user._id,
                title: user.name || "User",
                subtitle: user.email,
                time: user.createdAt,
              };
            })}
          />
          <AdminActivityFeed
            title="Recent Payments"
            items={(data?.activity.recentPayments ?? []).map((p) => {
              const pay = p as {
                _id: string;
                user?: { name?: string };
                paidAmount?: number;
                updatedAt?: string;
              };
              return {
                id: pay._id,
                title: formatINR(pay.paidAmount || 0),
                subtitle: pay.user?.name,
                time: pay.updatedAt,
              };
            })}
          />
          <AdminActivityFeed
            title="Notifications"
            items={(data?.activity.recentNotifications ?? []).map((n) => {
              const note = n as { _id: string; title?: string; body?: string; createdAt?: string };
              return {
                id: note._id,
                title: note.title || "Notification",
                subtitle: note.body,
                time: note.createdAt,
              };
            })}
            emptyMessage="No system notifications"
          />
        </div>
      </div>
    </>
  );
}
