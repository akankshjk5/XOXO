"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  CalendarCheck,
  Users,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminMiniChart } from "@/components/admin/AdminMiniChart";
import { AdminActivityFeed } from "@/components/admin/AdminActivityFeed";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { RecentBookingRequests, type RecentBookingRequest } from "@/components/admin/RecentBookingRequests";
import { ContextualError } from "@/components/ui/ContextualError";
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
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [navigating, setNavigating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const go = (href: string) => {
    setNavigating(href);
    router.push(href);
  };

  const load = () => {
    setLoading(true);
    setError(null);
    adminAPI
      .getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => setError("Couldn't load dashboard stats. Please check your connection and try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !data) return <DashboardSkeleton />;

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

  if (error && !data) {
    return (
      <>
        <AdminHeader title="Dashboard" subtitle="Live overview of your travel platform" />
        <div className="p-4 sm:p-6 lg:p-8">
          <ContextualError title="Dashboard unavailable" message={error} onRetry={load} />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Live overview of your travel platform" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {error && (
          <ContextualError title="Partial load issue" message={error} onRetry={load} compact />
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Total Packages" value={stats?.totalPackages ?? 0} icon={Package} animate />
          <AdminStatCard label="Total Destinations" value={stats?.totalDestinations ?? 0} icon={MapPin} animate />
          <AdminStatCard label="Total Bookings" value={stats?.totalBookings ?? 0} icon={CalendarCheck} animate />
          <AdminStatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} animate />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Today's Bookings" value={stats?.todayBookings ?? 0} icon={CalendarCheck} animate />
          <AdminStatCard label="Today's Revenue" value={stats ? formatINR(stats.todayRevenue) : "—"} icon={IndianRupee} />
          <AdminStatCard label="Active Users (30d)" value={stats?.activeUsers ?? 0} icon={Users} trend="Last 30 days" animate />
          <AdminStatCard label="Pending Payments" value={stats?.pendingPayments ?? 0} icon={CalendarCheck} animate />
        </div>

        <AdminQuickActions navigating={navigating} onNavigate={go} />

        <RecentBookingRequests
          bookings={(data?.activity.recentBookings ?? []) as unknown as RecentBookingRequest[]}
          onUpdated={load}
        />

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
                  <li key={pkg.id}>
                    <Link
                      href="/admin/packages"
                      className="flex items-center justify-between rounded-xl bg-[var(--admin-bg)] px-3 py-2 text-sm hover:bg-white hover:border-green-bright/20 border border-transparent transition-colors"
                    >
                      <span className="truncate font-medium">{pkg.title}</span>
                      <span className="text-text-grey">{pkg.count} bookings</span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="admin-card p-5">
            <h3 className="font-medium text-text-dark">Popular Destinations</h3>
            <ul className="mt-4 space-y-2">
              {(data?.charts.topDestinations ?? []).length === 0 ? (
                <li className="py-4 text-center text-sm text-text-grey">No destination data yet</li>
              ) : (
                data?.charts.topDestinations.map((dest) => (
                <li key={dest.slug || dest.name}>
                  <Link
                    href={dest.slug ? `/destinations/${dest.slug}` : "/admin/destinations"}
                    className="flex items-center justify-between rounded-xl bg-[var(--admin-bg)] px-3 py-2 text-sm hover:bg-white border border-transparent hover:border-green-bright/20 transition-colors"
                  >
                    <span className="font-medium">{dest.name}</span>
                    <span className="text-text-grey">{dest.country}</span>
                  </Link>
                </li>
              ))
              )}
            </ul>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AdminActivityFeed
            title="Recent Customers"
            viewAllHref="/admin/users"
            items={(data?.activity.recentUsers ?? []).map((u) => {
              const row = u as { _id: string; name?: string; email?: string; createdAt?: string };
              return {
                id: row._id,
                title: row.name || "New user",
                subtitle: row.email || "",
                time: row.createdAt,
                href: "/admin/users",
              };
            })}
          />
          <AdminActivityFeed
            title="Recent Payments"
            viewAllHref="/admin/bookings"
            items={(data?.activity.recentPayments ?? []).map((p) => {
              const row = p as {
                _id: string;
                totalAmount?: number;
                paidAmount?: number;
                updatedAt?: string;
                user?: { name?: string };
              };
              return {
                id: row._id,
                title: row.user?.name || "Payment",
                subtitle: `₹${(row.paidAmount || row.totalAmount || 0).toLocaleString("en-IN")}`,
                time: row.updatedAt,
                href: "/admin/bookings",
              };
            })}
          />
        </div>
      </div>
    </>
  );
}
