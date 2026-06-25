const { TransportProvider } = require("./TransportProvider");
const { TRANSPORT_MODES } = require("./modes");
const { getAmadeusClient } = require("../amadeus/client");
const { AmadeusFlightProvider } = require("../flights/AmadeusFlightProvider");
const { MockFlightProvider } = require("../flights/MockFlightProvider");
const { withMockFallback } = require("../../utils/integration");

let flightsLive = null;
let flightsMock = null;

function getFlightLive() {
  if (!flightsMock) flightsMock = new MockFlightProvider();
  if (getAmadeusClient().isConfigured()) {
    if (!flightsLive) flightsLive = new AmadeusFlightProvider();
    return flightsLive;
  }
  return flightsMock;
}

function getFlightMock() {
  if (!flightsMock) flightsMock = new MockFlightProvider();
  return flightsMock;
}

/** Adapts the existing flight inventory provider to the unified TransportOffer shape. */
class FlightTransportAdapter extends TransportProvider {
  get id() {
    return "flight-adapter";
  }

  get label() {
    return "Flight Inventory";
  }

  get modes() {
    return [TRANSPORT_MODES.FLIGHT];
  }

  isLive() {
    return getFlightLive().isLive();
  }

  async search(params) {
    const flightParams = {
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.passengers || 1,
    };

    const result = await withMockFallback({
      live: getFlightLive(),
      mock: getFlightMock(),
      params: flightParams,
      domain: "amadeus:flights",
    });

    const offers = (result.offers || []).map((f) => ({
      id: f.id,
      mode: TRANSPORT_MODES.FLIGHT,
      providerId: f.provider || "flight",
      providerLabel: f.airline,
      origin: f.origin,
      originLabel: f.origin,
      destination: f.destination,
      destinationLabel: f.destination,
      departureAt: f.departureAt,
      arrivalAt: f.arrivalAt,
      durationMinutes: f.durationMinutes,
      stops: f.stops ?? 0,
      price: f.price,
      currency: f.currency || "INR",
      provider: f.provider,
      live: f.provider !== "mock",
      vehicleClass: "Economy",
      summary: `${f.airline} · ${f.stops === 0 ? "Non-stop" : `${f.stops} stop(s)`}`,
      raw: f.raw,
    }));

    return {
      offers,
      meta: { ...result.meta, provider: this.id, mode: TRANSPORT_MODES.FLIGHT },
    };
  }
}

module.exports = { FlightTransportAdapter };
