"use client";

import Link from "next/link";
import Image from "next/image";
import { getRecentlyViewed } from "@/lib/package-storage";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { StoredPackageRef } from "@/lib/package-storage";

export function RecentlyViewedSection() {
  const [items, setItems] = useState<StoredPackageRef[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed().slice(0, 4));
  }, []);

  if (!items.length) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-16" aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="section-heading mb-4">
        Continue Planning
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <Link
            key={p._id}
            href={`/packages/${p._id}`}
            className="rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white card-lift block"
          >
            <div className="relative h-28">
              <Image
                src={p.images?.[0] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400"}
                alt=""
                fill
                sizes="25vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold line-clamp-2">{p.title}</p>
              <p className="text-sm font-bold text-green-dark">{formatPrice(p.pricePerPerson)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
