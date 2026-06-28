/**
 * Resolve upstream API origin for Vercel rewrites (no /api suffix).
 * Set API_PROXY_TARGET on Vercel, or derive from NEXT_PUBLIC_API_URL.
 */
function getApiProxyOrigin() {
  const explicit = process.env.API_PROXY_TARGET?.trim();
  if (explicit) return explicit.replace(/\/+$/, "").replace(/\/api$/, "");

  const fromPublic = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromPublic) {
    return fromPublic.replace(/\/+$/, "").replace(/\/api$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return "https://xoxo-production-2503.up.railway.app";
  }

  return "http://localhost:5000";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "http", hostname: "localhost", port: "5000" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/itinerary", destination: "/concierge", permanent: true },
      { source: "/itinerary/:path*", destination: "/concierge", permanent: true },
      { source: "/solo-match", destination: "/match", permanent: true },
      { source: "/flights", destination: "/transport", permanent: false },
      { source: "/hotels", destination: "/packages", permanent: false },
      { source: "/activities", destination: "/packages", permanent: false },
      { source: "/insurance", destination: "/packages", permanent: false },
      { source: "/ai-planner", destination: "/concierge", permanent: false },
    ];
  },
  async rewrites() {
    const origin = getApiProxyOrigin();

    return [
      // App Router handles /api/intro-videos — all other /api/* proxies to Railway
      {
        source: "/api/:path((?!intro-videos).*)",
        destination: `${origin}/api/:path`,
      },
      {
        source: "/invoices/:path*",
        destination: `${origin}/api/invoices/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${origin}/api/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
