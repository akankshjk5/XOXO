import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "My Dashboard | XOXO Travels",
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardClient />
    </RequireAuth>
  );
}
