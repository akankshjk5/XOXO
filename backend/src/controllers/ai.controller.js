const { getClaude, CLAUDE_MODEL, TRAVEL_EXPERT_SYSTEM } = require("../utils/claude");

const hasKey = () => !!process.env.ANTHROPIC_API_KEY;

// Lightweight demo responder used when no ANTHROPIC_API_KEY is configured.
function demoReply(userText = "") {
  const t = userText.toLowerCase();
  if (t.includes("bali"))
    return "Bali is perfect for a honeymoon! 🌴 A 6N/7D trip runs about ₹55,000–₹75,000 per person including flights, a 4-star stay in Seminyak, Ubud rice terraces and an Uluwatu sunset. Want me to suggest a day-by-day plan?";
  if (t.includes("visa"))
    return "Great news for Indian passport holders! 🛂 Thailand, Maldives, Sri Lanka, Mauritius and Vietnam are visa-free or visa-on-arrival. Which one are you leaning towards?";
  if (t.includes("family"))
    return "For families under ₹1L, Thailand and Singapore are unbeatable. 👨‍👩‍👧 Singapore (4N/5D ~₹72,000pp) has Universal Studios + Sentosa. Shall I share a family-friendly itinerary?";
  if (t.includes("europe"))
    return "A 7-day Europe trip (Switzerland + Paris) is magical! 🏔️ Budget ~₹1.8L–₹2.5L per person. I'd do 3 nights Lucerne, 1 Interlaken, 3 Paris. Want the detailed plan?";
  return "I'd love to help plan your trip! ✈️ Tell me your destination, number of days, and budget in INR, and I'll craft the perfect itinerary. Where are you dreaming of going?";
}

// POST /api/ai/itinerary
exports.generateItinerary = async (req, res) => {
  const { destination, days, tripType, budget, travelStyle } = req.body;
  if (!destination || !days) {
    return res.status(400).json({ success: false, message: "destination and days are required" });
  }

  if (!hasKey()) {
    return res.json({
      success: true,
      demo: true,
      itinerary: {
        destination,
        totalDays: Number(days),
        estimatedBudget: budget || "₹60,000 per person",
        days: Array.from({ length: Math.min(Number(days), 5) }, (_, i) => ({
          day: i + 1,
          title: i === 0 ? `Arrival in ${destination}` : `${destination} — Day ${i + 1}`,
          morning: { activity: "Guided sightseeing", duration: "3h", tip: "Start early to beat crowds" },
          afternoon: { activity: "Local experience", duration: "3h", tip: "Try regional cuisine" },
          evening: { activity: "Sunset & leisure", duration: "2h", tip: "Great for photos" },
          meals: { breakfast: "Hotel", lunch: "Local cafe", dinner: "Recommended restaurant" },
          accommodation: `4-star hotel in ${destination}`,
          estimatedCost: "₹8,000",
        })),
        packingTips: ["Light cotton clothes", "Universal adapter", "Sunscreen"],
        localTips: ["Carry some local currency", "Use ride-hailing apps"],
        bestTimeToVisit: "Oct–Mar",
      },
    });
  }

  try {
    const message = await getClaude().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Create a detailed ${days}-day ${tripType || "leisure"} itinerary for ${destination}. Budget: ${budget || "moderate"}. Travel style: ${travelStyle || "comfort"}. Return ONLY valid JSON with keys: destination, totalDays, estimatedBudget, days[{day,title,morning{activity,duration,tip},afternoon{...},evening{...},meals{breakfast,lunch,dinner},accommodation,estimatedCost}], packingTips[], localTips[], bestTimeToVisit. No markdown.`,
        },
      ],
    });
    const itinerary = JSON.parse(message.content[0].text);
    res.json({ success: true, itinerary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ai/chat  (Trippie expert chat)
exports.chatExpert = async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: "messages array required" });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  if (!hasKey()) {
    return res.json({ success: true, demo: true, message: demoReply(lastUser?.content || "") });
  }

  try {
    const response = await getClaude().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system:
        TRAVEL_EXPERT_SYSTEM +
        " Keep responses under 150 words. End with a follow-up question.",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    res.json({ success: true, message: response.content[0].text });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ai/destination-tips
exports.destinationTips = async (req, res) => {
  const { destination } = req.body;
  if (!destination) {
    return res.status(400).json({ success: false, message: "destination required" });
  }

  if (!hasKey()) {
    return res.json({
      success: true,
      demo: true,
      message: `Top tips for ${destination}: book flights 6–8 weeks ahead, carry an international debit card, and keep digital + paper copies of your documents. Best months are Oct–Mar.`,
    });
  }

  try {
    const response = await getClaude().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      system: TRAVEL_EXPERT_SYSTEM,
      messages: [{ role: "user", content: `Give 5 concise travel tips for Indian travellers visiting ${destination}.` }],
    });
    res.json({ success: true, message: response.content[0].text });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
