"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WishlistHeart } from "@/components/wishlist/WishlistHeart";
export interface ValidatedDestinationCard {
  id: string;
  destinationId?: string;
  subLabel: string;
  name: string;
  slug: string;
  image: string;
  href: string;
}

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

interface DestinationCarouselProps {
  title: string;
  destinations: ValidatedDestinationCard[];
  bg?: "white" | "off-white";
  action?: React.ReactNode;
}

export function DestinationCarousel({ title, destinations, bg = "white", action }: DestinationCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  return (
    <section className={bg === "off-white" ? "bg-off-white py-12 md:py-14" : "bg-white py-12 md:py-14"}>
      <div className="container-x">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="section-heading">{title}</h2>
          <div className="flex items-center gap-3">
            {action}
            <div className="flex gap-2">
            <button onClick={() => scroll("left")} className="carousel-btn" aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll("right")} className="carousel-btn" aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </button>
            </div>
          </div>
        </div>

        <motion.div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {destinations.map((dest) => (
            <motion.div
              key={dest.id}
              variants={cardVariants}
              className="shrink-0 w-[220px] snap-start"
            >
              <div className="relative">
                {dest.destinationId && <WishlistHeart destinationId={dest.destinationId} />}
                <Link href={dest.href} className="block group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden card-lift shadow-[0_4px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/5 group-hover:ring-green-bright/30 transition-all duration-500">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="220px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-sm">→</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] uppercase text-white/70 tracking-widest font-medium mb-1">
                      {dest.subLabel}
                    </p>
                    <p className="text-2xl font-bold text-white leading-tight">{dest.name}</p>
                  </div>
                </div>
              </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
