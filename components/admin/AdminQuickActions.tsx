"use client";

import { useRouter } from "next/navigation";
import { type LucideIcon, Package, MapPin, CalendarCheck, Users, Tag, Settings, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS: { href: string; label: string; description: string; icon: LucideIcon; accent: string }[] = [
  { href: "/admin/packages", label: "Packages", description: "Create & publish trips", icon: Package, accent: "from-emerald-500/10 to-emerald-600/5" },
  { href: "/admin/destinations", label: "Destinations", description: "Manage countries & cities", icon: MapPin, accent: "from-sky-500/10 to-sky-600/5" },
  { href: "/admin/bookings", label: "Bookings", description: "View all reservations", icon: CalendarCheck, accent: "from-violet-500/10 to-violet-600/5" },
  { href: "/admin/users", label: "Customers", description: "Verify & manage users", icon: Users, accent: "from-amber-500/10 to-amber-600/5" },
  { href: "/admin/coupons?create=1", label: "Coupons", description: "Create discount codes", icon: Tag, accent: "from-rose-500/10 to-rose-600/5" },
  { href: "/admin/settings", label: "Settings", description: "Site configuration", icon: Settings, accent: "from-slate-500/10 to-slate-600/5" },
];

interface AdminQuickActionsProps {
  navigating: string | null;
  onNavigate: (href: string) => void;
}

export function AdminQuickActions({ navigating, onNavigate }: AdminQuickActionsProps) {
  const router = useRouter();

  return (
    <div className="admin-card p-5">
      <h3 className="font-semibold text-text-dark mb-4">Quick actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const busy = navigating === a.href;
          return (
            <button
              key={a.href}
              type="button"
              disabled={!!navigating}
              onClick={() => onNavigate(a.href)}
              onMouseEnter={() => router.prefetch(a.href.split("?")[0])}
              className={cn(
                "group relative flex flex-col items-start gap-3 rounded-2xl border border-[var(--admin-border)] bg-gradient-to-br p-4 text-left",
                "transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-green-bright/30",
                "disabled:opacity-60 disabled:pointer-events-none min-h-[108px]",
                a.accent
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-green-dark group-hover:scale-105 transition-transform">
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" aria-hidden />}
              </span>
              <span>
                <span className="block text-sm font-semibold text-text-dark">{a.label}</span>
                <span className="block text-[11px] text-text-grey mt-0.5 leading-tight">{a.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
