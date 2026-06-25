/** Canonical transport mode identifiers for the Transport Hub. */
const TRANSPORT_MODES = {
  FLIGHT: "flight",
  BUS: "bus",
  TRAIN: "train",
  METRO: "metro",
  TAXI: "taxi",
  BIKE_TAXI: "bike_taxi",
  SELF_DRIVE: "self_drive",
  CAR_RENTAL: "car_rental",
  FERRY: "ferry",
  CRUISE: "cruise",
  AIRPORT_TRANSFER: "airport_transfer",
};

const MODE_LABELS = {
  flight: "Flights",
  bus: "Buses",
  train: "Trains",
  metro: "Metro",
  taxi: "Taxi",
  bike_taxi: "Bike Taxi",
  self_drive: "Self Drive",
  car_rental: "Car Rentals",
  ferry: "Ferries",
  cruise: "Cruises",
  airport_transfer: "Airport Transfers",
};

/** Modes searchable today (metro is future — returns empty with notice). */
const SEARCHABLE_MODES = Object.values(TRANSPORT_MODES).filter((m) => m !== TRANSPORT_MODES.METRO);

const FUTURE_MODES = [TRANSPORT_MODES.METRO];

module.exports = { TRANSPORT_MODES, MODE_LABELS, SEARCHABLE_MODES, FUTURE_MODES };
