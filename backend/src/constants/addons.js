/** Booking add-on prices (INR per traveller unless noted). */
const ADDON_PRICES = {
  insurance: 1500,
  visa: 2500,
  airport_pickup: 1200,
  priority_support: 800,
};

const ADDON_LABELS = {
  insurance: "Travel Insurance",
  visa: "Visa Assistance",
  airport_pickup: "Airport Pickup",
  priority_support: "Priority Support",
};

module.exports = { ADDON_PRICES, ADDON_LABELS };
