/**
 * AI-estimated flight & hotel suggestions for package detail pages.
 * Phase 1: heuristic estimates + configurable affiliate URLs (no ticket booking).
 */

const DEFAULT_ORIGIN = "DEL";

/** Destination slug/name → IATA arrival code */
const AIRPORT_MAP = {
  bali: "DPS",
  thailand: "BKK",
  singapore: "SIN",
  japan: "NRT",
  dubai: "DXB",
  switzerland: "ZRH",
  paris: "CDG",
  maldives: "MLE",
  "sri-lanka": "CMB",
  nepal: "KTM",
  iceland: "KEF",
  italy: "FCO",
  croatia: "DBV",
  australia: "SYD",
  "new-zealand": "AKL",
  vietnam: "SGN",
  kenya: "NBO",
  seychelles: "SEZ",
  malaysia: "KUL",
  mauritius: "MRU",
  goa: "GOI",
  kerala: "COK",
  baku: "GYD",
};

const AIRLINES = [
  { name: "Air India", code: "AI" },
  { name: "IndiGo", code: "6E" },
  { name: "Vistara", code: "UK" },
  { name: "Emirates", code: "EK" },
  { name: "Singapore Airlines", code: "SQ" },
  { name: "Thai Airways", code: "TG" },
];

const DEPARTURE_WINDOWS = ["Early Morning (6–9 AM)", "Morning (9 AM–12 PM)", "Afternoon (12–4 PM)", "Evening (4–8 PM)"];
const RETURN_WINDOWS = ["Morning Return", "Afternoon Return", "Late Evening Return", "Red-eye Return"];

function resolveAirport(destination) {
  if (!destination) return "BKK";
  const slug = (destination.slug || destination.name || "").toLowerCase().replace(/\s+/g, "-");
  return AIRPORT_MAP[slug] || AIRPORT_MAP[slug.split("-")[0]] || "BKK";
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

function buildAffiliateUrl(type, params) {
  const flightTpl =
    process.env.FLIGHT_AFFILIATE_URL ||
    "https://www.google.com/travel/flights?q=Flights+from+{origin}+to+{destination}";
  const hotelTpl =
    process.env.HOTEL_AFFILIATE_URL ||
    "https://www.google.com/travel/hotels/{destination}";

  if (type === "flight") {
    return flightTpl
      .replace(/\{origin\}/g, params.origin || DEFAULT_ORIGIN)
      .replace(/\{destination\}/g, params.destination || "")
      .replace(/\{airline\}/g, encodeURIComponent(params.airline || ""))
      .replace(/\{price\}/g, String(params.price || ""));
  }
  return hotelTpl
    .replace(/\{destination\}/g, encodeURIComponent(params.destination || ""))
    .replace(/\{city\}/g, encodeURIComponent(params.city || ""));
}

function estimateFlights(pkg) {
  const dest = pkg.destination || {};
  const arrival = resolveAirport(dest);
  const origin = DEFAULT_ORIGIN;
  const seed = hashSeed(`${pkg._id}-${dest.name}`);
  const basePrice = Math.round((pkg.pricePerPerson || 50000) * 0.35);
  const durationH = 4 + (seed % 12);
  const durationM = 10 + (seed % 50);

  return AIRLINES.slice(0, 4).map((airline, i) => {
    const price = basePrice + i * 2200 + (seed % 3000);
    const stops = i < 2 ? "Non-stop" : "1 stop";
    const depWindow = DEPARTURE_WINDOWS[(seed + i) % DEPARTURE_WINDOWS.length];
    const retWindow = RETURN_WINDOWS[(seed + i + 1) % RETURN_WINDOWS.length];
    return {
      airline: airline.name,
      airlineCode: airline.code,
      departureAirport: origin,
      arrivalAirport: arrival,
      duration: `${durationH}h ${durationM}m`,
      stops,
      priceINR: price,
      departureWindow: depWindow,
      returnWindow: retWindow,
      affiliateUrl: buildAffiliateUrl("flight", {
        origin,
        destination: arrival,
        airline: airline.name,
        price,
      }),
    };
  });
}

const HOTEL_TIERS = [
  { tier: "luxury", label: "Luxury", multiplier: 2.8, rating: 4.8 },
  { tier: "premium", label: "Premium", multiplier: 1.6, rating: 4.4 },
  { tier: "budget", label: "Budget", multiplier: 0.9, rating: 4.0 },
];

const HOTEL_NAMES = {
  luxury: ["The Grand Resort", "Royal Palm Suites", "Azure Horizon"],
  premium: ["City Comfort Inn", "Traveler's Lodge", "Green Valley Hotel"],
  budget: ["Happy Stay Hostel", "Budget Bliss", "Explorer Inn"],
};

const AMENITIES = {
  luxury: ["Pool", "Spa", "Breakfast", "Airport Transfer"],
  premium: ["WiFi", "Breakfast", "Gym"],
  budget: ["WiFi", "AC", "24h Desk"],
};

function estimateHotels(pkg) {
  const dest = pkg.destination || {};
  const city = dest.name || "Destination";
  const seed = hashSeed(`${pkg._id}-hotels`);
  const nights = pkg.durationNights || Math.max(1, (pkg.durationDays || 5) - 1);
  const baseNightly = Math.round((pkg.pricePerPerson || 40000) * 0.12);

  return HOTEL_TIERS.map((tier, i) => {
    const name = HOTEL_NAMES[tier.tier][seed % 3];
    const pricePerNight = Math.round(baseNightly * tier.multiplier);
    return {
      tier: tier.tier,
      label: tier.label,
      name: `${name} ${city}`,
      rating: tier.rating,
      pricePerNightINR: pricePerNight,
      totalINRNights: pricePerNight * nights,
      distanceKm: 0.5 + ((seed + i) % 8),
      amenities: AMENITIES[tier.tier],
      image: pkg.images?.[i] || dest.coverImage || "",
      affiliateUrl: buildAffiliateUrl("hotel", { destination: city, city }),
    };
  });
}

function generateChecklist(pkg) {
  const dest = pkg.destination || {};
  const country = dest.country || "your destination";
  const visaFree = pkg.isVisaFree || dest.isVisaFree;
  return {
    sections: [
      {
        title: "Documents",
        items: [
          { id: "passport", label: "Valid passport (6+ months validity)", checked: false },
          {
            id: "visa",
            label: visaFree ? "Visa not required (visa-free)" : "Apply for visa / e-visa",
            checked: false,
          },
          { id: "insurance", label: "Travel insurance policy", checked: false },
          { id: "tickets", label: "Flight & hotel confirmations", checked: false },
          { id: "id", label: "Photo ID copies", checked: false },
        ],
      },
      {
        title: "Money & Connectivity",
        items: [
          { id: "currency", label: `Currency / forex for ${country}`, checked: false },
          { id: "sim", label: "International SIM or eSIM", checked: false },
          { id: "cards", label: "Notify bank for international use", checked: false },
        ],
      },
      {
        title: "Health & Packing",
        items: [
          { id: "medicines", label: "Personal medicines & first-aid kit", checked: false },
          { id: "clothes", label: "Weather-appropriate clothing", checked: false },
          { id: "weather", label: `Check weather for ${dest.name || country}`, checked: false },
          { id: "charger", label: "Universal adapter & chargers", checked: false },
        ],
      },
      {
        title: "Trip Essentials",
        items: [
          { id: "itinerary", label: "Download itinerary offline", checked: false },
          { id: "emergency", label: "Emergency contacts saved", checked: false },
          { id: "apps", label: "Maps & translation apps installed", checked: false },
        ],
      },
    ],
    packageTitle: pkg.title,
    destination: dest.name,
    country,
  };
}

module.exports = { estimateFlights, estimateHotels, generateChecklist, buildAffiliateUrl };
