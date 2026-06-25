const { searchTransportHub } = require("../services/transport/hub");
const { getTransportStatus, listModes } = require("../services/transport/registry");

// GET /api/transport/status
exports.status = (req, res) => {
  res.json({ success: true, data: getTransportStatus() });
};

// GET /api/transport/modes
exports.modes = (req, res) => {
  res.json({ success: true, data: listModes() });
};

// GET /api/transport/search
exports.search = async (req, res, next) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      modes,
      maxPrice,
      minPrice,
      maxDuration,
      maxStops,
      departureAfter,
      departureBefore,
      providerId,
      providerLabel,
      sort,
    } = req.query;

    const result = await searchTransportHub(
      { origin, destination, departureDate, returnDate, passengers, modes },
      {
        maxPrice,
        minPrice,
        maxDuration,
        maxStops,
        departureAfter,
        departureBefore,
        providerId,
        providerLabel,
        sort,
      }
    );

    res.json({ success: true, ...result });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// GET /api/transport/recommendations — convenience alias
exports.recommendations = async (req, res, next) => {
  try {
    const { origin, destination, departureDate, passengers, modes } = req.query;
    const result = await searchTransportHub({
      origin,
      destination,
      departureDate,
      passengers,
      modes,
    });
    res.json({
      success: true,
      recommendations: result.recommendations,
      meta: result.meta,
    });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};
