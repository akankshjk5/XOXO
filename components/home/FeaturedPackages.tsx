"use client";

import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PREMIUM_PACKAGES } from "@/lib/home-data";
import { FadeIn } from "@/components/motion/FadeIn";
import { formatPrice } from "@/lib/utils";

export function FeaturedPackages() {
  return (
    <section className="section bg-surface">
      <div className="container-x">
        <FadeIn className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            Most Booked Packages This Month
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Curated trips with flights, hotels & experiences included
          </p>
        </FadeIn>

        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {PREMIUM_PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 w-[340px] sm:w-[380px]"
            >
              <Link href={`/package/${pkg.id}`} className="group block">
                <article className="card-premium overflow-hidden hover-lift h-full flex flex-col">
                  {/* Image area */}
                  <div
                    className="relative h-[200px] flex items-center justify-center overflow-hidden"
                    style={{ background: pkg.gradient }}
                  >
                    <span className="text-7xl opacity-50 group-hover:scale-110 transition-transform duration-500">
                      {pkg.emoji}
                    </span>
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-text-primary px-2.5 py-1 rounded-full">
                      🔥 {pkg.bookings} bookings this month
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-navy transition-colors">
                      {pkg.title}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {pkg.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-navy bg-navy/5 px-2 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 mb-4">
                      <Star className="h-3.5 w-3.5 fill-orange text-orange" />
                      <span className="text-sm font-semibold">{pkg.rating}</span>
                      <span className="text-xs text-text-secondary">
                        · {(pkg.reviews / 1000).toFixed(1)}k reviews
                      </span>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-border">
                      <div>
                        <span className="text-xs text-text-secondary line-through">
                          {formatPrice(pkg.originalPrice)}
                        </span>
                        <p className="text-xl font-bold text-navy">
                          {formatPrice(pkg.price)}
                          <span className="text-xs font-normal text-text-secondary">/person</span>
                        </p>
                      </div>
                      <span className="btn-navy-outline !py-2 !px-4 !text-xs group-hover:!bg-navy group-hover:!text-white">
                        View Details <ArrowRight className="h-3 w-3 inline ml-0.5" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
