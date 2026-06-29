"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getUserRole, isAdminRole } from "@/lib/auth-routing";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const role = getUserRole(user);

  useEffect(() => {
    if (!hydrated) return;

    if (!token && !user) {
      router.replace("/login?redirect=/admin");
      return;
    }

    if (user && !isAdminRole(role)) {
      router.replace("/dashboard");
    }
  }, [user, token, role, router, hydrated]);

  if (!hydrated || !user || !isAdminRole(role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-grey">
        Checking admin access…
      </div>
    );
  }

  return <>{children}</>;
}
