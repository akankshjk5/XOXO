"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavForRole, ADMIN_FOOTER_NAV, type AdminRoleId } from "@/lib/admin/navigation";
import { Sparkles, PanelLeftClose, PanelLeft } from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  adminRole: AdminRoleId;
}

export function AdminSidebar({ adminRole }: AdminSidebarProps) {
  const pathname = usePathname() || "";
  const [collapsed, setCollapsed] = useState(false);
  const navItems = getNavForRole(adminRole);

  return (
    <aside
      className={cn(
        "admin-sidebar flex h-full flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4">
        <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Sparkles className="h-5 w-5 text-green-bright" aria-hidden />
          </span>
          {!collapsed && (
            <span className="truncate font-semibold tracking-tight">XOXO Admin</span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto rounded-full bg-green-bright/20 px-2 py-0.5 text-[10px] text-green-bright">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        {ADMIN_FOOTER_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
