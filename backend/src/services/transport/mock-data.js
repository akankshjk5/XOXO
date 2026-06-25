/**
 * Generic mock transport samples — no third-party brand names.
 * Keys: ORIGIN-DEST (uppercase city codes or names).
 */

const ROUTE = "DEL-MUM";

const TEMPLATES = {
  bus: [
    { providerId: "mock-coach-a", providerLabel: "Premium Coach Network", price: 899, duration: 1380, stops: 2, dep: "22:00", vehicleClass: "Sleeper AC" },
    { providerId: "mock-coach-b", providerLabel: "Intercity Bus Express", price: 649, duration: 1500, stops: 3, dep: "20:30", vehicleClass: "Semi-Sleeper" },
    { providerId: "mock-coach-c", providerLabel: "Comfort Line Coaches", price: 1199, duration: 1320, stops: 1, dep: "23:15", vehicleClass: "Volvo Multi-Axle" },
  ],
  train: [
    { providerId: "mock-rail-a", providerLabel: "National Rail Partner", price: 1450, duration: 960, stops: 4, dep: "06:10", vehicleClass: "AC 3 Tier" },
    { providerId: "mock-rail-b", providerLabel: "Express Rail Connect", price: 2890, duration: 840, stops: 2, dep: "16:35", vehicleClass: "AC 2 Tier" },
    { providerId: "mock-rail-c", providerLabel: "Premium Rail Service", price: 5200, duration: 780, stops: 1, dep: "08:00", vehicleClass: "AC First" },
  ],
  taxi: [
    { providerId: "mock-cab-a", providerLabel: "City Taxi Network", price: 4200, duration: 120, stops: 0, dep: "09:00", vehicleClass: "Sedan" },
    { providerId: "mock-cab-b", providerLabel: "Metro Cab Alliance", price: 3800, duration: 135, stops: 0, dep: "14:00", vehicleClass: "Hatchback" },
  ],
  bike_taxi: [
    { providerId: "mock-bike-a", providerLabel: "QuickRide Partners", price: 450, duration: 45, stops: 0, dep: "10:00", vehicleClass: "Bike" },
    { providerId: "mock-bike-b", providerLabel: "Urban Bike Express", price: 380, duration: 50, stops: 0, dep: "11:30", vehicleClass: "Bike" },
  ],
  self_drive: [
    { providerId: "mock-drive-a", providerLabel: "SelfDrive Rentals", price: 2200, duration: 1440, stops: 0, dep: "08:00", vehicleClass: "Hatchback" },
    { providerId: "mock-drive-b", providerLabel: "Freedom Wheels", price: 3500, duration: 1440, stops: 0, dep: "08:00", vehicleClass: "SUV" },
  ],
  car_rental: [
    { providerId: "mock-rental-a", providerLabel: "DriveEasy Rentals", price: 2800, duration: 1440, stops: 0, dep: "09:00", vehicleClass: "Compact" },
    { providerId: "mock-rental-b", providerLabel: "Premium Car Hire", price: 5500, duration: 1440, stops: 0, dep: "09:00", vehicleClass: "Luxury Sedan" },
  ],
  ferry: [
    { providerId: "mock-ferry-a", providerLabel: "Coastal Ferry Lines", price: 3200, duration: 180, stops: 0, dep: "07:30", vehicleClass: "Economy Deck" },
    { providerId: "mock-ferry-b", providerLabel: "Island Link Ferries", price: 4800, duration: 165, stops: 0, dep: "14:00", vehicleClass: "Premium Cabin" },
  ],
  cruise: [
    { providerId: "mock-cruise-a", providerLabel: "Ocean Voyager Cruises", price: 45000, duration: 4320, stops: 2, dep: "18:00", vehicleClass: "Interior Cabin" },
    { providerId: "mock-cruise-b", providerLabel: "Horizon Cruise Co.", price: 78000, duration: 5760, stops: 3, dep: "17:00", vehicleClass: "Balcony Suite" },
  ],
  airport_transfer: [
    { providerId: "mock-transfer-a", providerLabel: "Airport Shuttle Co.", price: 1200, duration: 55, stops: 0, dep: "06:00", vehicleClass: "Shared Shuttle" },
    { providerId: "mock-transfer-b", providerLabel: "Private Transfer Plus", price: 2400, duration: 45, stops: 0, dep: "Anytime", vehicleClass: "Private SUV" },
  ],
};

function buildOffers(mode, params, templates) {
  const origin = params.origin?.toUpperCase() || "DEL";
  const dest = params.destination?.toUpperCase() || "MUM";
  const date = params.departureDate || new Date().toISOString().slice(0, 10);
  const routeKey = `${origin}-${dest}`;

  return templates.map((t, i) => {
    const depTime = t.dep === "Anytime" ? "10:00" : t.dep;
    const depAt = `${date}T${depTime}:00`;
    const arrDate = new Date(`${date}T${depTime}:00`);
    arrDate.setMinutes(arrDate.getMinutes() + t.duration);
    return {
      id: `mock_${mode}_${routeKey}_${i}`,
      mode,
      providerId: t.providerId,
      providerLabel: t.providerLabel,
      origin,
      originLabel: origin,
      destination: dest,
      destinationLabel: dest,
      departureAt: depAt,
      arrivalAt: arrDate.toISOString(),
      durationMinutes: t.duration,
      stops: t.stops,
      price: t.price * (params.passengers || 1),
      currency: "INR",
      provider: "mock",
      live: false,
      vehicleClass: t.vehicleClass,
      summary: `${t.providerLabel} · ${t.vehicleClass}`,
    };
  });
}

function getMockOffersForMode(mode, params) {
  const templates = TEMPLATES[mode];
  if (!templates) return [];
  return buildOffers(mode, params, templates);
}

module.exports = { TEMPLATES, getMockOffersForMode, ROUTE };
