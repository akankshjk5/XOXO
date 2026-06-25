/**
 * @typedef {Object} ActivitySearchParams
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} [radius] - e.g. "5" km
 */

class ActivityProvider {
  get name() {
    return "base";
  }

  isLive() {
    return false;
  }

  async search(_params) {
    throw new Error("ActivityProvider.search not implemented");
  }
}

module.exports = { ActivityProvider };
