import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { LoadingSkeleton } from "@/components/motion";

export const metadata = {
  title: "My Dashboard",
};

function DashboardFallback() {
  return (
    <div className="pt-[88px] max-w-[1280px] mx-auto px-4 sm:px-6 pb-16">
      <LoadingSkeleton className="h-14 w-64 rounded-xl mb-8" />
      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <div className="hidden lg:flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <LoadingSkeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<DashboardFallback />}>
        <DashboardClient />
      </Suspense>
    </RequireAuth>
  );
}
