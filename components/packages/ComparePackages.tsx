"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { packagesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/motion/LoadingSkeleton";

interface Pkg {
  _id: string;
  title: string;
  images?: string[];
  pricePerPerson: number;
  durationDays: number;
  rating?: number;
  isVisaFree?: boolean;
  destination?: { name?: string; country?: string };
  category?: string;
  highlights?: string[];
}

const ROWS: { label: string; render: (p: Pkg) => string }[] = [
  { label: "Price", render: (p) => formatPrice(p.pricePerPerson) },
  { label: "Duration", render: (p) => `${p.durationDays} days` },
  {
    label: "Visa",
    render: (p) => (p.isVisaFree ? "Visa-free" : "Visa required"),
  },
  { label: "Rating", render: (p) => (p.rating ? `${p.rating} ★` : "—") },
  {
    label: "Country",
    render: (p) => p.destination?.country || "—",
  },
  { label: "Category", render: (p) => p.category || "—" },
  {
    label: "Activities",
    render: (p) => (p.highlights?.slice(0, 2).join(", ") || "—"),
  },
];

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams?.get("ids") || "";
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = idsParam.split(",").filter(Boolean).slice(0, 4);
    if (!ids.length) {
      setLoading(false);
      return;
    }
    Promise.all(ids.map((id) => packagesAPI.getById(id).then((r) => r.data.data)))
      .then(setPackages)
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, [idsParam]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 pt-24 px-4">
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="pt-32 text-center px-4">
        <p className="text-text-grey mb-4">Select packages to compare from the packages page.</p>
        <Link href="/packages" className="text-green-dark font-semibold hover:underline">
          Browse packages
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-24 pb-16">
      <h1 className="text-2xl font-bold text-text-dark mb-6">Compare Packages</h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left text-text-grey font-medium w-32"> </th>
              {packages.map((p) => (
                <th key={p._id} className="p-3 text-left align-top">
                  <Link href={`/packages/${p._id}`} className="block group">
                    <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2">
                      <Image
                        src={p.images?.[0] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400"}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="200px"
                      />
                    </div>
                    <span className="font-semibold text-text-dark line-clamp-2">{p.title}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-[#EBEBEB]">
                <td className="p-3 font-medium text-text-grey">{row.label}</td>
                {packages.map((p) => (
                  <td key={p._id} className="p-3 text-text-dark">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ComparePackagesClient() {
  return (
    <Suspense fallback={<LoadingSkeleton className="mx-auto mt-24 h-64 max-w-4xl rounded-xl" />}>
      <CompareContent />
    </Suspense>
  );
}
