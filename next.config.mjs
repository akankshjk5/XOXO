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
    return [
      {
        source: "/invoices/:path*",
        destination: "/api/invoices/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
