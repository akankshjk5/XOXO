const {
  getFlightProvider,
  getFlightMockProvider,
  getHotelProvider,
  getHotelMockProvider,
  getActivityProvider,
  getActivityMockProvider,
  getVisaProvider,
  getMapsProvider,
  getProviderStatus,
} = require("../services");
const { withMockFallback } = require("../utils/integration");

// GET /api/inventory/status
exports.status = async (req, res) => {
  res.json({ success: true, data: getProviderStatus() });
};

// GET /api/inventory/flights?origin=DEL&destination=BKK&departureDate=2026-08-01&adults=2
exports.searchFlights = async (req, res, next) => {
  try {
    const { origin, destination, departureDate, returnDate, adults, travelClass } = req.query;
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        message: "origin, destination, and departureDate are required",
      });
    }
    const params = {
      origin,
      destination,
      departureDate,
      returnDate,
      adults: Number(adults) || 1,
      travelClass,
    };
    const result = await withMockFallback({
      live: getFlightProvider(),
      mock: getFlightMockProvider(),
      params,
      domain: "amadeus:flights",
    });
    res.json({ success: true, data: result.offers, meta: result.meta });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/hotels?cityCode=BKK&checkIn=2026-08-01&checkOut=2026-08-04&adults=2
exports.searchHotels = async (req, res, next) => {
  try {
    const { cityCode, checkIn, checkOut, adults, rooms } = req.query;
    if (!cityCode || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "cityCode, checkIn, and checkOut are required",
      });
    }
    const params = {
      cityCode,
      checkIn,
      checkOut,
      adults: Number(adults) || 2,
      rooms: Number(rooms) || 1,
    };
    const result = await withMockFallback({
      live: getHotelProvider(),
      mock: getHotelMockProvider(),
      params,
      domain: "amadeus:hotels",
    });
    res.json({ success: true, data: result.offers, meta: result.meta });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/activities?latitude=13.75&longitude=100.52&radius=5
exports.searchActivities = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "latitude and longitude are required",
      });
    }
    const params = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      radius,
    };
    const result = await withMockFallback({
      live: getActivityProvider(),
      mock: getActivityMockProvider(),
      params,
      domain: "amadeus:activities",
    });
    res.json({ success: true, data: result.offers, meta: result.meta });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/places/autocomplete?q=Bangkok
exports.placesAutocomplete = async (req, res, next) => {
  try {
    const q = req.query.q || req.query.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: { predictions: [] } });
    }
    const provider = getMapsProvider();
    const result = await provider.autocomplete(q);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/places/geocode?address=Bangkok
exports.geocode = async (req, res, next) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ success: false, message: "address is required" });
    }
    const provider = getMapsProvider();
    const result = await provider.geocode(address);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/places/details?placeId=ChIJ...
exports.placeDetails = async (req, res, next) => {
  try {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({ success: false, message: "placeId is required" });
    }
    const provider = getMapsProvider();
    const result = await provider.placeDetails(placeId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// Re-export visa via provider for unified inventory API
exports.listVisa = async (req, res, next) => {
  try {
    const data = await getVisaProvider().list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getVisa = async (req, res, next) => {
  try {
    const result = await getVisaProvider().getByCountry(req.params.country);
    if (!result.found) {
      return res.json({
        success: true,
        found: false,
        message:
          "We don't have detailed visa info for this destination yet. Submit an inquiry and our visa team will get back within 24 hours.",
      });
    }
    res.json({ success: true, found: true, country: result.country, data: result.data });
  } catch (err) {
    next(err);
  }
};

exports.visaInquiry = async (req, res, next) => {
  try {
    const { name, email, destination } = req.body;
    if (!name || !email || !destination) {
      return res
        .status(400)
        .json({ success: false, message: "name, email and destination are required" });
    }
    await getVisaProvider().submitInquiry(req.body);
    res.status(201).json({
      success: true,
      message: "Thanks! Our visa team will contact you within 24 hours.",
    });
  } catch (err) {
    next(err);
  }
};
