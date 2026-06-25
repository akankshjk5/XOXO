const { getVisaProvider } = require("../services");

// GET /api/visa/:country
exports.getInfo = async (req, res, next) => {
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

// GET /api/visa
exports.list = async (req, res, next) => {
  try {
    const data = await getVisaProvider().list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/visa/inquiry
exports.inquiry = async (req, res, next) => {
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
