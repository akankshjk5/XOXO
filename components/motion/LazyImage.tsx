"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-blur";
import { DURATION, EASE_OUT } from "@/lib/motion";

interface LazyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function LazyImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: LazyImageProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const show = priority || inView;

  return (
    <div
      ref={ref}
      className={cn(fill && "relative w-full h-full", "overflow-hidden bg-off-white")}
    >
      {show && !loaded && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-[shimmer_1.8s_ease-in-out_infinite] z-[1]"
          aria-hidden
        />
      )}
      {show && (
        <motion.div
          className={cn(fill && "relative w-full h-full")}
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : DURATION.normal, ease: EASE_OUT }}
        >
          <Image
            src={src}
            alt={alt}
            fill={fill}
            width={width}
            height={height}
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            onLoad={() => setLoaded(true)}
            className={cn("object-cover", className)}
          />
        </motion.div>
      )}
    </div>
  );
}
