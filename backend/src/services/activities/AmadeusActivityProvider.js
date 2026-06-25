const { ActivityProvider } = require("./ActivityProvider");
const { getAmadeusClient } = require("../amadeus/client");

class AmadeusActivityProvider extends ActivityProvider {
  get name() {
    return "amadeus";
  }

  isLive() {
    return getAmadeusClient().isConfigured();
  }

  async search(params) {
    const client = getAmadeusClient();
    const data = await client.request("/v1/shopping/activities", {
      query: {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius || 5,
      },
    });

    const offers = (data.data || []).slice(0, 20).map((a) => ({
      id: a.id,
      name: a.name,
      shortDescription: a.shortDescription,
      price: Number(a.price?.amount || 0),
      currency: a.price?.currencyCode || "INR",
      rating: a.rating || null,
      pictures: a.pictures || [],
      provider: "amadeus",
      raw: a,
    }));

    return { offers, meta: { provider: this.name, count: offers.length } };
  }
}

module.exports = { AmadeusActivityProvider };
