const NewsletterSubscriber = require("../models/NewsletterSubscriber");

/** POST /api/newsletter/subscribe */
exports.subscribe = async (req, res, next) => {
  try {
    const { email, name, source } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return res.json({ success: true, message: "You're already subscribed!", data: { email: existing.email } });
    }

    const sub = await NewsletterSubscriber.create({
      email: email.toLowerCase().trim(),
      name,
      source: source || "website",
    });

    res.status(201).json({ success: true, message: "Subscribed successfully!", data: { email: sub.email } });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/newsletter/export */
exports.exportCsv = async (req, res, next) => {
  try {
    const subs = await NewsletterSubscriber.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    const header = "email,name,source,subscribedAt\n";
    const rows = subs
      .map((s) =>
        [s.email, s.name || "", s.source || "", s.createdAt?.toISOString() || ""]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="newsletter-subscribers.csv"');
    res.send(header + rows);
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/newsletter/count */
exports.count = async (req, res, next) => {
  try {
    const total = await NewsletterSubscriber.countDocuments({ isActive: true });
    res.json({ success: true, data: { total } });
  } catch (err) {
    next(err);
  }
};
