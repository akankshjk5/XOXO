/** Destination metadata for inventory + visa lookups */
const DESTINATIONS = {
  bali: { label: "Bali", iata: "DPS", cityCode: "DPS", lat: -8.34, lng: 115.09, country: "indonesia" },
  indonesia: { label: "Bali", iata: "DPS", cityCode: "DPS", lat: -8.34, lng: 115.09, country: "indonesia" },
  thailand: { label: "Thailand", iata: "BKK", cityCode: "BKK", lat: 13.75, lng: 100.52, country: "thailand" },
  bangkok: { label: "Bangkok", iata: "BKK", cityCode: "BKK", lat: 13.75, lng: 100.52, country: "thailand" },
  dubai: { label: "Dubai", iata: "DXB", cityCode: "DXB", lat: 25.2, lng: 55.27, country: "uae" },
  uae: { label: "Dubai", iata: "DXB", cityCode: "DXB", lat: 25.2, lng: 55.27, country: "uae" },
  maldives: { label: "Maldives", iata: "MLE", cityCode: "MLE", lat: 4.17, lng: 73.5, country: "maldives" },
  singapore: { label: "Singapore", iata: "SIN", cityCode: "SIN", lat: 1.35, lng: 103.82, country: "singapore" },
  japan: { label: "Tokyo", iata: "HND", cityCode: "TYO", lat: 35.68, lng: 139.69, country: "japan" },
  tokyo: { label: "Tokyo", iata: "HND", cityCode: "TYO", lat: 35.68, lng: 139.69, country: "japan" },
  paris: { label: "Paris", iata: "CDG", cityCode: "PAR", lat: 48.86, lng: 2.35, country: "france" },
  switzerland: { label: "Zurich", iata: "ZRH", cityCode: "ZRH", lat: 47.37, lng: 8.54, country: "switzerland" },
  vietnam: { label: "Ho Chi Minh City", iata: "SGN", cityCode: "SGN", lat: 10.82, lng: 106.63, country: "vietnam" },
  sri: { label: "Colombo", iata: "CMB", cityCode: "CMB", lat: 6.93, lng: 79.85, country: "sri-lanka" },
  "sri lanka": { label: "Colombo", iata: "CMB", cityCode: "CMB", lat: 6.93, lng: 79.85, country: "sri-lanka" },
  goa: { label: "Goa", iata: "GOI", cityCode: "GOI", lat: 15.49, lng: 73.83, country: "india" },
  kerala: { label: "Kochi", iata: "COK", cityCode: "COK", lat: 9.93, lng: 76.27, country: "india" },
  europe: { label: "Paris", iata: "CDG", cityCode: "PAR", lat: 48.86, lng: 2.35, country: "france" },
};

function normalizeKey(text = "") {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
}

function resolveDestination(input) {
  if (!input) return null;
  const key = normalizeKey(input);
  if (DESTINATIONS[key]) return { ...DESTINATIONS[key], query: input };

  for (const [k, v] of Object.entries(DESTINATIONS)) {
    if (key.includes(k) || k.includes(key)) return { ...v, query: input };
  }
  return { label: input, iata: null, cityCode: null, lat: null, lng: null, country: key, query: input };
}

function suggestDestinations({ budgetINR, travelStyle = [], durationDays }) {
  const pool = [
    { name: "Bali", key: "bali", minBudget: 45000, styles: ["honeymoon", "beaches", "relaxation"] },
    { name: "Thailand", key: "thailand", minBudget: 35000, styles: ["nightlife", "beaches", "budget", "backpacking"] },
    { name: "Dubai", key: "dubai", minBudget: 55000, styles: ["luxury", "shopping", "family"] },
    { name: "Maldives", key: "maldives", minBudget: 85000, styles: ["honeymoon", "beaches", "luxury"] },
    { name: "Singapore", key: "singapore", minBudget: 65000, styles: ["family", "city"] },
    { name: "Vietnam", key: "vietnam", minBudget: 40000, styles: ["backpacking", "culture", "budget"] },
    { name: "Japan", key: "japan", minBudget: 95000, styles: ["culture", "solo", "backpacking"] },
    { name: "Sri Lanka", key: "sri lanka", minBudget: 30000, styles: ["budget", "beaches", "relaxation"] },
    { name: "Georgia", key: "georgia", minBudget: 55000, styles: ["honeymoon", "culture", "adventure"] },
    { name: "Nepal", key: "nepal", minBudget: 30000, styles: ["adventure", "budget", "culture"] },
    { name: "Mauritius", key: "mauritius", minBudget: 75000, styles: ["honeymoon", "beaches", "luxury"] },
  ];

  const perPerson = budgetINR ? Math.floor(budgetINR / 2) : 60000;
  const styles = travelStyle.map((s) => s.toLowerCase());

  return pool
    .filter((d) => !budgetINR || d.minBudget <= perPerson * 1.2)
    .map((d) => ({
      ...d,
      score:
        (styles.some((s) => d.styles.includes(s)) ? 2 : 0) +
        (durationDays && durationDays <= 5 && d.key === "singapore" ? 1 : 0) +
        (durationDays && durationDays >= 6 && ["bali", "thailand"].includes(d.key) ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((d) => ({ name: d.name, key: d.key, estimatedFrom: d.minBudget }));
}

module.exports = { DESTINATIONS, resolveDestination, suggestDestinations, normalizeKey };
