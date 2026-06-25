/**
 * @typedef {Object} FlightSearchParams
 * @property {string} origin - IATA airport code (e.g. DEL)
 * @property {string} destination - IATA airport code (e.g. BKK)
 * @property {string} departureDate - YYYY-MM-DD
 * @property {string} [returnDate] - YYYY-MM-DD for round trip
 * @property {number} [adults]
 * @property {string} [travelClass] - ECONOMY | PREMIUM_ECONOMY | BUSINESS | FIRST
 */

/**
 * @typedef {Object} FlightOffer
 * @property {string} id
 * @property {string} airline
 * @property {string} airlineCode
 * @property {string} origin
 * @property {string} destination
 * @property {string} departureAt
 * @property {string} arrivalAt
 * @property {number} durationMinutes
 * @property {number} stops
 * @property {number} price
 * @property {string} currency
 * @property {string} provider
 * @property {Object} [raw] - provider-specific payload
 */

/**
 * Flight inventory provider interface.
 * Implementations: AmadeusFlightProvider, MockFlightProvider
 */
class FlightProvider {
  get name() {
    return "base";
  }

  isLive() {
    return false;
  }

  /**
   * @param {FlightSearchParams} _params
   * @returns {Promise<{ offers: FlightOffer[], meta: Object }>}
   */
  async search(_params) {
    throw new Error("FlightProvider.search not implemented");
  }
}

module.exports = { FlightProvider };
