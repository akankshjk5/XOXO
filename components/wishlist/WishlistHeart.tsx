"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION, EASE_OUT, SPRING } from "@/lib/motion";

interface WishlistHeartProps {
  packageId?: string;
  destinationId?: string;
  className?: string;
}

export function WishlistHeart({ packageId, destinationId, className }: WishlistHeartProps) {
  const { isPackageSaved, isDestinationSaved, togglePackage, toggleDestination } = useWishlist();
  const reduced = useReducedMotion();
  const [pending, setPending] = useState(false);

  const saved = packageId
    ? isPackageSaved(packageId)
    : destinationId
      ? isDestinationSaved(destinationId)
      : false;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);
    try {
      if (packageId) await togglePackage(packageId);
      else if (destinationId) await toggleDestination(destinationId);
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      aria-busy={pending}
      whileTap={reduced ? undefined : { scale: 0.9 }}
      animate={saved && !reduced ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT }}
      className={cn(
        "absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full",
        "bg-white/95 backdrop-blur-sm border border-[#E8E8E8] shadow-sm",
        "transition-shadow duration-200 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright focus-visible:ring-offset-2",
        "disabled:opacity-70",
        className
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin text-text-grey" aria-hidden />
      ) : (
        <motion.span
          key={saved ? "saved" : "idle"}
          initial={reduced ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING.snappy}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              saved ? "fill-red-500 text-red-500" : "text-[#0E5C43] hover:text-red-400"
            )}
          />
        </motion.span>
      )}
    </motion.button>
  );
}
