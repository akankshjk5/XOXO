const { VisaProvider } = require("./VisaProvider");
const VisaInquiry = require("../../models/VisaInquiry");
const { sendVisaInquiryEmail } = require("../../utils/emailTemplates");

const VISA_DATA = {
  thailand: { type: "Visa on Arrival / e-Visa", processing: "15 min (VoA) – 3 days (e-Visa)", fee: "₹2,000", stay: "30 days", docs: ["Passport (6m validity)", "Return ticket", "Hotel booking", "2 photos"] },
  maldives: { type: "Free Visa on Arrival", processing: "On arrival", fee: "Free", stay: "30 days", docs: ["Passport (6m validity)", "Return ticket", "Hotel booking", "Funds proof"] },
  "sri lanka": { type: "ETA (Electronic Travel Authorization)", processing: "24–72 hours", fee: "₹1,600", stay: "30 days", docs: ["Passport (6m validity)", "Return ticket", "ETA approval"] },
  vietnam: { type: "e-Visa", processing: "3–5 days", fee: "₹2,100", stay: "30 days", docs: ["Passport (6m validity)", "Passport photo (scan)", "Return ticket"] },
  bali: { type: "Visa on Arrival", processing: "On arrival", fee: "₹3,000", stay: "30 days", docs: ["Passport (6m validity)", "Return ticket", "Hotel booking"] },
  indonesia: { type: "Visa on Arrival", processing: "On arrival", fee: "₹3,000", stay: "30 days", docs: ["Passport (6m validity)", "Return ticket", "Hotel booking"] },
  dubai: { type: "e-Visa (pre-arranged)", processing: "3–4 days", fee: "₹6,500", stay: "30 days", docs: ["Passport (6m validity)", "Photo", "Confirmed ticket"] },
  uae: { type: "e-Visa (pre-arranged)", processing: "3–4 days", fee: "₹6,500", stay: "30 days", docs: ["Passport (6m validity)", "Photo", "Confirmed ticket"] },
  singapore: { type: "e-Visa (via authorised agent)", processing: "3–5 days", fee: "₹2,000", stay: "30 days", docs: ["Passport (6m validity)", "Form 14A", "Photo", "Bank statement"] },
  malaysia: { type: "eNTRI / eVISA", processing: "1–3 days", fee: "₹1,200", stay: "15–30 days", docs: ["Passport (6m validity)", "Return ticket", "Hotel booking"] },
  mauritius: { type: "Free Visa on Arrival", processing: "On arrival", fee: "Free", stay: "60 days", docs: ["Passport (6m validity)", "Return ticket", "Hotel booking"] },
  switzerland: { type: "Schengen Visa", processing: "15 working days", fee: "₹8,000", stay: "90 days", docs: ["Passport", "Travel insurance", "Itinerary", "Bank statements", "Photos"] },
  france: { type: "Schengen Visa", processing: "15 working days", fee: "₹8,000", stay: "90 days", docs: ["Passport", "Travel insurance", "Itinerary", "Bank statements", "Photos"] },
};

class StaticVisaProvider extends VisaProvider {
  get name() {
    return "static";
  }

  isLive() {
    return true;
  }

  async list() {
    return Object.entries(VISA_DATA).map(([country, d]) => ({ country, ...d }));
  }

  async getByCountry(country) {
    const key = String(country || "").toLowerCase().trim();
    const info = VISA_DATA[key];
    if (!info) return { found: false, country: key };
    return { found: true, country: key, data: info };
  }

  async submitInquiry(payload) {
    const inquiry = await VisaInquiry.create(payload);
    await sendVisaInquiryEmail(inquiry).catch(() => {});
    return inquiry;
  }
}

module.exports = { StaticVisaProvider, VISA_DATA };
