import { Suspense } from "react";
import Image from "next/image";
import { PremiumLoginForm } from "@/components/auth/PremiumLoginForm";
import { LoginHeroPanel } from "@/components/auth/LoginHeroPanel";
import { HERO_BG } from "@/lib/images";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LoadingSkeleton } from "@/components/motion";

export const metadata = {
  title: "Sign In | XOXO Travels",
  description: "Secure sign in to your XOXO Travels account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-off-white lg:flex">
      {/* Mobile hero */}
      <div className="relative h-52 shrink-0 overflow-hidden lg:hidden">
        <Image src={HERO_BG} alt="" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-green-dark/85" />
        <div className="relative z-10 flex h-full flex-col justify-end p-6">
          <BrandLogo variant="auth" href="/" className="brightness-110" priority />
          <h1 className="mt-4 text-2xl font-semibold text-white">Explore the World with XOXO</h1>
          <p className="mt-2 text-sm text-white/75">
            &ldquo;Every journey begins with one click.&rdquo;
          </p>
        </div>
      </div>

      <LoginHeroPanel />
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
            <LoadingSkeleton className="h-10 w-full max-w-sm rounded-xl" />
            <LoadingSkeleton className="h-10 w-full max-w-sm rounded-xl" />
            <LoadingSkeleton className="h-11 w-full max-w-sm rounded-full" />
          </div>
        }
      >
        <PremiumLoginForm />
      </Suspense>
    </div>
  );
}
