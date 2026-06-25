import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-green-dark text-xs font-semibold ${className}`}
      title="Verified Traveller"
    >
      <BadgeCheck className="h-3.5 w-3.5" /> Verified
    </span>
  );
}

export function TrustScore({ score }: { score?: number }) {
  if (score == null) return null;
  const color = score >= 80 ? "text-green-dark" : score >= 50 ? "text-amber-600" : "text-text-grey";
  return <span className={`text-xs font-medium ${color}`}>Trust {score}</span>;
}
