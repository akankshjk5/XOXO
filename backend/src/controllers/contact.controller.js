const ContactMessage = require("../models/ContactMessage");
const SupportTicket = require("../models/SupportTicket");

/** POST /api/contact */
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "name, email, and message are required" });
    }

    const msg = await ContactMessage.create({ name, email, phone, subject, message });
    res.status(201).json({ success: true, message: "Message sent! We'll get back to you soon.", data: { id: msg._id } });
  } catch (err) {
    next(err);
  }
};

/** POST /api/support/tickets */
exports.createTicket = async (req, res, next) => {
  try {
    const { name, email, category, subject, description } = req.body;
    if (!name || !email || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "name, email, subject, and description are required",
      });
    }

    const ticket = await SupportTicket.create({
      user: req.user?._id,
      name,
      email,
      category: category || "other",
      subject,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created",
      data: { id: ticket._id, status: ticket.status },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/contact (admin) */
exports.listContact = async (req, res, next) => {
  try {
    const items = await ContactMessage.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/support/tickets (admin) */
exports.listTickets = async (req, res, next) => {
  try {
    const items = await SupportTicket.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};
