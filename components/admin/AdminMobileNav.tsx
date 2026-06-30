"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { getNavForRole, type AdminRoleId } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface AdminMobileNavProps {
  adminRole: AdminRoleId;
}

export function AdminMobileNav({ adminRole }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "";
  const navItems = getNavForRole(adminRole);

  return (
    <div className="border-b border-[var(--admin-border)] bg-green-dark px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 min-w-0">
          <BrandLogo variant="admin" linked={false} />
          <span className="text-sm font-semibold text-white/90">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg p-2 text-white"
          aria-expanded={open}
          aria-label="Toggle admin menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="mt-3 max-h-[60vh] overflow-y-auto pb-2" aria-label="Admin mobile navigation">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80",
                      active && "bg-white/15 text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/admin/logout"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80"
              >
                Logout
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
