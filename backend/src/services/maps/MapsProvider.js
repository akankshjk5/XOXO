class MapsProvider {
  get name() {
    return "base";
  }

  isLive() {
    return false;
  }

  async autocomplete(_query) {
    throw new Error("MapsProvider.autocomplete not implemented");
  }

  async geocode(_address) {
    throw new Error("MapsProvider.geocode not implemented");
  }

  async placeDetails(_placeId) {
    throw new Error("MapsProvider.placeDetails not implemented");
  }
}

module.exports = { MapsProvider };
