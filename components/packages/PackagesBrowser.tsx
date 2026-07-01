"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { packagesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { resolvePackageCategoryFilter } from "@/lib/travel-categories";
import type { FilterValues } from "@/lib/premium-filter-types";
import {
  PACKAGE_FILTER_DEFAULTS,
  PACKAGE_FILTER_SECTIONS,
} from "@/lib/filter-presets";
import { EmptyState, SkeletonCard, StaggerReveal, StaggerRevealItem } from "@/components/motion";
import { PremiumFilter } from "@/components/filters/PremiumFilter";
import { WishlistHeart } from "@/components/wishlist/WishlistHeart";

interface ApiPackage {
  _id: string;
  title: string;
  images?: string[];
  pricePerPerson: number;
  originalPrice?: number;
  durationDays: number;
  durationNights?: number;
  category?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  destination?: { name?: string; slug?: string };
  isVisaFree?: boolean;
}

const BUDGET_MAP: Record<string, { min?: number; max?: number }> = {
  u50: { min: 0, max: 50000 },
  "50-150": { min: 50000, max: 150000 },
  "150-250": { min: 150000, max: 250000 },
  lux: { min: 250000 },
};

export function PackagesBrowser() {
  const searchParams = useSearchParams();
  const initialType = searchParams ? searchParams.get("type") || "all" : "all";
  const initialSearch = searchParams ? searchParams.get("search") || searchParams.get("q") || "" : "";

  const [items, setItems] = useState<ApiPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    ...PACKAGE_FILTER_DEFAULTS,
    category: initialType,
    search: initialSearch,
  });
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 24;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const fetchPackages = useCallback(async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    const b = BUDGET_MAP[filters.budget];
    const params: Record<string, string | number> = {
      sort: filters.sort === "newest" ? "newest" : filters.sort,
      limit: PAGE_SIZE,
      page: pageNum,
    };
    if (filters.category !== "all") {
      if (filters.category === "visa-free") {
        params.visaFree = "true";
      } else {
        const mapped = resolvePackageCategoryFilter(filters.category);
        if (mapped.type) params.type = mapped.type;
        if (mapped.category) params.category = mapped.category;
      }
    }
    if (filters.duration !== "all") params.duration = filters.duration;
    if (debouncedSearch) params.search = debouncedSearch;
    if (b) {
      if (b.min !== undefined) params.minPrice = b.min;
      if (b.max !== undefined) params.maxPrice = b.max;
    }
    try {
      const { data } = await packagesAPI.getAll(params);
      const next = data.data || [];
      setItems((prev) => (append ? [...prev, ...next] : next));
      setTotal(data.pagination?.total ?? next.length);
      setPage(pageNum);
    } catch {
      toast.error("Couldn't load packages. Is the API running?");
      if (!append) setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters.budget, filters.duration, filters.category, filters.sort, debouncedSearch]);

  useEffect(() => {
    fetchPackages(1, false);
  }, [fetchPackages]);

  const activeLabel = useMemo(() => {
    const parts: string[] = [];
    if (filters.budget !== "all") parts.push("budget");
    if (filters.duration !== "all") parts.push("duration");
    if (filters.category !== "all") parts.push("category");
    if (filters.sort !== "popular") parts.push("sort");
    if (filters.search) parts.push("search");
    return parts.length ? `${total} results` : `${total} packages`;
  }, [filters, total]);

  return (
    <div className="container-x section-compact">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-text-grey">{activeLabel}</p>
        <PremiumFilter
          sections={PACKAGE_FILTER_SECTIONS}
          values={filters}
          defaults={PACKAGE_FILTER_DEFAULTS}
          onChange={setFilters}
          title="Package filters"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🧳"
          title="No packages match"
          description="Try widening your budget, duration, or search filters."
          cta="Reset filters"
          href="/packages"
        />
      ) : (
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((pkg) => (
            <StaggerRevealItem key={pkg._id}>
              <div className="relative">
                <WishlistHeart packageId={pkg._id} />
                <Link
                  href={`/packages/${pkg._id}`}
                  className="rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white card-lift block group shadow-premium"
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={pkg.images?.[0] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"}
                      alt={pkg.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {pkg.badge && (
                      <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold capitalize shadow-sm">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    {pkg.rating ? (
                      <div className="flex items-center gap-1 mb-1.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">{pkg.rating}</span>
                        <span className="text-xs text-text-grey">({pkg.reviewCount})</span>
                      </div>
                    ) : null}
                    <h3 className="font-semibold text-[15px] text-text-dark line-clamp-2 mb-2 group-hover:text-green-dark transition-colors">
                      {pkg.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-grey mb-3">
                      <Clock className="h-3.5 w-3.5" />
                      {pkg.durationDays}D/{(pkg.durationNights ?? pkg.durationDays - 1)}N
                      {pkg.category && <span className="capitalize">· {pkg.category}</span>}
                    </div>
                    <div className="flex items-end justify-between pt-2 border-t border-[#EBEBEB]">
                      <div>
                        <p className="text-[11px] text-text-grey uppercase">From</p>
                        <p className="text-lg font-bold text-green-dark">{formatPrice(pkg.pricePerPerson)}</p>
                      </div>
                      <span className="text-xs font-semibold text-green-neon">View Details →</span>
                    </div>
                  </div>
                </Link>
              </div>
            </StaggerRevealItem>
          ))}
        </StaggerReveal>
      )}

      {!loading && items.length > 0 && items.length < total && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => fetchPackages(page + 1, true)}
            disabled={loadingMore}
            className="rounded-full border border-green-dark text-green-dark font-semibold px-8 py-3 min-h-[44px] hover:bg-green-dark/5 transition-colors disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : `Load more (${items.length} of ${total})`}
          </button>
        </div>
      )}
    </div>
  );
}
