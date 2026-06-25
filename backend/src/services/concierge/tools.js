const Package = require("../../models/Package");
const Destination = require("../../models/Destination");
const Guide = require("../../models/Guide");
const GroupTrip = require("../../models/GroupTrip");
const TravelerMatch = require("../../models/TravelerMatch");
const {
  getFlightProvider,
  getFlightMockProvider,
  getHotelProvider,
  getHotelMockProvider,
  getActivityProvider,
  getActivityMockProvider,
  getVisaProvider,
  getMapsProvider,
} = require("../index");
const { withMockFallback } = require("../../utils/integration");
const { resolveDestination, suggestDestinations } = require("./destinations");
const logger = require("../../config/logger");

function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function searchFlights(intent) {
  const dest = resolveDestination(intent.destination);
  if (!dest?.iata) return { offers: [], meta: { skipped: true } };
  const departureDate = intent.departureDate || addDays(new Date().toISOString().slice(0, 10), 45);
  const returnDate =
    intent.returnDate ||
    (intent.durationDays ? addDays(departureDate, intent.durationDays) : addDays(departureDate, 7));

  try {
    const result = await withMockFallback({
      live: getFlightProvider(),
      mock: getFlightMockProvider(),
      params: {
        origin: intent.origin || "DEL",
        destination: dest.iata,
        departureDate,
        returnDate: intent.tripType === "solo" ? undefined : returnDate,
        adults: intent.travelers || 2,
      },
      domain: "concierge:flights",
    });
    const offers = (result.offers || []).slice(0, 5);
    return { offers, meta: result.meta, departureDate, returnDate };
  } catch (err) {
    logger.warn("Concierge flight search failed", { error: err.message });
    const mock = await getFlightMockProvider().search({
      origin: intent.origin || "DEL",
      destination: dest.iata,
      departureDate,
      adults: intent.travelers || 2,
    });
    return { offers: mock.offers.slice(0, 5), meta: { fallback: true } };
  }
}

async function searchHotels(intent) {
  const dest = resolveDestination(intent.destination);
  if (!dest?.cityCode) return { offers: [], meta: { skipped: true } };
  const checkIn = intent.departureDate || addDays(new Date().toISOString().slice(0, 10), 45);
  const checkOut = intent.durationDays
    ? addDays(checkIn, intent.durationDays)
    : addDays(checkIn, 5);

  try {
    const result = await withMockFallback({
      live: getHotelProvider(),
      mock: getHotelMockProvider(),
      params: {
        cityCode: dest.cityCode,
        checkIn,
        checkOut,
        adults: intent.travelers || 2,
      },
      domain: "concierge:hotels",
    });
    return { offers: (result.offers || []).slice(0, 5), meta: result.meta, checkIn, checkOut };
  } catch (err) {
    logger.warn("Concierge hotel search failed", { error: err.message });
    return { offers: [], meta: { fallback: true } };
  }
}

async function searchActivities(intent) {
  const dest = resolveDestination(intent.destination);
  if (!dest?.lat) return { offers: [], meta: { skipped: true } };
  try {
    const result = await withMockFallback({
      live: getActivityProvider(),
      mock: getActivityMockProvider(),
      params: { latitude: dest.lat, longitude: dest.lng, radius: 8 },
      domain: "concierge:activities",
    });
    return { offers: (result.offers || []).slice(0, 8), meta: result.meta };
  } catch (err) {
    return { offers: [], meta: { fallback: true } };
  }
}

async function searchVisa(intent) {
  const dest = resolveDestination(intent.destination);
  if (!dest?.country) return null;
  try {
    const result = await getVisaProvider().getByCountry(dest.country);
    return result;
  } catch {
    return { found: false, country: dest.country };
  }
}

async function searchPackages(intent) {
  const filter = { isActive: { $ne: false } };
  if (intent.destination) {
    const destIds = await Destination.find({
      name: new RegExp(intent.destination, "i"),
    })
      .select("_id")
      .limit(5)
      .lean();
    const or = [{ title: new RegExp(intent.destination, "i") }];
    if (destIds.length) {
      or.push({ destination: { $in: destIds.map((d) => d._id) } });
    }
    filter.$or = or;
  }
  if (intent.budgetINR) {
    const perPerson = Math.floor(intent.budgetINR / (intent.travelers || 2));
    filter.pricePerPerson = { $lte: perPerson * 1.15 };
  }
  const packages = await Package.find(filter).sort({ rating: -1 }).limit(5).lean();
  return packages;
}

async function searchGuides(intent) {
  const dest = resolveDestination(intent.destination);
  const city = dest?.label || intent.destination;
  if (!city) return [];
  return Guide.find({ isAvailable: true, city: new RegExp(city.split(",")[0], "i") })
    .populate("user", "name avatar nationality")
    .sort({ rating: -1 })
    .limit(4)
    .lean();
}

async function searchGroups(intent) {
  if (!intent.destination) return [];
  return GroupTrip.find({
    destination: new RegExp(intent.destination, "i"),
    status: { $in: ["open", "full"] },
  })
    .populate("creator", "name avatar")
    .sort({ departureDate: 1 })
    .limit(4)
    .lean();
}

async function searchTravelers(intent) {
  if (!intent.destination) return [];
  return TravelerMatch.find({
    destination: new RegExp(intent.destination, "i"),
    isActive: true,
  })
    .populate("user", "name avatar travelStyle interests")
    .limit(6)
    .lean();
}

async function geocodeDestination(intent) {
  const dest = resolveDestination(intent.destination);
  if (dest?.lat) return { lat: dest.lat, lng: dest.lng, label: dest.label };
  try {
    const maps = getMapsProvider();
    const geo = await maps.geocode(intent.destination);
    const loc = geo.results?.[0]?.location;
    if (loc) return { lat: loc.lat, lng: loc.lng, label: intent.destination };
  } catch {
    /* ignore */
  }
  return null;
}

async function runInventorySearch(intent) {
  const suggestions =
    intent.openDestination && !intent.destination
      ? suggestDestinations(intent)
      : [];

  const [flights, hotels, activities, visa, packages, guides, groups, travelers, geo] =
    await Promise.all([
      intent.destination ? searchFlights(intent) : Promise.resolve({ offers: [] }),
      intent.destination ? searchHotels(intent) : Promise.resolve({ offers: [] }),
      intent.destination ? searchActivities(intent) : Promise.resolve({ offers: [] }),
      intent.destination ? searchVisa(intent) : Promise.resolve(null),
      searchPackages(intent),
      intent.destination ? searchGuides(intent) : Promise.resolve([]),
      intent.destination ? searchGroups(intent) : Promise.resolve([]),
      intent.socialPreference || intent.tripType === "solo" ? searchTravelers(intent) : Promise.resolve([]),
      intent.destination ? geocodeDestination(intent) : Promise.resolve(null),
    ]);

  return {
    suggestions,
    flights,
    hotels,
    activities,
    visa,
    packages,
    guides,
    groups,
    travelers,
    geo,
  };
}

module.exports = {
  runInventorySearch,
  searchFlights,
  searchHotels,
  searchActivities,
  suggestDestinations,
};
