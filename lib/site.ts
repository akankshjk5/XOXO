/** Canonical production site URL for SEO, OG, and sitemap. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://xoxo-puce.vercel.app";

/** Customer support line shown on booking confirmation and contact surfaces. */
export const SUPPORT_PHONE =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || "+91 9240204872";

export function supportPhoneHref(phone = SUPPORT_PHONE): string {
  return `tel:${phone.replace(/[\s-]/g, "")}`;
}


