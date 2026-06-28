"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { useAuthStore } from "@/store/authStore";
import { mapUserToAdminRole } from "@/lib/admin/navigation";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const adminRole = mapUserToAdminRole(user?.role);

  return (
    <RequireAdmin>
      <div className="admin-shell dark-ready flex min-h-screen">
        <div className="hidden shrink-0 lg:block">
          {adminRole && <AdminSidebar adminRole={adminRole} />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {adminRole && <AdminMobileNav adminRole={adminRole} />}
          {children}
        </div>
      </div>
    </RequireAdmin>
  );
}
