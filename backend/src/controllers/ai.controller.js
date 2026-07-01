const { getClaude, CLAUDE_MODEL, LUXURY_CONCIERGE_SYSTEM } = require("../utils/claude");
const {
  CHAT_EXPERT_SUFFIX,
  FOLLOW_UP_ENDING,
  PLAN_JSON_SYSTEM,
} = require("../constants/concierge-prompts");
const Package = require("../models/Package");
const Destination = require("../models/Destination");
const { runInventorySearch } = require("../services/concierge/tools");
const { extractIntent, getBudgetAlternatives } = require("../services/concierge/intent");
const {
  resolvePageContext,
  formatPackageContextForPrompt,
  mergePageContextIntoIntent,
} = require("../services/concierge/context");

const hasKey = () => !!process.env.ANTHROPIC_API_KEY;

async function loadCatalogContext(destination, budgetINR, travelers = 2) {
  const filter = { isActive: { $ne: false } };
  if (destination) {
    const destIds = await Destination.find({ name: new RegExp(destination, "i") })
      .select("_id")
      .limit(5)
      .lean();
    const or = [{ title: new RegExp(destination, "i") }];
    if (destIds.length) or.push({ destination: { $in: destIds.map((d) => d._id) } });
    filter.$or = or;
  }
  if (budgetINR) {
    filter.pricePerPerson = { $lte: Math.floor(budgetINR / travelers) * 1.2 };
  }
  const packages = await Package.find(filter)
    .populate("destination", "name country")
    .sort({ rating: -1 })
    .limit(5)
    .lean();
  return packages.map((p) => ({
    id: String(p._id),
    title: p.title,
    pricePerPerson: p.pricePerPerson,
    durationDays: p.durationDays,
    rating: p.rating,
    destination: p.destination?.name,
    bookPath: `/packages/${p._id}`,
  }));
}

function premiumDemoReply(userText = "", pageContext = null, packages = []) {
  const t = (userText || "").toLowerCase();

  if (pageContext?.package) {
    const p = pageContext.package;
    return `## ${p.title}\n\nYou're exploring a curated XOXO package to **${p.destination?.name || "your destination"}** — **₹${(p.pricePerPerson || 0).toLocaleString("en-IN")}**/person · **${p.durationDays}D/${(p.durationNights || p.durationDays - 1) || 0}N**.\n\nI already have the base package, inclusions, and pricing. Share your **travel dates**, **departure city**, and **number of travellers** — I'll build a day-by-day luxury plan and show how booking this package compares to DIY planning.\n\n${FOLLOW_UP_ENDING}`;
  }

  if (t.includes("1.5") && (t.includes("lakh") || t.includes("lac")) && t.includes("honeymoon")) {
    return `## Honeymoon Planning\n\n**₹1.5 lakh** is a strong envelope for a romantic international honeymoon. From India, excellent fits include **Bali**, **Mauritius**, **Vietnam**, and **Georgia** — each offers privacy, great food, and visa-friendly entry for Indian passports.\n\n**Switzerland** at this budget would require compromises; I'd recommend Bali or Mauritius for a luxury feel without stretching finances.\n\nTo craft your plan, please share:\n• **Departure city** (e.g. Bangalore, Delhi)\n• **Travel dates** & **duration**\n• **Hotel preference** (boutique / 5-star)\n\n${FOLLOW_UP_ENDING}`;
  }

  if (t.includes("bali") && (t.includes("bangalore") || t.includes("bengaluru"))) {
    return `## Bali from Bangalore\n\nDirect and one-stop flights from **BLR → DPS** typically run **₹18,000–₹32,000** per person return. A **6-day** couple's plan with 4★ Seminyak + Ubud usually fits **₹1.1L–₹1.4L** total.\n\n${packages[0] ? `**XOXO match:** ${packages[0].title} at **₹${packages[0].pricePerPerson?.toLocaleString("en-IN")}**/person — includes hotels, transfers & sightseeing.` : ""}\n\nShare your **exact dates** and I'll deliver a day-by-day itinerary with flights, hotels, and restaurant picks.\n\n${FOLLOW_UP_ENDING}`;
  }

  if (t.includes("elderly") || t.includes("parents") || t.includes("senior")) {
    return `## Comfortable Travel for Seniors\n\nFor elderly travellers I recommend **gentle pacing**, **direct flights**, **ground-floor or lift-equipped rooms**, and **destinations with good healthcare** — think **Singapore**, **Dubai**, **Kerala**, or **Sri Lanka**.\n\nAvoid packed back-to-back sightseeing. Build in rest days and private transfers.\n\nPlease share:\n• **Budget** (total INR)\n• **Duration** & **preferred month**\n• **Mobility needs** (wheelchair, walking distance limits)\n\n${FOLLOW_UP_ENDING}`;
  }

  if (t.includes("two kids") || t.includes("2 kids") || (t.includes("kids") && t.includes("family"))) {
    return `## Family Trip with Children\n\nFor families with children, I prioritise **short transfers**, **kid-friendly hotels**, and **mix of culture + fun** — **Singapore**, **Thailand**, **Dubai**, and **Bali** work beautifully.\n\nVisa-free options save hassle. I can include water parks, aquariums, and child-friendly restaurants in your day plan.\n\nShare **budget**, **dates**, **kids' ages**, and **departure city** to begin.\n\n${FOLLOW_UP_ENDING}`;
  }

  if (t.includes("visa free") || t.includes("visa-free")) {
    return `## Visa-Free Options for Indians\n\nTop picks: **Thailand**, **Mauritius**, **Sri Lanka**, **Nepal**, **Bhutan**, **Indonesia (Bali)**, **Maldives** (visa on arrival), **Vietnam** (e-visa).\n\nWith your **budget** and **dates**, I'll shortlist the best fit and build a full itinerary.\n\n${FOLLOW_UP_ENDING}`;
  }

  if (t.includes("4 days") || t.includes("four days") || t.includes("weekend")) {
    return `## Short Getaway (4 Days)\n\nFor **4 days**, choose destinations within **3–5h flying time** — **Dubai**, **Singapore**, **Goa**, **Kerala**, or **Bangkok**.\n\nA tight plan maximises one region — don't split across islands.\n\nShare **budget**, **departure city**, and **travel style** (relax / adventure / nightlife).\n\n${FOLLOW_UP_ENDING}`;
  }

  if (t.includes("adventure")) {
    return `## Adventure Travel\n\nFor adventure seekers from India: **Nepal** (trekking), **Vietnam** (Ha Giang, caves), **Bali** (volcano sunrise, rafting), **New Zealand** (premium budget).\n\nI'll match activity level to your fitness and include safety buffers.\n\nShare **budget**, **dates**, **destination preference**, and **group size**.\n\n${FOLLOW_UP_ENDING}`;
  }

  if (t.includes("luxury")) {
    return `## Luxury Travel\n\nLuxury means **5★ resorts**, **private transfers**, **priority flights**, and **curated dining** — strong in **Maldives**, **Dubai**, **Bali**, **Singapore**, and **Europe**.\n\nTypical couple budgets start **₹2.5L+** for international luxury.\n\nShare your **destination**, **budget**, and **dates** for a bespoke plan with upgrade options.\n\n${FOLLOW_UP_ENDING}`;
  }

  if (t.includes("corporate")) {
    return `## Corporate Travel\n\nFor MICE and team offsites I handle **group rates**, **conference hotels**, **team activities**, and **GST-compliant invoicing**.\n\nDomestic options: **Goa**, **Udaipur**, **Lonavala**. International: **Dubai**, **Singapore**, **Bali**.\n\nShare **headcount**, **dates**, **budget per person**, and **objectives** (offsite / conference / incentive).\n\n${FOLLOW_UP_ENDING}`;
  }

  return `Welcome — I'm your **XOXO Luxury Travel Concierge**.\n\nI craft premium day-by-day plans with flights, hotels, budget breakdowns, and XOXO packages when they save you money.\n\nShare your **destination** (or let me suggest), **budget in INR**, **dates**, **travellers**, and **departure city** — I'll take it from there.\n\n${FOLLOW_UP_ENDING}`;
}

// POST /api/ai/itinerary
exports.generateItinerary = async (req, res) => {
  const { destination, days, tripType, budget, travelStyle, pageContext: rawCtx, budgetINR } = req.body;
  if (!destination || !days) {
    return res.status(400).json({ success: false, message: "destination and days are required" });
  }

  const pageContext = await resolvePageContext(rawCtx || {});
  const travelers = tripType === "solo" ? 1 : tripType === "family" ? 4 : 2;
  const packages = await loadCatalogContext(destination, budgetINR, travelers);

  if (!hasKey()) {
    return res.json({
      success: true,
      demo: true,
      itinerary: {
        destination,
        totalDays: Number(days),
        estimatedBudget: budgetINR ? `₹${Number(budgetINR).toLocaleString("en-IN")}` : budget || "₹60,000 per person",
        overview: `Premium ${days}-day ${tripType || "leisure"} itinerary for ${destination}.`,
        packageMatch: packages[0] || null,
        days: Array.from({ length: Math.min(Number(days), 7) }, (_, i) => ({
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
        budgetBreakdown: { flights: "₹28,000", hotels: "₹35,000", activities: "₹12,000", food: "₹15,000" },
      },
    });
  }

  try {
    const intent = { destination, durationDays: Number(days), tripType, travelers, budgetINR };
    const searchResults = await runInventorySearch(intent);

    const message = await getClaude().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 6000,
      system: `${LUXURY_CONCIERGE_SYSTEM}\n\n${PLAN_JSON_SYSTEM}`,
      messages: [
        {
          role: "user",
          content: `Create a ${days}-day ${tripType || "leisure"} itinerary for ${destination}.
Budget tier: ${budget || "mid-range"}${budgetINR ? ` (₹${budgetINR} total)` : ""}.
Travel style: ${travelStyle || "comfort"}.
${formatPackageContextForPrompt(pageContext)}
XOXO packages: ${JSON.stringify(packages)}
Search: ${JSON.stringify({ flights: searchResults.flights?.offers?.slice(0, 2), hotels: searchResults.hotels?.offers?.slice(0, 2) })}
Return itinerary JSON only.`,
        },
      ],
    });
    const text = message.content[0].text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    const itinerary = parsed.itinerary || parsed;
    res.json({
      success: true,
      itinerary: { ...itinerary, packageMatch: packages[0] || null, consultantReply: parsed.reply },
      packages,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ai/chat  (Trippie / floating concierge expert chat)
exports.chatExpert = async (req, res) => {
  const { messages, pageContext: rawCtx, intentMemory } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: "messages array required" });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const pageContext = await resolvePageContext(rawCtx || {});
  const mergedIntent = mergePageContextIntoIntent(intentMemory || {}, pageContext);
  const intent = await extractIntent(lastUser?.content || "", mergedIntent);
  const packages = await loadCatalogContext(
    intent.destination || pageContext?.package?.destination?.name,
    intent.budgetINR,
    intent.travelers || 2
  );

  if (!hasKey()) {
    return res.json({
      success: true,
      demo: true,
      message: premiumDemoReply(lastUser?.content || "", pageContext, packages),
    });
  }

  try {
    const history = messages.slice(-12).map((m) => ({ role: m.role, content: m.content }));
    const alts = getBudgetAlternatives(intent);

    const response = await getClaude().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2500,
      system:
        LUXURY_CONCIERGE_SYSTEM +
        CHAT_EXPERT_SUFFIX +
        `\n\nStored intent: ${JSON.stringify(intent)}\n${formatPackageContextForPrompt(pageContext)}\nXOXO packages: ${JSON.stringify(packages)}\nBudget alternatives if needed: ${JSON.stringify(alts)}`,
      messages: history,
    });
    let text = response.content[0].text;
    if (!text.includes("Would you like me to")) {
      text += FOLLOW_UP_ENDING;
    }
    res.json({ success: true, message: text, intent, packages });
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
      message: `## ${destination} — Consultant Tips\n\n• Book flights **6–8 weeks** ahead from Indian metros\n• Carry **international debit/credit** with forex markup checked\n• **Visa**: verify latest Indian passport rules\n• **Best season**: check monsoon windows\n• Consider a **XOXO package** for bundled savings on hotels & transfers`,
    });
  }

  try {
    const response = await getClaude().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      system: LUXURY_CONCIERGE_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Give premium travel consultant tips for Indian travellers visiting ${destination}. Use markdown headings and bullets. Include visa, currency, weather, etiquette, and safety.`,
        },
      ],
    });
    res.json({ success: true, message: response.content[0].text });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
