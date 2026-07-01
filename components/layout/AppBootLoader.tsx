import { BrandLogo } from "@/components/brand/BrandLogo";

export function AppBootLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-off-white px-4">
      <BrandLogo variant="auth" linked={false} className="mb-8 opacity-90" />
      <div className="flex gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-green-neon animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="sr-only">Loading XOXO Travels</p>
    </div>
  );
}
