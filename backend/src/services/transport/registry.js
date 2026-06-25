const { FlightTransportAdapter } = require("./FlightTransportAdapter");
const { MockTransportProvider } = require("./MockTransportProvider");
const { MODE_LABELS, TRANSPORT_MODES, FUTURE_MODES } = require("./modes");

let providers = null;

function getTransportProviders() {
  if (!providers) {
    providers = [new FlightTransportAdapter(), new MockTransportProvider()];
  }
  return providers;
}

function getProviderForMode(mode) {
  return getTransportProviders().find((p) => p.modes.includes(mode));
}

function listModes() {
  return Object.entries(MODE_LABELS).map(([id, label]) => ({
    id,
    label,
    future: FUTURE_MODES.includes(id),
    providers: getTransportProviders()
      .filter((p) => p.modes.includes(id))
      .map((p) => ({ id: p.id, label: p.label, live: p.isLive() })),
  }));
}

function getTransportStatus() {
  return {
    modes: listModes(),
    integrations: getTransportProviders().map((p) => ({
      id: p.id,
      label: p.label,
      modes: p.modes,
      live: p.isLive(),
    })),
  };
}

module.exports = {
  getTransportProviders,
  getProviderForMode,
  listModes,
  getTransportStatus,
  TRANSPORT_MODES,
};
