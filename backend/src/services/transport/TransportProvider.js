/**
 * @typedef {Object} TransportSearchParams
 * @property {string} origin - City or IATA code
 * @property {string} destination
 * @property {string} departureDate - YYYY-MM-DD
 * @property {string} [returnDate]
 * @property {number} [passengers]
 * @property {string[]} [modes] - subset of mode ids to search
 */

/**
 * @typedef {Object} TransportOffer
 * @property {string} id
 * @property {string} mode - flight | bus | train | ...
 * @property {string} providerId - integration slug (e.g. mock-rail-partner)
 * @property {string} providerLabel - display name
 * @property {string} origin
 * @property {string} originLabel
 * @property {string} destination
 * @property {string} destinationLabel
 * @property {string} departureAt - ISO datetime
 * @property {string} arrivalAt
 * @property {number} durationMinutes
 * @property {number} stops
 * @property {number} price
 * @property {string} currency
 * @property {string} provider - live provider name or "mock"
 * @property {boolean} [live]
 * @property {string} [vehicleClass]
 * @property {string} [summary]
 * @property {Object} [raw]
 */

/**
 * Mode-level transport provider interface.
 * Each integration (live or mock) implements search for one or more modes.
 */
class TransportProvider {
  get id() {
    return "base";
  }

  get label() {
    return "Base";
  }

  /** @returns {string[]} */
  get modes() {
    return [];
  }

  isLive() {
    return false;
  }

  /**
   * @param {TransportSearchParams} _params
   * @returns {Promise<{ offers: TransportOffer[], meta: Object }>}
   */
  async search(_params) {
    throw new Error("TransportProvider.search not implemented");
  }
}

module.exports = { TransportProvider };
