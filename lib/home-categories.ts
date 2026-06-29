/** Homepage category navigation — UI labels/images only, not inventory. */

import { getTravelerImage } from "@/lib/images";

export const TRAVELER_TYPES = [
  { id: "couple", label: "COUPLE", emoji: "💑", image: getTravelerImage("couple") },
  { id: "family", label: "FAMILY", emoji: "👨‍👩‍👧", image: getTravelerImage("family") },
  { id: "friends", label: "FRIENDS", emoji: "👯", image: getTravelerImage("friends") },
  { id: "solo", label: "SOLO", emoji: "🧳", image: getTravelerImage("solo") },
  { id: "corporate", label: "CORPORATE", emoji: "🏢", image: getTravelerImage("corporate") },
];
