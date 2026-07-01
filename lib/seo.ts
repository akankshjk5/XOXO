import { SITE_URL } from "./site";

export interface PackageSeoInput {
  title: string;
  description?: string;
  images?: string[];
  slug?: string;
  id: string;
  pricePerPerson?: number;
  destination?: { name?: string; country?: string };
  rating?: number;
  seoTitle?: string;
  seoDescription?: string;
}

const SITE = SITE_URL;

export function buildPackageMetadata(pkg: PackageSeoInput) {
  const title = pkg.seoTitle || `${pkg.title} | XOXO Travels`;
  const description =
    pkg.seoDescription ||
    pkg.description?.slice(0, 160) ||
    `Book ${pkg.title} with XOXO Travels. Custom international holidays for Indian travellers.`;
  const image = pkg.images?.[0] || `${SITE}/og-image.png`;
  const canonical = `${SITE}/packages/${pkg.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "XOXO Travels",
      images: [{ url: image, width: 1200, height: 630, alt: pkg.title }],
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [image],
    },
  };
}

export function buildPackageJsonLd(pkg: PackageSeoInput) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.description,
    image: pkg.images?.[0],
    touristType: pkg.destination?.country,
    offers: pkg.pricePerPerson
      ? {
          "@type": "Offer",
          price: pkg.pricePerPerson,
          priceCurrency: "INR",
        }
      : undefined,
    aggregateRating: pkg.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: pkg.rating,
          bestRating: 5,
        }
      : undefined,
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface DestinationSeoInput {
  name: string;
  slug: string;
  country?: string;
  description?: string;
  coverImage?: string;
  tagline?: string;
}

export function buildDestinationMetadata(dest: DestinationSeoInput) {
  const title = `${dest.name}${dest.country ? `, ${dest.country}` : ""} Holidays`;
  const description =
    dest.tagline ||
    dest.description?.slice(0, 160) ||
    `Explore ${dest.name} holiday packages with XOXO Travels.`;
  const image = dest.coverImage || `${SITE}/og-image.png`;
  const canonical = `${SITE}/destinations/${dest.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "XOXO Travels",
      images: [{ url: image, width: 1200, height: 630, alt: dest.name }],
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [image],
    },
  };
}

export function buildDestinationJsonLd(dest: DestinationSeoInput) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: dest.name,
    description: dest.description || dest.tagline,
    image: dest.coverImage,
    containedInPlace: dest.country ? { "@type": "Country", name: dest.country } : undefined,
  };
}
