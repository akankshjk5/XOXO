"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token && !user) {
      router.replace("/login?redirect=/admin");
      return;
    }
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, token, router]);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-grey">
        Checking admin access…
      </div>
    );
  }

  return <>{children}</>;
}
