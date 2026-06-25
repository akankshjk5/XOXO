const { HotelProvider } = require("./HotelProvider");
const { getAmadeusClient } = require("../amadeus/client");

class AmadeusHotelProvider extends HotelProvider {
  get name() {
    return "amadeus";
  }

  isLive() {
    return getAmadeusClient().isConfigured();
  }

  async search(params) {
    const client = getAmadeusClient();

    const listRes = await client.request("/v1/reference-data/locations/hotels/by-city", {
      query: { cityCode: params.cityCode?.toUpperCase() },
    });

    const hotelIds = (listRes.data || []).slice(0, 10).map((h) => h.hotelId);
    if (!hotelIds.length) {
      return { offers: [], meta: { provider: this.name, count: 0 } };
    }

    const offersRes = await client.request("/v3/shopping/hotel-offers", {
      query: {
        hotelIds: hotelIds.join(","),
        adults: params.adults || 2,
        checkInDate: params.checkIn,
        checkOutDate: params.checkOut,
        roomQuantity: params.rooms || 1,
        currency: "INR",
      },
    });

    const offers = (offersRes.data || []).map((item) => {
      const hotel = item.hotel || {};
      const offer = item.offers?.[0];
      const price = Number(offer?.price?.total || 0);
      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(params.checkOut) - new Date(params.checkIn)) / (1000 * 60 * 60 * 24)
        )
      );

      return {
        id: offer?.id || hotel.hotelId,
        name: hotel.name || "Hotel",
        cityCode: params.cityCode?.toUpperCase(),
        pricePerNight: Math.round(price / nights),
        totalPrice: price,
        currency: offer?.price?.currency || "INR",
        rating: hotel.rating || 4,
        provider: "amadeus",
        raw: item,
      };
    });

    return { offers, meta: { provider: this.name, count: offers.length } };
  }
}

module.exports = { AmadeusHotelProvider };
