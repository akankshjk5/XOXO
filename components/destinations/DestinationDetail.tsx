"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { destinationsAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AnimatedCard, LoadingSkeleton, RevealOnScroll, StaggerReveal, StaggerRevealItem } from "@/components/motion";

interface Pkg {
  _id: string;
  title: string;
  images?: string[];
  pricePerPerson: number;
  durationDays: number;
}
interface Dest {
  name: string;
  country: string;
  tagline?: string;
  description?: string;
  coverImage?: string;
  bestSeason?: string;
  currency?: string;
  isVisaFree?: boolean;
  packages?: Pkg[];
}

export function DestinationDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [dest, setDest] = useState<Dest | null>(null);
  const [loading, setLoading] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await destinationsAPI.getBySlug(slug);
        setDest(data.data);
      } catch {
        toast.error("Couldn't load this destination.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-[68px]">
        <LoadingSkeleton className="h-[46vh] min-h-[320px] w-full rounded-none" rounded="sm" />
        <div className="container-x py-8 space-y-4">
          <LoadingSkeleton className="h-4 w-full max-w-2xl" />
          <LoadingSkeleton className="h-4 w-3/4 max-w-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-64 w-full" rounded="xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dest) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-5xl mb-3">🗺️</p>
        <p className="text-text-grey mb-4">Destination not found.</p>
        <Link href="/destinations" className="text-green-neon font-semibold">
          ← Back to destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-[68px]">
      <div className="relative h-[46vh] min-h-[320px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={reduced ? false : { scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={dest.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80"}
            alt={dest.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <motion.div
          className="absolute bottom-0 left-0 right-0 container-x pb-8"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.2 }}
        >
          <p className="text-white/80 text-sm flex items-center gap-1.5 mb-2">
            <MapPin className="h-4 w-4" /> {dest.country}
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{dest.name}</h1>
          {dest.tagline && <p className="text-white/85 mt-2 text-lg">{dest.tagline}</p>}
        </motion.div>
      </div>

      <div className="container-x py-8">
        {dest.description && (
          <RevealOnScroll>
            <p className="text-text-grey leading-relaxed max-w-3xl mb-6 text-[15px]">{dest.description}</p>
          </RevealOnScroll>
        )}

        <RevealOnScroll delay={0.1}>
          <div className="flex flex-wrap gap-3 mb-10">
            {dest.bestSeason && (
              <span className="px-3 py-1.5 rounded-full bg-off-white border border-[#EBEBEB] text-sm shadow-sm">
                🗓️ Best: {dest.bestSeason}
              </span>
            )}
            {dest.currency && (
              <span className="px-3 py-1.5 rounded-full bg-off-white border border-[#EBEBEB] text-sm shadow-sm">
                💱 {dest.currency}
              </span>
            )}
            {dest.isVisaFree && (
              <span className="px-3 py-1.5 rounded-full bg-green-bright/20 border border-green-neon text-sm text-green-dark font-medium">
                ✅ Visa Free for Indians
              </span>
            )}
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="section-heading mb-5">Packages in {dest.name}</h2>
        </RevealOnScroll>

        {dest.packages?.length ? (
          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dest.packages.map((p) => (
              <StaggerRevealItem key={p._id}>
                <Link href={`/packages/${p._id}`} className="block group">
                  <AnimatedCard className="overflow-hidden p-0 border-[#EBEBEB]">
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={p.images?.[0] || dest.coverImage || ""}
                        alt={p.title}
                        fill
                        sizes="33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[15px] line-clamp-2 mb-2 group-hover:text-green-dark transition-colors">
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-text-grey mb-2">
                        <Clock className="h-3.5 w-3.5" /> {p.durationDays} days
                      </div>
                      <p className="text-lg font-bold text-green-dark">{formatPrice(p.pricePerPerson)}</p>
                    </div>
                  </AnimatedCard>
                </Link>
              </StaggerRevealItem>
            ))}
          </StaggerReveal>
        ) : (
          <p className="text-text-grey">No packages yet for this destination.</p>
        )}
      </div>
    </div>
  );
}
