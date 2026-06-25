const { v2: cloudinary } = require("cloudinary");
const logger = require("./logger");
const { withRetry, logIntegrationFailure } = require("../utils/integration");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const uploadToCloudinary = async (filePath, folder = "xoxo-travels") => {
  try {
    const result = await withRetry(
      () =>
        cloudinary.uploader.upload(filePath, {
          folder,
          resource_type: "auto",
          overwrite: false,
        }),
      { label: "cloudinary:upload", maxAttempts: 3 }
    );
    logger.info("Cloudinary upload success", { folder, publicId: result.public_id });
    return result.secure_url;
  } catch (err) {
    logIntegrationFailure("cloudinary:upload", err, { folder });
    throw err;
  }
};

function getCloudinaryStatus() {
  return {
    configured: isConfigured(),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    folder: "xoxo-travels",
  };
}

module.exports = { cloudinary, uploadToCloudinary, isConfigured, getCloudinaryStatus };
