"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Client-side route guard. Redirects unauthenticated users to /login
 * with a redirect back to the originally requested page.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!token && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      setAllowed(false);
    } else {
      setAllowed(true);
    }
  }, [token, user, pathname, router, hydrated]);

  if (!hydrated || !allowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-grey">
        Loading your account…
      </div>
    );
  }

  return <>{children}</>;
}
