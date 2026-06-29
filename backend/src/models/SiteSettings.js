const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    websiteName: { type: String, default: "XOXO Travels" },
    logo: { type: String, default: "" },
    contactEmail: { type: String, default: "hello@xoxotravels.com" },
    contactPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    socialFacebook: { type: String, default: "" },
    socialInstagram: { type: String, default: "" },
    socialTwitter: { type: String, default: "" },
    socialLinkedin: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
