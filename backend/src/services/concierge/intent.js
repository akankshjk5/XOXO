const { getClaude, CLAUDE_MODEL } = require("../../utils/claude");
const { resolveDestination, suggestDestinations, normalizeKey, DESTINATIONS } = require("./destinations");

const hasKey = () => !!process.env.ANTHROPIC_API_KEY;

function parseBudgetINR(text = "") {
  const t = text.toLowerCase().replace(/,/g, "");
  const lakh = t.match(/(\d+(?:\.\d+)?)\s*l(?:akh|ac)?/);
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
  return null;
}

function parseTravelers(text = "") {
  const t = text.toLowerCase();
  if (t.includes("honeymoon") || t.includes("couple")) return 2;
  if (t.includes("solo") || t.includes("backpack")) return 1;
  if (t.includes("family")) return 4;
  const m = t.match(/(\d+)\s*(?:people|travelers|travellers|pax)/);
  return m ? parseInt(m[1], 10) : null;
}

function parseTripType(text = "") {
  const t = text.toLowerCase();
  if (t.includes("honeymoon")) return "honeymoon";
  if (t.includes("solo") || t.includes("backpack")) return "solo";
  if (t.includes("family")) return "family";
  if (t.includes("group") || t.includes("friends")) return "group";
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
  ];
  for (const [needle, style] of map) {
    if (t.includes(needle)) styles.push(style);
  }
  return styles;
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

  const tripType = parseTripType(t);
  if (tripType) merged.tripType = tripType;

  const styles = parseStyles(t);
  if (styles.length) merged.travelStyle = [...new Set([...(merged.travelStyle || []), ...styles])];

  const dates = parseMonthYear(t);
  if (dates?.departureDate) merged.departureDate = dates.departureDate;

  if (t.toLowerCase().includes("visa free") || t.toLowerCase().includes("visa-free")) {
    merged.visaPreference = "visa-free";
  }

  if (t.toLowerCase().includes("solo traveler") || t.toLowerCase().includes("other solo")) {
    merged.socialPreference = "solo-match";
  }

  for (const key of Object.keys(DESTINATIONS)) {
    if (normalizeKey(t).includes(key)) {
      merged.destination = DESTINATIONS[key].label;
      break;
    }
  }

  if (!merged.origin) merged.origin = "DEL";

  return merged;
}

async function extractIntent(message, existing = {}) {
  const ruleBased = extractIntentRuleBased(message, existing);

  if (!hasKey()) return ruleBased;

  try {
    const response = await getClaude().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 800,
      system: `Extract travel intent from the user message. Return ONLY valid JSON with keys:
origin, destination, budgetINR (number), budgetLabel, departureDate (YYYY-MM-DD), returnDate, durationDays (number),
travelers (number), tripType, travelStyle (array), interests (array), visaPreference, preferredAirlines (array),
hotelCategory, socialPreference.
Merge with existing intent; only include fields mentioned or clearly implied. Use INR. Default origin DEL for Indian travellers.`,
      messages: [
        {
          role: "user",
          content: `Existing: ${JSON.stringify(existing)}\n\nUser: ${message}`,
        },
      ],
    });
    const parsed = JSON.parse(response.content[0].text);
    return { ...ruleBased, ...parsed };
  } catch {
    return ruleBased;
  }
}

function getMissingFields(intent) {
  const missing = [];
  if (!intent.destination && !intent.openDestination) missing.push("destination");
  if (!intent.budgetINR) missing.push("budget");
  if (!intent.durationDays && !intent.departureDate) missing.push("dates");
  if (!intent.travelers) missing.push("travelers");
  return missing;
}

function markOpenDestination(intent) {
  if (!intent.destination && (intent.budgetINR || intent.durationDays)) {
    intent.openDestination = true;
  }
  return intent;
}

module.exports = {
  extractIntent,
  extractIntentRuleBased,
  getMissingFields,
  markOpenDestination,
  suggestDestinations,
  resolveDestination,
  parseBudgetINR,
};
