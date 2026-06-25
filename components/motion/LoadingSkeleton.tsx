"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface LoadingSkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

const roundedMap = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  full: "rounded-full",
};

export function LoadingSkeleton({ className, rounded = "lg" }: LoadingSkeletonProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0.4 }}
      animate={{ opacity: reduced ? 0.6 : [0.4, 0.75, 0.4] }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
      }
      className={cn(
        "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
        !reduced && "animate-[shimmer_1.8s_ease-in-out_infinite]",
        roundedMap[rounded],
        className
      )}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white">
      <LoadingSkeleton className="h-44 w-full rounded-none" rounded="sm" />
      <div className="p-4 space-y-3">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-3 w-1/2" />
        <LoadingSkeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonDestination() {
  return <LoadingSkeleton className="aspect-[3/4] w-full" rounded="xl" />;
}
