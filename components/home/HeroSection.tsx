"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

function GoogleBadge() {
  return (
    <div className="inline-flex items-center gap-2 text-white text-[13px] font-medium">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold">
        <span className="text-[#4285F4]">G</span>
      </div>
      <span>4.6</span>
      <span className="text-yellow-400">⭐</span>
      <span className="text-white/80">From 8250 reviews</span>
    </div>
  );
}

export function HeroSection() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    router.push(`/packages?${params.toString()}`);
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #2D1B0E 0%, #1A3A2A 40%, #0D3D2E 100%)",
      }}
    >
      <div className="absolute inset-0 bg-black/35" />

      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-32 w-full max-w-3xl mx-auto">
        <GoogleBadge />

        <div className="w-10 h-0.5 bg-white/60 my-5" />

        <h1 className="hero-heading mb-10 max-w-2xl">
          Create Your Sooper Hit Holiday
        </h1>

        <div className="pyt-search-glow flex items-center gap-3 px-5 py-3.5 w-full max-w-[520px]">
          <Search className="h-5 w-5 text-text-grey shrink-0" />
          <input
            type="text"
            placeholder="Search countries, cities"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-transparent outline-none text-[15px] text-text-dark placeholder:text-text-grey"
          />
        </div>
      </div>

      {/* Bottom curve into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-green-dark rounded-t-[40px]" />
    </section>
  );
}
