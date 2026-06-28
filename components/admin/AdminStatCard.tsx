import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function AdminStatCard({ label, value, icon: Icon, trend, className }: AdminStatCardProps) {
  return (
    <div className={cn("admin-card p-5 transition-transform hover:-translate-y-0.5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-text-grey">{label}</p>
          <p className="mt-2 font-primary text-2xl font-semibold text-text-dark">{value}</p>
          {trend && <p className="mt-1 text-xs text-green-dark">{trend}</p>}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-dark/10 text-green-dark">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </div>
  );
}
