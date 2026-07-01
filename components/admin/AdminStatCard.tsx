import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
  animate?: boolean;
}

export function AdminStatCard({ label, value, icon: Icon, trend, className, animate }: AdminStatCardProps) {
  const numeric = typeof value === "number";
  return (
    <div className={cn("admin-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-text-grey">{label}</p>
          <p className="mt-2 font-primary text-2xl font-semibold text-text-dark tabular-nums">
            {numeric && animate ? <CountUp end={value} duration={1.2} /> : value}
          </p>
          {trend && <p className="mt-1 text-xs text-green-dark">{trend}</p>}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-dark/10 text-green-dark">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </div>
  );
}
