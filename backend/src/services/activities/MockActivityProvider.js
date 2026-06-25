const { ActivityProvider } = require("./ActivityProvider");

const CITY_ACTIVITIES = {
  default: [
    { name: "Sunset Temple Tour", price: 2500, rating: 4.8 },
    { name: "Street Food Walk", price: 1800, rating: 4.6 },
    { name: "Island Hopping Day Trip", price: 6500, rating: 4.9 },
    { name: "Cultural Heritage Walk", price: 2200, rating: 4.5 },
  ],
};

class MockActivityProvider extends ActivityProvider {
  get name() {
    return "mock";
  }

  isLive() {
    return false;
  }

  async search(params) {
    const samples = CITY_ACTIVITIES.default;
    const offers = samples.map((a, i) => ({
      id: `mock_activity_${i}`,
      name: a.name,
      shortDescription: `Guided experience near ${params.latitude?.toFixed(2)}, ${params.longitude?.toFixed(2)}`,
      price: a.price,
      currency: "INR",
      rating: a.rating,
      pictures: [],
      provider: "mock",
    }));

    return { offers, meta: { provider: this.name, count: offers.length, demo: true } };
  }
}

module.exports = { MockActivityProvider };
