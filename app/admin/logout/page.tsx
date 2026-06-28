"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AdminLogoutPage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    logout().finally(() => router.replace("/login"));
  }, [logout, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-text-grey">
      Signing out…
    </div>
  );
}
