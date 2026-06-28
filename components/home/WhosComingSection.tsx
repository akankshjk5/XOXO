"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { TRAVELER_TYPES } from "@/lib/home-categories";

const grid: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function WhosComingSection() {
  return (
    <section className="bg-[#0A3828] dashed-frame px-4 sm:px-8 pt-10 pb-14 -mt-1">
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center text-white text-[22px] font-semibold mb-10"
      >
        Who&apos;s coming along?
      </motion.h2>

      <motion.div
        variants={grid}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-6 place-items-center"
      >
        {TRAVELER_TYPES.map((type) => (
          <motion.div key={type.id} variants={itemV} className="w-full flex justify-center">
          <Link
            href={`/packages?type=${type.id}`}
            className="group flex flex-col items-center cursor-pointer"
          >
            {/* Hexagon photo */}
            <div
              className="relative w-32 h-40 sm:w-36 sm:h-44 overflow-hidden transition-transform duration-300 group-hover:scale-105"
              style={{
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            >
              <Image
                src={type.image}
                alt={type.label}
                fill
                sizes="160px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <p className="mt-4 text-white font-extrabold text-base sm:text-lg uppercase tracking-wide flex items-center gap-1 group-hover:text-green-bright transition-colors">
              {type.label} <span className="opacity-70">›</span>
            </p>
          </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
