import { Car, FileText, Headphones, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BookingAddOn {
  id: string;
  label: string;
  description: string;
  price: number;
  perTraveler: boolean;
  icon: LucideIcon;
}

export const BOOKING_ADDONS: BookingAddOn[] = [
  {
    id: "insurance",
    label: "Travel Insurance",
    description: "Medical & trip cancellation cover for peace of mind.",
    price: 1500,
    perTraveler: true,
    icon: ShieldCheck,
  },
  {
    id: "visa",
    label: "Visa Assistance",
    description: "Document checklist and visa desk support.",
    price: 2500,
    perTraveler: true,
    icon: FileText,
  },
  {
    id: "airport_pickup",
    label: "Airport Pickup",
    description: "Private transfer from arrival airport to hotel.",
    price: 1200,
    perTraveler: false,
    icon: Car,
  },
  {
    id: "priority_support",
    label: "Priority Support",
    description: "24/7 dedicated concierge line for your trip.",
    price: 800,
    perTraveler: false,
    icon: Headphones,
  },
];

export function calcAddOnTotal(selected: string[], travelers: number): number {
  return selected.reduce((sum, id) => {
    const addon = BOOKING_ADDONS.find((a) => a.id === id);
    if (!addon) return sum;
    return sum + addon.price * (addon.perTraveler ? travelers : 1);
  }, 0);
}
