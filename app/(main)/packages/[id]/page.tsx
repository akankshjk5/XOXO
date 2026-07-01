import { Suspense } from "react";
import type { Metadata } from "next";
import { PackageDetail } from "@/components/packages/PackageDetail";
import { buildPackageMetadata, buildPackageJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { resolveApiUrl } from "@/lib/api-config";

interface PageProps {
  params: { id: string };
}

async function fetchPackage(id: string) {
  try {
    const res = await fetch(resolveApiUrl(`/packages/${id}`), {
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
  const pkg = await fetchPackage(params.id);
  if (!pkg) {
    return { title: "Package | XOXO Travels" };
  }
  return buildPackageMetadata(pkg);
}

export default async function PackageDetailPage({ params }: PageProps) {
  const pkg = await fetchPackage(params.id);
  const jsonLd = pkg ? buildPackageJsonLd(pkg) : null;
  const breadcrumb = pkg
    ? buildBreadcrumbJsonLd([
        { name: "Home", url: SITE_URL },
        { name: "Packages", url: `${SITE_URL}/packages` },
        { name: pkg.title, url: `${SITE_URL}/packages/${params.id}` },
      ])
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumb && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
        />
      )}
      <Suspense fallback={<div className="pt-32 text-center text-text-grey">Loading package…</div>}>
        <PackageDetail />
      </Suspense>
    </>
  );
}
