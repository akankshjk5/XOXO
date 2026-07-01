/** Canonical destination URL helpers — slugs must match backend `Destination.slug`. */

import { getDestImage } from "@/lib/images";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidDestinationSlug(slug: unknown): slug is string {
  return typeof slug === "string" && slug.length > 0 && SLUG_PATTERN.test(slug);
}

/**
 * Build a destination detail path. Invalid slugs fall back to /destinations
 * and log in development so bad data cannot ship silently.
 */
export function buildDestinationHref(slug: unknown): string {
  if (!isValidDestinationSlug(slug)) {
    return "/destinations";
  }
  return `/destinations/${slug}`;
}

export interface DestinationLinkInput {
  _id?: string;
  name: string;
  slug: string;
  tagline?: string;
  coverImage?: string;
  isVisaFree?: boolean;
  isTrending?: boolean;
}

/** Map API destination to carousel card; drops entries without a valid slug. */
export function toDestinationCard(
  dest: DestinationLinkInput,
  subLabel: string,
  id?: string
): { id: string; destinationId?: string; subLabel: string; name: string; slug: string; image: string; href: string } | null {
  if (!isValidDestinationSlug(dest.slug)) {
    return null;
  }
  return {
    id: id || dest._id || dest.slug,
    destinationId: dest._id,
    subLabel,
    name: dest.name,
    slug: dest.slug,
    image: dest.coverImage || getDestImage(dest.slug),
    href: buildDestinationHref(dest.slug),
  };
}

/** Assert every slug resolves (for tests). Returns list of invalid entries. */
export function findInvalidDestinationLinks(
  destinations: { name: string; slug: string }[]
): { name: string; slug: string }[] {
  return destinations.filter((d) => !isValidDestinationSlug(d.slug));
}
