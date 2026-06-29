import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "My Dashboard | XOXO Travels",
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-text-grey">Loading…</div>}>
        <DashboardClient />
      </Suspense>
    </RequireAuth>
  );
}
