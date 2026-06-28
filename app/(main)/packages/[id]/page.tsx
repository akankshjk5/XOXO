import type { Metadata } from "next";
import { PackageDetail } from "@/components/packages/PackageDetail";
import { buildPackageMetadata, buildPackageJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
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
        { name: "Home", url: "https://xoxotravels.com" },
        { name: "Packages", url: "https://xoxotravels.com/packages" },
        { name: pkg.title, url: `https://xoxotravels.com/packages/${params.id}` },
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
      <PackageDetail />
    </>
  );
}
