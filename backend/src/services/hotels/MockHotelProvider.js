const { HotelProvider } = require("./HotelProvider");

const SAMPLE_HOTELS = {
  BKK: [
    { name: "Bangkok Riverside Retreat", pricePerNight: 6200, rating: 4.5 },
    { name: "Sukhumvit Grand Hotel", pricePerNight: 4800, rating: 4.2 },
    { name: "Old Town Heritage Inn", pricePerNight: 3500, rating: 4.0 },
  ],
  DXB: [
    { name: "Marina View Suites", pricePerNight: 12500, rating: 4.7 },
    { name: "Desert Palm Resort", pricePerNight: 9800, rating: 4.5 },
  ],
  SIN: [
    { name: "Orchard Central Hotel", pricePerNight: 14200, rating: 4.6 },
    { name: "Clarke Quay Boutique", pricePerNight: 8900, rating: 4.3 },
  ],
};

class MockHotelProvider extends HotelProvider {
  get name() {
    return "mock";
  }

  isLive() {
    return false;
  }

  async search(params) {
    const code = params.cityCode?.toUpperCase() || "BKK";
    const samples = SAMPLE_HOTELS[code] || SAMPLE_HOTELS.BKK;

    const offers = samples.map((h, i) => ({
      id: `mock_hotel_${code}_${i}`,
      name: h.name,
      cityCode: code,
      pricePerNight: h.pricePerNight,
      totalPrice: h.pricePerNight * 3,
      currency: "INR",
      rating: h.rating,
      provider: "mock",
    }));

    return { offers, meta: { provider: this.name, count: offers.length, demo: true } };
  }
}

module.exports = { MockHotelProvider };
