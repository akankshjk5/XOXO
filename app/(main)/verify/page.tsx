import { RequireAuth } from "@/components/auth/RequireAuth";
import { VerifyClient } from "@/components/social/VerifyClient";

export const metadata = { title: "Get Verified | XOXO Travels" };

export default function VerifyPage() {
  return (
    <RequireAuth>
      <VerifyClient />
    </RequireAuth>
  );
}
