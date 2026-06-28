"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HERO_BG } from "@/lib/images";
import { DESTINATION_IMAGES } from "@/lib/images";

const POPULAR = [
  { name: "Bali", image: DESTINATION_IMAGES.bali },
  { name: "Switzerland", image: DESTINATION_IMAGES.switzerland },
  { name: "Japan", image: DESTINATION_IMAGES.japan },
  { name: "Iceland", image: DESTINATION_IMAGES.iceland },
];

export function LoginHeroPanel() {
  return (
    <div className="relative hidden min-h-full overflow-hidden lg:block lg:flex-1">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
      >
        <Image
          src={HERO_BG}
          alt="Scenic mountain road at golden hour"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-green-dark/60 to-black/50" />

      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-bright/90">
            XOXO Travels
          </p>
          <h1 className="mt-4 max-w-md font-primary text-4xl font-semibold leading-tight text-white xl:text-5xl">
            Explore the World with XOXO
          </h1>
          <blockquote className="mt-6 max-w-sm border-l-2 border-green-bright/60 pl-4 text-lg text-white/85">
            &ldquo;Every journey begins with one click.&rdquo;
          </blockquote>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/60">
            Popular
          </p>
          <div className="flex flex-wrap gap-3">
            {POPULAR.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-md"
              >
                <span className="relative h-6 w-6 overflow-hidden rounded-full">
                  <Image src={dest.image} alt="" fill className="object-cover" sizes="24px" />
                </span>
                <span>{dest.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
