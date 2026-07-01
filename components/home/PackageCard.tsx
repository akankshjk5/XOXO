import Image from "next/image";
import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { formatCategoryLabel } from "@/lib/travel-categories";
import { formatPrice, cn } from "@/lib/utils";
import { DEFAULT_PACKAGE_IMAGE } from "@/lib/images";
import type { Package } from "@/types";

interface PackageCardProps {
  pkg: Package;
  className?: string;
}

export function PackageCard({ pkg, className }: PackageCardProps) {
  const image = pkg.images?.[0] || DEFAULT_PACKAGE_IMAGE;

  return (
    <Link href={`/packages/${pkg.id}`} prefetch>
      <article
        className={cn(
          "rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white card-lift group cursor-pointer shadow-premium",
          className
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={image}
            alt={pkg.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
          />
          {pkg.badge && (
            <span className="absolute top-3 left-3 rounded-pill bg-white/95 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold text-text-primary capitalize shadow-sm">
              {pkg.badge}
            </span>
          )}
        </div>

        <div className="p-4">
          {pkg.rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
              <span className="text-sm font-semibold text-text-primary">{pkg.rating}</span>
              <span className="text-xs text-text-muted">({pkg.review_count})</span>
            </div>
          )}

          <h3 className="font-semibold text-[15px] text-text-primary line-clamp-2 mb-2 leading-snug group-hover:text-brand-green transition-colors">
            {pkg.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
            {pkg.duration_days && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {pkg.duration_days} nights
              </span>
            )}
            {pkg.category && (
              <span>· {formatCategoryLabel(pkg.category)}</span>
            )}
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-border/60">
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wide">From</p>
              <p className="text-lg font-bold text-text-primary">
                {pkg.price_per_person ? formatPrice(pkg.price_per_person) : "—"}
                <span className="text-xs font-normal text-text-muted"> /person</span>
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-green">View Details →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
