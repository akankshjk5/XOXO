const { TransportProvider } = require("./TransportProvider");
const { getMockOffersForMode } = require("./mock-data");
const { TRANSPORT_MODES } = require("./modes");

const MOCK_MODES = [
  TRANSPORT_MODES.BUS,
  TRANSPORT_MODES.TRAIN,
  TRANSPORT_MODES.TAXI,
  TRANSPORT_MODES.BIKE_TAXI,
  TRANSPORT_MODES.SELF_DRIVE,
  TRANSPORT_MODES.CAR_RENTAL,
  TRANSPORT_MODES.FERRY,
  TRANSPORT_MODES.CRUISE,
  TRANSPORT_MODES.AIRPORT_TRANSFER,
];

class MockTransportProvider extends TransportProvider {
  get id() {
    return "mock-transport";
  }

  get label() {
    return "Mock Transport";
  }

  get modes() {
    return MOCK_MODES;
  }

  isLive() {
    return false;
  }

  async search(params) {
    const requested = params.modes?.length ? params.modes : MOCK_MODES;
    const offers = [];
    for (const mode of requested) {
      if (MOCK_MODES.includes(mode)) {
        offers.push(...getMockOffersForMode(mode, params));
      }
    }
    return {
      offers,
      meta: { provider: this.id, live: false, demo: true, count: offers.length },
    };
  }
}

module.exports = { MockTransportProvider };
