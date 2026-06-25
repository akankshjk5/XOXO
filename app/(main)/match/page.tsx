import { RequireAuth } from "@/components/auth/RequireAuth";
import { MatchClient } from "@/components/social/MatchClient";

export const metadata = { title: "Travel Match | XOXO Travels" };

export default function MatchPage() {
  return (
    <RequireAuth>
      <MatchClient />
    </RequireAuth>
  );
}
