"use client";

import { Building2, Users, MapPin, FileText, BadgeIndianRupee, Headphones } from "lucide-react";
import {
  CORPORATE_TRAVEL_TYPES,
  formatCategoryLabel,
} from "@/lib/travel-categories";

export interface CorporatePackageInfo {
  companyName?: string;
  employeeCountMin?: number;
  employeeCountMax?: number;
  meetingLocation?: string;
  travelTypes?: string[];
  supportsInvoice?: boolean;
  supportsGst?: boolean;
  dedicatedTravelManager?: boolean;
  customPricing?: boolean;
  negotiatedHotels?: boolean;
  airportTransfers?: boolean;
}

interface Props {
  corporate?: CorporatePackageInfo | null;
  category?: string;
}

function travelTypeLabel(id: string) {
  return CORPORATE_TRAVEL_TYPES.find((t) => t.id === id)?.label || formatCategoryLabel(id);
}

export function CorporatePackageDetails({ corporate, category }: Props) {
  if (category !== "corporate" && !corporate) return null;

  const features = [
    corporate?.supportsInvoice && { icon: FileText, label: "Invoice support" },
    corporate?.supportsGst && { icon: BadgeIndianRupee, label: "GST billing" },
    corporate?.dedicatedTravelManager && { icon: Headphones, label: "Dedicated travel manager" },
    corporate?.customPricing && { icon: Building2, label: "Custom pricing" },
    corporate?.negotiatedHotels && { icon: Building2, label: "Negotiated hotels" },
    corporate?.airportTransfers && { icon: MapPin, label: "Airport transfers" },
  ].filter(Boolean) as { icon: typeof FileText; label: string }[];

  return (
    <section className="rounded-2xl border border-[#E0E0E0] bg-gradient-to-br from-slate-50 to-white p-5 sm:p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-green-dark" />
        <h2 className="text-lg font-semibold text-text-dark">Corporate Travel</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        {corporate?.companyName && (
          <div>
            <p className="text-text-grey text-xs uppercase tracking-wide">Partner</p>
            <p className="font-medium text-text-dark">{corporate.companyName}</p>
          </div>
        )}
        {(corporate?.employeeCountMin || corporate?.employeeCountMax) && (
          <div>
            <p className="text-text-grey text-xs uppercase tracking-wide flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Group size
            </p>
            <p className="font-medium text-text-dark">
              {corporate.employeeCountMin}
              {corporate.employeeCountMax ? `–${corporate.employeeCountMax}` : "+"} employees
            </p>
          </div>
        )}
        {corporate?.meetingLocation && (
          <div className="sm:col-span-2">
            <p className="text-text-grey text-xs uppercase tracking-wide flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Meeting location
            </p>
            <p className="font-medium text-text-dark">{corporate.meetingLocation}</p>
          </div>
        )}
      </div>

      {corporate?.travelTypes && corporate.travelTypes.length > 0 && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-text-grey mb-2">Travel types</p>
          <div className="flex flex-wrap gap-2">
            {corporate.travelTypes.map((t) => (
              <span
                key={t}
                className="rounded-full bg-green-dark/10 text-green-dark px-3 py-1 text-xs font-medium"
              >
                {travelTypeLabel(t)}
              </span>
            ))}
          </div>
        </div>
      )}

      {features.length > 0 && (
        <ul className="mt-4 grid sm:grid-cols-2 gap-2">
          {features.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-sm text-text-dark">
              <Icon className="h-4 w-4 text-green-bright shrink-0" />
              {label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
