const { FlightProvider } = require("./FlightProvider");
const { getAmadeusClient } = require("../amadeus/client");

function parseDuration(iso) {
  if (!iso || !iso.startsWith("PT")) return 0;
  const h = iso.match(/(\d+)H/);
  const m = iso.match(/(\d+)M/);
  return (h ? Number(h[1]) : 0) * 60 + (m ? Number(m[1]) : 0);
}

function mapOffer(offer, dictionaries) {
  const seg = offer.itineraries?.[0]?.segments?.[0];
  const lastSeg = offer.itineraries?.[0]?.segments?.slice(-1)[0];
  const carrier = seg?.carrierCode || "";
  const airlineName = dictionaries?.carriers?.[carrier] || carrier;

  return {
    id: offer.id,
    airline: airlineName,
    airlineCode: carrier,
    origin: seg?.departure?.iataCode,
    destination: lastSeg?.arrival?.iataCode,
    departureAt: seg?.departure?.at,
    arrivalAt: lastSeg?.arrival?.at,
    durationMinutes: parseDuration(offer.itineraries?.[0]?.duration),
    stops: Math.max(0, (offer.itineraries?.[0]?.segments?.length || 1) - 1),
    price: Number(offer.price?.grandTotal || offer.price?.total || 0),
    currency: offer.price?.currency || "INR",
    provider: "amadeus",
    raw: offer,
  };
}

class AmadeusFlightProvider extends FlightProvider {
  get name() {
    return "amadeus";
  }

  isLive() {
    return getAmadeusClient().isConfigured();
  }

  async search(params) {
    const client = getAmadeusClient();
    const query = {
      originLocationCode: params.origin?.toUpperCase(),
      destinationLocationCode: params.destination?.toUpperCase(),
      departureDate: params.departureDate,
      adults: params.adults || 1,
      currencyCode: "INR",
      max: 20,
    };
    if (params.returnDate) query.returnDate = params.returnDate;
    if (params.travelClass) query.travelClass = params.travelClass;

    const data = await client.request("/v2/shopping/flight-offers", { query });
    const offers = (data.data || []).map((o) => mapOffer(o, data.dictionaries));

    return {
      offers,
      meta: { provider: this.name, count: offers.length, source: "GDS" },
    };
  }
}

module.exports = { AmadeusFlightProvider };
