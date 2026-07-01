"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION } from "@/lib/motion";

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
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "relative overflow-hidden bg-gray-100",
        roundedMap[rounded],
        className
      )}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={reduced ? undefined : { x: ["-100%", "100%"] }}
        transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white shadow-premium" aria-busy="true">
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

export function SkeletonPackageDetail() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-6" aria-busy="true">
      <LoadingSkeleton className="h-64 sm:h-80 w-full" rounded="xl" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <LoadingSkeleton className="h-6 w-2/3" />
          <LoadingSkeleton className="h-4 w-full" />
          <LoadingSkeleton className="h-4 w-5/6" />
          <LoadingSkeleton className="h-32 w-full" rounded="xl" />
        </div>
        <LoadingSkeleton className="h-80 w-full" rounded="xl" />
      </div>
    </div>
  );
}

export function InlineLoader({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} aria-hidden />;
}
