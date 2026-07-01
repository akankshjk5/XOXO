import type { Metadata } from "next";
import { DestinationDetail } from "@/components/destinations/DestinationDetail";
import {
  buildDestinationMetadata,
  buildDestinationJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { resolveApiUrl } from "@/lib/api-config";

interface PageProps {
  params: { slug: string };
}

async function fetchDestination(slug: string) {
  try {
    const res = await fetch(resolveApiUrl(`/destinations/slug/${slug}`), {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const dest = await fetchDestination(params.slug);
  if (!dest) return { title: "Destination | XOXO Travels" };
  return buildDestinationMetadata({
    name: dest.name,
    slug: params.slug,
    country: dest.country,
    description: dest.description,
    coverImage: dest.coverImage,
    tagline: dest.tagline,
  });
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const dest = await fetchDestination(params.slug);
  const jsonLd = dest
    ? buildDestinationJsonLd({
        name: dest.name,
        slug: params.slug,
        country: dest.country,
        description: dest.description,
        coverImage: dest.coverImage,
        tagline: dest.tagline,
      })
    : null;
  const breadcrumb = dest
    ? buildBreadcrumbJsonLd([
        { name: "Home", url: SITE_URL },
        { name: "Destinations", url: `${SITE_URL}/destinations` },
        { name: dest.name, url: `${SITE_URL}/destinations/${params.slug}` },
      ])
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {breadcrumb && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      )}
      <DestinationDetail />
    </>
  );
}
