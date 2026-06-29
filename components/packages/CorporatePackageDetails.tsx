"use client";

import { Building2, Users, Check } from "lucide-react";
import { CORPORATE_FEATURES } from "@/lib/travel-categories";
import type { CorporatePackageInfo } from "@/lib/package-types";

interface Props {
  corporate?: CorporatePackageInfo | null;
  category?: string;
}

export function CorporatePackageDetails({ corporate, category }: Props) {
  if (category !== "corporate" && !corporate) return null;

  const activeFeatures = CORPORATE_FEATURES.filter(
    (f) => corporate?.[f.key as keyof CorporatePackageInfo]
  );

  return (
    <section className="rounded-2xl border border-[#E0E0E0] bg-gradient-to-br from-slate-50 to-white p-5 sm:p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-green-dark" />
        <h2 className="text-lg font-semibold text-text-dark">Corporate Travel</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
        {corporate?.companyName && (
          <div>
            <p className="text-text-grey text-xs uppercase tracking-wide">Company</p>
            <p className="font-medium text-text-dark">{corporate.companyName}</p>
          </div>
        )}
        {corporate?.employeeCount && (
          <div>
            <p className="text-text-grey text-xs uppercase tracking-wide flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Team size
            </p>
            <p className="font-medium text-text-dark">{corporate.employeeCount}+ employees</p>
          </div>
        )}
      </div>

      {activeFeatures.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-2">
          {activeFeatures.map((f) => (
            <li key={f.key} className="flex items-center gap-2 text-sm text-text-dark">
              <Check className="h-4 w-4 text-green-bright shrink-0" />
              {f.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
