/** Canonical production site URL for SEO, OG, and sitemap. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://xoxo-puce.vercel.app";
