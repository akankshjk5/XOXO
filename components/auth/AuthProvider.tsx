"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { AppBootLoader } from "@/components/layout/AppBootLoader";

/**
 * Bootstraps the auth session on first load: if a token is present,
 * refresh the current user from the backend (/auth/me).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setHydrated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated) {
    return <AppBootLoader />;
  }

  return <>{children}</>;
}
