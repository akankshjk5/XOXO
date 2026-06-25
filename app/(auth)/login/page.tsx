import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-surface">
      <Suspense fallback={<div className="text-text-secondary">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
