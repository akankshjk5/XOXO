const { getClaude, CLAUDE_MODEL } = require("../../utils/claude");
const { INTENT_EXTRACTION_SYSTEM } = require("../../constants/concierge-prompts");
const { resolveDestination, suggestDestinations, normalizeKey, DESTINATIONS } = require("./destinations");

const hasKey = () => !!process.env.ANTHROPIC_API_KEY;

const ORIGIN_MAP = {
  bangalore: "BLR",
  bengaluru: "BLR",
  blr: "BLR",
  delhi: "DEL",
  "new delhi": "DEL",
  del: "DEL",
  mumbai: "BOM",
  bombay: "BOM",
  bom: "BOM",
  chennai: "MAA",
  maa: "MAA",
  hyderabad: "HYD",
  hyd: "HYD",
  kolkata: "CCU",
  calcutta: "CCU",
  ccu: "CCU",
  pune: "PNQ",
  pnq: "PNQ",
  ahmedabad: "AMD",
  amd: "AMD",
  kochi: "COK",
  cochin: "COK",
  goa: "GOI",
};

function parseBudgetINR(text = "") {
  const t = text.toLowerCase().replace(/,/g, "");
  const lakh = t.match(/(\d+(?:\.\d+)?)\s*l(?:akh|ac|akhs?)?/);
  if (lakh) return Math.round(parseFloat(lakh[1]) * 100000);
  const k = t.match(/₹?\s*(\d+(?:\.\d+)?)\s*k/);
  if (k) return Math.round(parseFloat(k[1]) * 1000);
  const num = t.match(/₹?\s*(\d{4,})/);
  if (num) return parseInt(num[1], 10);
  return null;
}

function parseDuration(text = "") {
  const m = text.toLowerCase().match(/(\d+)\s*(?:days?|nights?)/);
  if (m) return parseInt(m[1], 10);
  if (text.toLowerCase().includes("long weekend")) return 4;
  if (text.toLowerCase().includes("weekend")) return 3;
  return null;
}

function parseTravelers(text = "") {
  const t = text.toLowerCase();
  const m = t.match(/(\d+)\s*(?:people|travelers|travellers|pax|adults?)/);
  if (m) return parseInt(m[1], 10);
  if (t.includes("honeymoon") || t.includes("couple")) return 2;
  if (t.includes("solo") || t.includes("backpack")) return 1;
  if (t.includes("family")) return 4;
  return null;
}

function parseChildren(text = "") {
  const t = text.toLowerCase();
  const m = t.match(/(\d+)\s*(?:kids?|children|child)/);
  if (m) return parseInt(m[1], 10);
  if (t.includes("two kids") || t.includes("2 kids")) return 2;
  if (t.includes("with kids") || t.includes("with children")) return 1;
  return null;
}

function parseSeniors(text = "") {
  const t = text.toLowerCase();
  if (
    t.includes("elderly") ||
    t.includes("senior citizen") ||
    t.includes("parents") ||
    t.includes("old parents")
  ) {
    const m = t.match(/(\d+)\s*(?:seniors?|parents?|elderly)/);
    return m ? parseInt(m[1], 10) : 2;
  }
  return null;
}

function parseOrigin(text = "") {
  const t = text.toLowerCase();
  const fromMatch = t.match(/(?:from|leaving)\s+([a-z\s]+?)(?:\s+to|\s+for|,|\.|$)/);
  const candidate = fromMatch ? fromMatch[1].trim() : t;
  for (const [city, iata] of Object.entries(ORIGIN_MAP)) {
    if (candidate.includes(city) || t.includes(`from ${city}`)) {
      return { originCity: city.charAt(0).toUpperCase() + city.slice(1), origin: iata };
    }
  }
  return null;
}

function parseTripType(text = "") {
  const t = text.toLowerCase();
  if (t.includes("honeymoon")) return "honeymoon";
  if (t.includes("corporate") || t.includes("business") || t.includes("mice") || t.includes("conference"))
    return "corporate";
  if (t.includes("solo") || t.includes("backpack")) return "solo";
  if (t.includes("family")) return "family";
  if (t.includes("group") || t.includes("friends")) return "group";
  if (t.includes("weekend")) return "weekend";
  return null;
}

function parseStyles(text = "") {
  const t = text.toLowerCase();
  const styles = [];
  const map = [
    ["beach", "beaches"],
    ["nightlife", "nightlife"],
    ["relax", "relaxation"],
    ["adventure", "adventure"],
    ["culture", "culture"],
    ["food", "food"],
    ["luxury", "luxury"],
    ["budget", "budget"],
    ["backpack", "backpacking"],
    ["visa free", "visa-free"],
    ["visa-free", "visa-free"],
  ];
  for (const [needle, style] of map) {
    if (t.includes(needle)) styles.push(style);
  }
  return styles;
}

function parseLuxuryLevel(text = "") {
  const t = text.toLowerCase();
  if (t.includes("ultra luxury") || t.includes("5-star") || t.includes("5 star")) return "ultra";
  if (t.includes("luxury") || t.includes("premium")) return "premium";
  return null;
}

function parseAdventureLevel(text = "") {
  const t = text.toLowerCase();
  if (t.includes("adventure") || t.includes("trek") || t.includes("hiking")) return "high";
  if (t.includes("relaxed") || t.includes("leisure")) return "low";
  return null;
}

function parseHotelCategory(text = "") {
  const t = text.toLowerCase();
  if (t.includes("5-star") || t.includes("5 star") || t.includes("luxury hotel")) return "luxury";
  if (t.includes("boutique")) return "boutique";
  if (t.includes("budget hotel") || t.includes("hostel")) return "budget";
  if (t.includes("4-star") || t.includes("4 star")) return "mid-range";
  return null;
}

function parseScope(text = "") {
  const t = text.toLowerCase();
  const domestic = ["goa", "kerala", "rajasthan", "ladakh", "andaman", "kashmir", "himachal"];
  if (domestic.some((d) => t.includes(d))) return "domestic";
  if (t.includes("domestic") || t.includes("within india")) return "domestic";
  if (t.includes("international") || t.includes("abroad")) return "international";
  return null;
}

function parseMonthYear(text = "") {
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const t = text.toLowerCase();
  const now = new Date();
  for (let i = 0; i < months.length; i++) {
    if (t.includes(months[i])) {
      let year = now.getFullYear();
      if (i < now.getMonth()) year += 1;
      const month = String(i + 1).padStart(2, "0");
      return { departureDate: `${year}-${month}-10`, month: months[i] };
    }
  }
  if (t.includes("next month")) {
    const d = new Date(now.getFullYear(), now.getMonth() + 1, 10);
    return {
      departureDate: d.toISOString().slice(0, 10),
      month: d.toLocaleString("en", { month: "long" }),
    };
  }
  return null;
}

function extractIntentRuleBased(message, existing = {}) {
  const t = message || "";
  const merged = { ...existing };

  const budget = parseBudgetINR(t);
  if (budget) {
    merged.budgetINR = budget;
    merged.budgetLabel = `₹${budget.toLocaleString("en-IN")}`;
  }

  const duration = parseDuration(t);
  if (duration) merged.durationDays = duration;

  const travelers = parseTravelers(t);
  if (travelers) merged.travelers = travelers;

  const children = parseChildren(t);
  if (children) {
    merged.children = children;
    merged.hasChildren = true;
  }

  const seniors = parseSeniors(t);
  if (seniors) {
    merged.seniors = seniors;
    merged.hasSeniors = true;
  }

  const origin = parseOrigin(t);
  if (origin) {
    merged.origin = origin.origin;
    merged.originCity = origin.originCity;
  }

  const tripType = parseTripType(t);
  if (tripType) merged.tripType = tripType;

  const styles = parseStyles(t);
  if (styles.length) merged.travelStyle = [...new Set([...(merged.travelStyle || []), ...styles])];

  const dates = parseMonthYear(t);
  if (dates?.departureDate) merged.departureDate = dates.departureDate;

  const luxury = parseLuxuryLevel(t);
  if (luxury) merged.luxuryLevel = luxury;

  const adventure = parseAdventureLevel(t);
  if (adventure) merged.adventureLevel = adventure;

  const hotel = parseHotelCategory(t);
  if (hotel) merged.hotelCategory = hotel;

  const scope = parseScope(t);
  if (scope) merged.scope = scope;

  if (t.toLowerCase().includes("visa free") || t.toLowerCase().includes("visa-free")) {
    merged.visaPreference = "visa-free";
  }

  if (t.toLowerCase().includes("solo traveler") || t.toLowerCase().includes("other solo")) {
    merged.socialPreference = "solo-match";
  }

  if (t.toLowerCase().includes("direct flight")) merged.flightPreference = "direct";

  for (const key of Object.keys(DESTINATIONS)) {
    if (normalizeKey(t).includes(key)) {
      merged.destination = DESTINATIONS[key].label;
      break;
    }
  }

  return merged;
}

async function extractIntent(message, existing = {}) {
  const ruleBased = extractIntentRuleBased(message, existing);

  if (!hasKey()) return ruleBased;

  try {
    const response = await getClaude().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: INTENT_EXTRACTION_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Existing intent (preserve unless user updates): ${JSON.stringify(existing)}\n\nUser message: ${message}`,
        },
      ],
    });
    const text = response.content[0].text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    return { ...ruleBased, ...parsed };
  } catch {
    return ruleBased;
  }
}

function getMissingFields(intent, pageContext) {
  const missing = [];
  const hasPackage = !!pageContext?.package || !!intent.pagePackageId;

  if (!intent.destination && !intent.openDestination && !hasPackage) missing.push("destination");
  if (!intent.budgetINR && !hasPackage) missing.push("budget");
  if (!intent.durationDays && !intent.departureDate && !hasPackage) missing.push("dates");
  if (!intent.travelers) missing.push("travelers");
  if (!intent.origin && !intent.originCity && intent.scope !== "domestic") missing.push("origin");

  return missing;
}

function markOpenDestination(intent) {
  if (!intent.destination && (intent.budgetINR || intent.durationDays || intent.tripType)) {
    intent.openDestination = true;
  }
  return intent;
}

function buildFollowUpQuestions(missing, intent, pageContext) {
  const labels = {
    destination: "Which destination are you dreaming of — or shall I suggest options within your budget?",
    budget: "What is your total trip budget in INR (all travellers included)?",
    dates: "When would you like to travel, and for how many days?",
    travelers: "How many travellers — adults, children, or seniors?",
    origin: "Which city will you be flying from? (e.g. Bangalore, Delhi, Mumbai)",
  };

  if (missing.length === 0) return null;

  const intro = pageContext?.package
    ? `I can personalise **${pageContext.package.title}** into a complete luxury itinerary. To tailor it perfectly:`
    : "I can create a perfect itinerary for you. To personalise it, could you share:";

  const bullets = missing.map((m) => `• ${labels[m] || m}`).join("\n");

  if (intent.openDestination && intent.budgetINR && missing.includes("destination")) {
    const alts = suggestDestinations(intent)
      .slice(0, 3)
      .map((d) => `**${d.name}** (from ~₹${d.estimatedFrom?.toLocaleString("en-IN")}/person)`)
      .join(", ");
    return `${intro}\n${bullets}\n\nWith **₹${intent.budgetINR.toLocaleString("en-IN")}**, strong options include ${alts}. Which appeals to you?`;
  }

  return `${intro}\n${bullets}`;
}

function getBudgetAlternatives(intent) {
  const dest = (intent.destination || "").toLowerCase();
  const budget = intent.budgetINR || 0;
  const perPerson = budget / (intent.travelers || 2);

  const expensive = ["switzerland", "europe", "paris", "japan", "maldives", "dubai"];
  const isExpensive = expensive.some((e) => dest.includes(e));

  if (!isExpensive || perPerson >= 90000) return [];

  return [
    { destination: "Bali", reason: "Romantic beaches, visa-friendly, excellent value for honeymoons", estimatedFrom: 55000 },
    { destination: "Vietnam", reason: "Culture, food, and scenery at a fraction of European cost", estimatedFrom: 45000 },
    { destination: "Georgia", reason: "European feel, stunning landscapes, budget-friendly", estimatedFrom: 65000 },
    { destination: "Nepal", reason: "Mountains and spirituality, short flights from India", estimatedFrom: 35000 },
    { destination: "Mauritius", reason: "Honeymoon beaches with visa-free entry for Indians", estimatedFrom: 75000 },
  ].slice(0, 3);
}

module.exports = {
  extractIntent,
  extractIntentRuleBased,
  getMissingFields,
  markOpenDestination,
  buildFollowUpQuestions,
  getBudgetAlternatives,
  suggestDestinations,
  resolveDestination,
  parseBudgetINR,
};
