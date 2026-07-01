"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";

interface WishlistHeartProps {
  packageId?: string;
  destinationId?: string;
  className?: string;
}

export function WishlistHeart({ packageId, destinationId, className }: WishlistHeartProps) {
  const { isPackageSaved, isDestinationSaved, togglePackage, toggleDestination } = useWishlist();

  const saved = packageId
    ? isPackageSaved(packageId)
    : destinationId
      ? isDestinationSaved(destinationId)
      : false;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (packageId) await togglePackage(packageId);
    else if (destinationId) await toggleDestination(destinationId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      className={cn(
        "absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full",
        "bg-white/95 backdrop-blur-sm border border-[#E8E8E8] shadow-sm",
        "transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          saved ? "fill-red-500 text-red-500" : "text-[#0E5C43] hover:text-red-400"
        )}
      />
    </button>
  );
}
