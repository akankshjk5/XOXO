const { getTransportProviders, TRANSPORT_MODES } = require("./registry");
const { MODE_LABELS, FUTURE_MODES } = require("./modes");

function parseModes(modesParam) {
  if (!modesParam) return null;
  const list = String(modesParam)
    .split(",")
    .map((m) => m.trim().toLowerCase())
    .filter(Boolean);
  return list.length ? list : null;
}

function applyFilters(offers, filters = {}) {
  let result = [...offers];

  if (filters.mode) {
    const modes = Array.isArray(filters.mode) ? filters.mode : [filters.mode];
    result = result.filter((o) => modes.includes(o.mode));
  }

  if (filters.maxPrice != null) {
    result = result.filter((o) => o.price <= Number(filters.maxPrice));
  }
  if (filters.minPrice != null) {
    result = result.filter((o) => o.price >= Number(filters.minPrice));
  }
  if (filters.maxDuration != null) {
    result = result.filter((o) => o.durationMinutes <= Number(filters.maxDuration));
  }
  if (filters.maxStops != null) {
    result = result.filter((o) => o.stops <= Number(filters.maxStops));
  }
  if (filters.departureAfter) {
    const after = new Date(filters.departureAfter).getTime();
    result = result.filter((o) => new Date(o.departureAt).getTime() >= after);
  }
  if (filters.departureBefore) {
    const before = new Date(filters.departureBefore).getTime();
    result = result.filter((o) => new Date(o.departureAt).getTime() <= before);
  }
  if (filters.providerId) {
    result = result.filter((o) => o.providerId === filters.providerId);
  }
  if (filters.providerLabel) {
    const q = String(filters.providerLabel).toLowerCase();
    result = result.filter((o) => o.providerLabel.toLowerCase().includes(q));
  }

  const sort = filters.sort || "price";
  if (sort === "price") result.sort((a, b) => a.price - b.price);
  if (sort === "duration") result.sort((a, b) => a.durationMinutes - b.durationMinutes);
  if (sort === "departure") result.sort((a, b) => new Date(a.departureAt) - new Date(b.departureAt));

  return result;
}

function groupByMode(offers) {
  /** @type {Record<string, typeof offers>} */
  const groups = {};
  for (const offer of offers) {
    if (!groups[offer.mode]) groups[offer.mode] = [];
    groups[offer.mode].push(offer);
  }
  return Object.entries(groups).map(([mode, items]) => ({
    mode,
    label: MODE_LABELS[mode] || mode,
    count: items.length,
    offers: items,
  }));
}

function buildRecommendations(offers) {
  if (!offers.length) {
    return { cheapest: null, fastest: null, bestValue: null };
  }

  const cheapest = [...offers].sort((a, b) => a.price - b.price)[0];
  const fastest = [...offers].sort((a, b) => a.durationMinutes - b.durationMinutes)[0];

  const scored = offers.map((o) => {
    const priceScore = o.price / Math.max(...offers.map((x) => x.price));
    const timeScore = o.durationMinutes / Math.max(...offers.map((x) => x.durationMinutes));
    const stopPenalty = o.stops * 0.05;
    const valueScore = priceScore * 0.55 + timeScore * 0.4 + stopPenalty;
    return { offer: o, valueScore };
  });
  const bestValue = scored.sort((a, b) => a.valueScore - b.valueScore)[0]?.offer;

  return {
    cheapest: { id: cheapest.id, mode: cheapest.mode, label: cheapest.summary || cheapest.providerLabel, price: cheapest.price },
    fastest: { id: fastest.id, mode: fastest.mode, label: fastest.summary || fastest.providerLabel, durationMinutes: fastest.durationMinutes },
    bestValue: bestValue
      ? { id: bestValue.id, mode: bestValue.mode, label: bestValue.summary || bestValue.providerLabel, price: bestValue.price, durationMinutes: bestValue.durationMinutes }
      : null,
  };
}

async function searchTransportHub(params, filters = {}) {
  const { origin, destination, departureDate } = params;
  if (!origin || !destination || !departureDate) {
    const err = new Error("origin, destination, and departureDate are required");
    err.status = 400;
    throw err;
  }

  const requestedModes = parseModes(params.modes);
  const searchParams = {
    origin,
    destination,
    departureDate,
    returnDate: params.returnDate,
    passengers: Number(params.passengers) || 1,
    modes: requestedModes,
  };

  const providers = getTransportProviders();
  const activeProviders = requestedModes
    ? providers.filter((p) => p.modes.some((m) => requestedModes.includes(m)))
    : providers;

  const results = await Promise.all(
    activeProviders.map(async (provider) => {
      try {
        const modeFilter = requestedModes
          ? requestedModes.filter((m) => provider.modes.includes(m))
          : provider.modes;
        const r = await provider.search({ ...searchParams, modes: modeFilter });
        return r.offers || [];
      } catch {
        return [];
      }
    })
  );

  let offers = results.flat();
  const filtered = applyFilters(offers, filters);
  const grouped = groupByMode(filtered);
  const recommendations = buildRecommendations(filtered);

  const futureModes = FUTURE_MODES.map((id) => ({
    mode: id,
    label: MODE_LABELS[id],
    status: "coming_soon",
    offers: [],
  }));

  return {
    offers: filtered,
    grouped: [...grouped, ...futureModes.filter((f) => !grouped.find((g) => g.mode === f.mode))],
    recommendations,
    meta: {
      origin,
      destination,
      departureDate,
      total: filtered.length,
      modesSearched: requestedModes || Object.values(TRANSPORT_MODES).filter((m) => !FUTURE_MODES.includes(m)),
      demo: filtered.some((o) => o.provider === "mock") || filtered.length === 0,
    },
  };
}

module.exports = {
  searchTransportHub,
  applyFilters,
  groupByMode,
  buildRecommendations,
};
