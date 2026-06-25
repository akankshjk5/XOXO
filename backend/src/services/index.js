const { getAmadeusClient } = require("./amadeus/client");
const { AmadeusFlightProvider } = require("./flights/AmadeusFlightProvider");
const { MockFlightProvider } = require("./flights/MockFlightProvider");
const { AmadeusHotelProvider } = require("./hotels/AmadeusHotelProvider");
const { MockHotelProvider } = require("./hotels/MockHotelProvider");
const { AmadeusActivityProvider } = require("./activities/AmadeusActivityProvider");
const { MockActivityProvider } = require("./activities/MockActivityProvider");
const { StaticVisaProvider } = require("./visa/StaticVisaProvider");
const { GoogleMapsProvider } = require("./maps/GoogleMapsProvider");
const { getRazorpayStatus } = require("../utils/razorpay");
const { getEmailStatus } = require("../utils/email");
const { getCloudinaryStatus } = require("../config/cloudinary");

let flightsLive = null;
let flightsMock = null;
let hotelsLive = null;
let hotelsMock = null;
let activitiesLive = null;
let activitiesMock = null;
let visa = null;
let maps = null;

function getFlightProvider() {
  if (!flightsMock) flightsMock = new MockFlightProvider();
  if (getAmadeusClient().isConfigured()) {
    if (!flightsLive) flightsLive = new AmadeusFlightProvider();
    return flightsLive;
  }
  return flightsMock;
}

function getFlightMockProvider() {
  if (!flightsMock) flightsMock = new MockFlightProvider();
  return flightsMock;
}

function getHotelProvider() {
  if (!hotelsMock) hotelsMock = new MockHotelProvider();
  if (getAmadeusClient().isConfigured()) {
    if (!hotelsLive) hotelsLive = new AmadeusHotelProvider();
    return hotelsLive;
  }
  return hotelsMock;
}

function getHotelMockProvider() {
  if (!hotelsMock) hotelsMock = new MockHotelProvider();
  return hotelsMock;
}

function getActivityProvider() {
  if (!activitiesMock) activitiesMock = new MockActivityProvider();
  if (getAmadeusClient().isConfigured()) {
    if (!activitiesLive) activitiesLive = new AmadeusActivityProvider();
    return activitiesLive;
  }
  return activitiesMock;
}

function getActivityMockProvider() {
  if (!activitiesMock) activitiesMock = new MockActivityProvider();
  return activitiesMock;
}

function getVisaProvider() {
  if (!visa) visa = new StaticVisaProvider();
  return visa;
}

function getMapsProvider() {
  if (!maps) maps = new GoogleMapsProvider();
  return maps;
}

function getProviderStatus() {
  const flight = getFlightProvider();
  const hotel = getHotelProvider();
  const activity = getActivityProvider();
  const mapsProvider = getMapsProvider();

  return {
    flights: { provider: flight.name, live: flight.isLive() },
    hotels: { provider: hotel.name, live: hotel.isLive() },
    activities: { provider: activity.name, live: activity.isLive() },
    visa: { provider: getVisaProvider().name, live: true },
    maps: { provider: mapsProvider.name, live: mapsProvider.isLive() },
    amadeus: getAmadeusClient().isConfigured(),
    amadeusEnv: process.env.AMADEUS_ENV === "production" ? "production" : "test",
    payments: getRazorpayStatus(),
    email: getEmailStatus(),
    uploads: getCloudinaryStatus(),
  };
}

module.exports = {
  getFlightProvider,
  getFlightMockProvider,
  getHotelProvider,
  getHotelMockProvider,
  getActivityProvider,
  getActivityMockProvider,
  getVisaProvider,
  getMapsProvider,
  getProviderStatus,
};
