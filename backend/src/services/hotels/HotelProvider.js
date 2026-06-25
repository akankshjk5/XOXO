/**
 * @typedef {Object} HotelSearchParams
 * @property {string} cityCode - IATA city code (e.g. BKK)
 * @property {string} checkIn - YYYY-MM-DD
 * @property {string} checkOut - YYYY-MM-DD
 * @property {number} [adults]
 * @property {number} [rooms]
 */

/**
 * @typedef {Object} HotelOffer
 * @property {string} id
 * @property {string} name
 * @property {string} cityCode
 * @property {number} pricePerNight
 * @property {string} currency
 * @property {number} rating
 * @property {string} provider
 */

class HotelProvider {
  get name() {
    return "base";
  }

  isLive() {
    return false;
  }

  async search(_params) {
    throw new Error("HotelProvider.search not implemented");
  }
}

module.exports = { HotelProvider };
