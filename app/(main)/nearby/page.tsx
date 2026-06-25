import { RequireAuth } from "@/components/auth/RequireAuth";
import { NearbyClient } from "@/components/social/NearbyClient";

export const metadata = { title: "Travelers Nearby | XOXO Travels" };

export default function NearbyPage() {
  return (
    <RequireAuth>
      <NearbyClient />
    </RequireAuth>
  );
}
