"use client";

import { useAuthStore } from "@/store/authStore";
import { mapUserToAdminRole } from "@/lib/admin/navigation";
import { Bell, Search } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const adminRole = mapUserToAdminRole(user?.role);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/95 backdrop-blur-md">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h1 className="font-primary text-xl font-semibold text-text-dark sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-text-grey">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-grey" aria-hidden />
            <input
              type="search"
              placeholder="Search admin…"
              className="h-10 w-56 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] pl-9 pr-3 text-sm outline-none focus:border-green-bright focus:ring-2 focus:ring-green-bright/20"
              aria-label="Search admin"
            />
          </div>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] text-text-grey hover:text-text-dark"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-bright" />
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-dark text-xs font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-text-dark">{user?.name}</p>
              <p className="text-xs capitalize text-text-grey">
                {(adminRole || "admin").replace("-", " ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
