const { FlightProvider } = require("./FlightProvider");

/** Curated sample offers when Amadeus keys are not configured. */
const SAMPLE_ROUTES = {
  "DEL-BKK": [
    { airline: "IndiGo", airlineCode: "6E", price: 18450, durationMinutes: 255, stops: 0 },
    { airline: "Thai Airways", airlineCode: "TG", price: 22100, durationMinutes: 270, stops: 0 },
    { airline: "Air India", airlineCode: "AI", price: 19800, durationMinutes: 320, stops: 1 },
  ],
  "DEL-DXB": [
    { airline: "Emirates", airlineCode: "EK", price: 24500, durationMinutes: 210, stops: 0 },
    { airline: "IndiGo", airlineCode: "6E", price: 18900, durationMinutes: 225, stops: 0 },
  ],
  "BOM-SIN": [
    { airline: "Singapore Airlines", airlineCode: "SQ", price: 31200, durationMinutes: 330, stops: 0 },
    { airline: "Air India", airlineCode: "AI", price: 26800, durationMinutes: 360, stops: 1 },
  ],
};

class MockFlightProvider extends FlightProvider {
  get name() {
    return "mock";
  }

  isLive() {
    return false;
  }

  async search(params) {
    const key = `${params.origin?.toUpperCase()}-${params.destination?.toUpperCase()}`;
    const samples = SAMPLE_ROUTES[key] || SAMPLE_ROUTES["DEL-BKK"];

    const offers = samples.map((s, i) => ({
      id: `mock_flight_${key}_${i}`,
      airline: s.airline,
      airlineCode: s.airlineCode,
      origin: params.origin?.toUpperCase(),
      destination: params.destination?.toUpperCase(),
      departureAt: `${params.departureDate}T08:30:00`,
      arrivalAt: `${params.departureDate}T14:45:00`,
      durationMinutes: s.durationMinutes,
      stops: s.stops,
      price: s.price,
      currency: "INR",
      provider: "mock",
    }));

    return {
      offers,
      meta: { provider: this.name, count: offers.length, demo: true },
    };
  }
}

module.exports = { MockFlightProvider };
