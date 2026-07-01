import type { LucideIcon } from "lucide-react";
import { Stamp, Bus, Compass } from "lucide-react";

/** Community feature cards — marketing navigation, not inventory. */

export const SOCIAL_FEATURES: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
}[] = [
  {
    title: "Visa Assistant",
    description:
      "Get visa guidance, document checklist, approval requirements, and processing timelines.",
    href: "/visa",
    icon: Stamp,
    gradient: "linear-gradient(135deg, #0C447C, #378ADD)",
  },
  {
    title: "Transport Hub",
    description:
      "Book airport transfers, trains, buses, ferries and local transport from one place.",
    href: "/transport",
    icon: Bus,
    gradient: "linear-gradient(135deg, #F97316, #FBBF24)",
  },
  {
    title: "Local Guides",
    description: "Book verified local guides for authentic experiences worldwide.",
    href: "/guides",
    icon: Compass,
    gradient: "linear-gradient(135deg, #22C55E, #0C447C)",
  },
];
