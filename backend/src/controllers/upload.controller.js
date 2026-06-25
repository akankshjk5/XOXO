const fs = require("fs");
const path = require("path");
const { uploadToCloudinary, isConfigured } = require("../config/cloudinary");
const { logIntegrationFailure } = require("../utils/integration");
const logger = require("../config/logger");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

// POST /api/upload  (multipart field: "file")
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    if (isConfigured()) {
      try {
        const url = await uploadToCloudinary(req.file.path, "xoxo-travels");
        fs.unlink(req.file.path, () => {});
        return res.json({ success: true, url, provider: "cloudinary", live: true });
      } catch (err) {
        logIntegrationFailure("cloudinary:upload", err, { fallback: "local" });
        logger.warn("Cloudinary upload failed, using local disk", { error: err.message });
      }
    }

    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const filename = path.basename(req.file.path);
    const dest = path.join(UPLOAD_DIR, filename);
    fs.renameSync(req.file.path, dest);
    const url = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    res.json({
      success: true,
      url,
      provider: "local",
      live: false,
      demo: !isConfigured(),
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadStatus = (req, res) => {
  const { getCloudinaryStatus } = require("../config/cloudinary");
  res.json({ success: true, data: getCloudinaryStatus() });
};
