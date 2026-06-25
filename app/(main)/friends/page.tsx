import { RequireAuth } from "@/components/auth/RequireAuth";
import { FriendsClient } from "@/components/social/FriendsClient";

export const metadata = { title: "Friends | XOXO Travels" };

export default function FriendsPage() {
  return (
    <RequireAuth>
      <FriendsClient />
    </RequireAuth>
  );
}
