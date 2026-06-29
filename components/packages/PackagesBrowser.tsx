"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, Clock, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { packagesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import {
  PACKAGE_CATEGORIES,
  CATEGORY_LABELS,
  resolvePackageCategoryFilter,
} from "@/lib/travel-categories";
import {
  AnimatedTabs,
  EmptyState,
  SkeletonCard,
  StaggerReveal,
  StaggerRevealItem,
} from "@/components/motion";

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
}

const BUDGET_FILTERS = [
  { id: "all", label: "All Budgets" },
  { id: "u50", label: "Under ₹50K", min: 0, max: 50000 },
  { id: "50-150", label: "₹50K–1.5L", min: 50000, max: 150000 },
  { id: "150-250", label: "₹1.5L–2.5L", min: 150000, max: 250000 },
  { id: "lux", label: "Luxury", min: 250000, max: undefined },
];
const DURATION_TABS = [
  { id: "all", label: "Any Duration" },
  { id: "3-5", label: "3-5 Days" },
  { id: "6-9", label: "6-9 Days" },
  { id: "10+", label: "10+ Days" },
];
const CATEGORIES = ["all", ...PACKAGE_CATEGORIES];
const SORTS = [
  { id: "popular", label: "Most Popular" },
  { id: "price_asc", label: "Price: Low → High" },
  { id: "price_desc", label: "Price: High → Low" },
  { id: "rating", label: "Top Rated" },
];

export function PackagesBrowser() {
  const searchParams = useSearchParams();
  const initialType = searchParams ? (searchParams.get("type") || "all") : "all";
  const initialSearch = searchParams ? (searchParams.get("search") || searchParams.get("q") || "") : "";

  const [items, setItems] = useState<ApiPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState("all");
  const [duration, setDuration] = useState("all");
  const [category, setCategory] = useState(initialType);
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState(initialSearch);
  const [debounced, setDebounced] = useState(initialSearch);
  const [total, setTotal] = useState(0);

  // debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    const b = BUDGET_FILTERS.find((x) => x.id === budget);
    const params: Record<string, string | number> = { sort, limit: 24 };
    if (category !== "all") {
      const mapped = resolvePackageCategoryFilter(category);
      if (mapped.type) params.type = mapped.type;
      if (mapped.category) params.category = mapped.category;
    }
    if (duration !== "all") params.duration = duration;
    if (debounced) params.search = debounced;
    if (b && b.id !== "all") {
      if (b.min !== undefined) params.minPrice = b.min;
      if (b.max !== undefined) params.maxPrice = b.max;
    }
    try {
      const { data } = await packagesAPI.getAll(params);
      setItems(data.data || []);
      setTotal(data.pagination?.total ?? data.data?.length ?? 0);
    } catch {
      toast.error("Couldn't load packages. Is the API running?");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [budget, duration, category, sort, debounced]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const categoryTabs = CATEGORIES.map((c) => ({
    id: c,
    label: CATEGORY_LABELS[c] || c,
  }));

  return (
    <div className="container-x section">
      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 bg-white border border-[#E0E0E0] rounded-full px-4 py-2.5">
          <Search className="h-4 w-4 text-text-grey shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages…"
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E0E0E0] rounded-full px-4 py-2.5">
          <SlidersHorizontal className="h-4 w-4 text-text-grey" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm outline-none bg-transparent cursor-pointer"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <AnimatedTabs tabs={BUDGET_FILTERS.map((b) => ({ id: b.id, label: b.label }))} active={budget} onChange={setBudget} />
        <AnimatedTabs tabs={DURATION_TABS} active={duration} onChange={setDuration} />
        <AnimatedTabs tabs={categoryTabs} active={category} onChange={setCategory} />
      </div>

      {/* Result count */}
      {!loading && (
        <p className="text-sm text-text-grey mb-4">
          {total} package{total === 1 ? "" : "s"} found
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🧳"
          title="No packages match"
          description="Try widening your budget, duration, or search filters."
          cta="Clear filters"
          href="/packages"
        />
      ) : (
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((pkg) => (
            <StaggerRevealItem key={pkg._id}>
              <Link
                href={`/packages/${pkg._id}`}
                className="rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white card-lift block group shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
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
            </StaggerRevealItem>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
