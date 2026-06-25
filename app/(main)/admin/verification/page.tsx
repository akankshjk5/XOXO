import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { VerificationQueue } from "@/components/admin/VerificationQueue";

export const metadata = { title: "Admin — Verification | XOXO Travels" };

export default function AdminVerificationPage() {
  return (
    <RequireAdmin>
      <VerificationQueue />
    </RequireAdmin>
  );
}
