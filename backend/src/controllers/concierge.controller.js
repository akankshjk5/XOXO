const crypto = require("crypto");
const ConciergeSession = require("../models/ConciergeSession");
const Itinerary = require("../models/Itinerary");
const { processMessage, streamText } = require("../services/concierge/orchestrator");

function sessionResponse(session) {
  return {
    id: session._id,
    title: session.title,
    status: session.status,
    messages: session.messages,
    intent: session.intent,
    missingFields: session.missingFields,
    searchResults: session.searchResults,
    plan: session.plan,
    shareToken: session.shareToken,
    savedItineraryId: session.savedItineraryId,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

async function loadSession(req, res) {
  const session = await ConciergeSession.findById(req.params.id);
  if (!session) {
    res.status(404).json({ success: false, message: "Session not found" });
    return null;
  }
  const isOwner =
    (req.user && session.user && String(session.user) === String(req.user._id)) ||
    (req.headers["x-guest-id"] && session.guestId === req.headers["x-guest-id"]);
  if (session.user && !req.user && !isOwner) {
    res.status(401).json({ success: false, message: "Login required" });
    return null;
  }
  if (!session.user && req.headers["x-guest-id"] && session.guestId !== req.headers["x-guest-id"]) {
    res.status(403).json({ success: false, message: "Invalid session access" });
    return null;
  }
  return session;
}

// POST /api/concierge/sessions
exports.createSession = async (req, res, next) => {
  try {
    const guestId = req.headers["x-guest-id"] || crypto.randomUUID();
    const session = await ConciergeSession.create({
      user: req.user?._id,
      guestId: req.user ? undefined : guestId,
      messages: [
        {
          role: "assistant",
          content:
            "Hi! I'm your XOXO Travel Concierge ✨ Tell me your budget, dates, and dream destination — I'll search live flights, hotels, activities, and build your complete trip plan.",
        },
      ],
    });
    res.status(201).json({
      success: true,
      data: sessionResponse(session),
      guestId: req.user ? undefined : guestId,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/concierge/sessions/:id
exports.getSession = async (req, res, next) => {
  try {
    const session = await loadSession(req, res);
    if (!session) return;
    res.json({ success: true, data: sessionResponse(session) });
  } catch (err) {
    next(err);
  }
};

// GET /api/concierge/share/:token
exports.getShared = async (req, res, next) => {
  try {
    const session = await ConciergeSession.findOne({ shareToken: req.params.token });
    if (!session) return res.status(404).json({ success: false, message: "Not found" });
    res.json({
      success: true,
      data: {
        title: session.title,
        plan: session.plan,
        intent: session.intent,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/concierge/sessions/:id/message
exports.sendMessage = async (req, res, next) => {
  try {
    const session = await loadSession(req, res);
    if (!session) return;
    const { message, stream } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "message is required" });
    }

    session.messages.push({ role: "user", content: message.trim() });
    const result = await processMessage(session, message.trim());
    session.messages.push({ role: "assistant", content: result.assistantText });
    await session.save();

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      for await (const chunk of streamText(result.assistantText)) {
        res.write(`event: token\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write(`event: done\ndata: ${JSON.stringify({ session: sessionResponse(session) })}\n\n`);
      return res.end();
    }

    res.json({ success: true, data: sessionResponse(session) });
  } catch (err) {
    next(err);
  }
};

// POST /api/concierge/sessions/:id/save
exports.saveItinerary = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Login required" });
    const session = await loadSession(req, res);
    if (!session) return;
    if (!session.plan?.itinerary) {
      return res.status(400).json({ success: false, message: "No plan to save yet" });
    }

    const it = session.plan.itinerary;
    const saved = await Itinerary.create({
      user: req.user._id,
      destination: it.destination,
      totalDays: it.totalDays,
      tripType: session.intent?.tripType,
      budget: session.intent?.budgetLabel,
      travelStyle: (session.intent?.travelStyle || []).join(", "),
      estimatedBudget: it.estimatedBudget,
      bestTimeToVisit: it.bestTimeToVisit,
      data: { ...session.plan, conciergeSessionId: session._id },
      packingTips: it.packingTips,
      localTips: it.localTips,
      isSaved: true,
    });

    session.savedItineraryId = saved._id;
    await session.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
};

// GET /api/concierge/prompts
exports.suggestedPrompts = (req, res) => {
  res.json({
    success: true,
    data: [
      "I have ₹80,000. I want a honeymoon in Bali for 6 days in December.",
      "I want a solo backpacking trip to Japan under ₹1 lakh.",
      "I have 4 days next month. Suggest a relaxing international trip.",
      "I want to travel with other solo travelers.",
      "Find me beaches with nightlife under ₹60,000.",
    ],
  });
};
