const { getClaude, CLAUDE_MODEL, LUXURY_CONCIERGE_SYSTEM } = require("../../utils/claude");
const {
  PLAN_JSON_SYSTEM,
  FOLLOW_UP_SYSTEM,
  FOLLOW_UP_ENDING,
} = require("../../constants/concierge-prompts");
const {
  extractIntent,
  getMissingFields,
  markOpenDestination,
  buildFollowUpQuestions,
  getBudgetAlternatives,
} = require("./intent");
const { runInventorySearch } = require("./tools");
const { suggestDestinations } = require("./destinations");
const {
  mergePageContextIntoIntent,
  formatPackageContextForPrompt,
} = require("./context");

const hasKey = () => !!process.env.ANTHROPIC_API_KEY;

function buildBudgetAnalysis(intent, searchResults) {
  const travelers = intent.travelers || 2;
  const totalBudget = intent.budgetINR || 0;

  const flightOffer = searchResults.flights?.offers?.[0];
  const hotelOffer = searchResults.hotels?.offers?.[0];
  const flightCost = flightOffer ? Math.round((flightOffer.price || 0) * travelers) : 0;
  const nights = intent.durationDays || 5;
  const hotelCost = hotelOffer
    ? Math.round((hotelOffer.pricePerNight || hotelOffer.totalPrice / nights || 0) * nights)
    : Math.round(nights * 4500 * (intent.hotelCategory === "luxury" ? 2.2 : 1));

  const activitiesCost = Math.round((searchResults.activities?.offers?.length || 3) * 2800);
  const localTransport = Math.round(nights * 1400);
  const foodEstimate = Math.round(nights * travelers * 2000);
  const shoppingEstimate = Math.round(totalBudget * 0.08);
  const emergencyReserve = Math.round(totalBudget * 0.1);

  const subtotal =
    flightCost + hotelCost + activitiesCost + localTransport + foodEstimate + shoppingEstimate;
  const remaining = totalBudget ? totalBudget - subtotal - emergencyReserve : null;

  return {
    currency: "INR",
    totalBudget,
    breakdown: {
      flights: flightCost,
      hotels: hotelCost,
      activities: activitiesCost,
      localTransport,
      food: foodEstimate,
      shopping: shoppingEstimate,
      emergencyReserve,
    },
    subtotal,
    remaining,
    perPerson: totalBudget ? Math.round(totalBudget / travelers) : null,
    withinBudget: remaining === null ? null : remaining >= 0,
  };
}

function formatPackagesForPrompt(packages = []) {
  return packages.map((p) => ({
    id: String(p._id),
    title: p.title,
    pricePerPerson: p.pricePerPerson,
    durationDays: p.durationDays,
    durationNights: p.durationNights,
    rating: p.rating,
    reviewCount: p.reviewCount,
    highlights: (p.highlights || []).slice(0, 4),
    destination: p.destination?.name || p.destinationName,
    bookPath: `/packages/${p._id}`,
  }));
}

function buildDemoPlan(intent, searchResults, pageContext) {
  const dest = intent.destination || pageContext?.package?.destination?.name || "your destination";
  const days = intent.durationDays || pageContext?.package?.durationDays || 6;
  const budget =
    intent.budgetLabel ||
    (intent.budgetINR ? `₹${intent.budgetINR.toLocaleString("en-IN")}` : "flexible");

  const packages = searchResults.packages || [];
  const topPkg = packages[0];
  const pkgPitch = topPkg
    ? `### XOXO Package Match\n**${topPkg.title}** — **₹${(topPkg.pricePerPerson || 0).toLocaleString("en-IN")}**/person · ${topPkg.durationDays}D/${(topPkg.durationNights || topPkg.durationDays - 1) || 0}N\nIncludes curated hotels, transfers & sightseeing. Booking this package typically saves **₹12,000–₹22,000** vs planning independently.\n[View & Book](/packages/${topPkg._id})`
    : "";

  const reply = `## Trip Overview\nA **${days}-day ${intent.tripType || "premium"} escape** to **${dest}** tailored for Indian travellers${intent.originCity ? ` from **${intent.originCity}**` : ""}. Budget envelope: **${budget}**.\n\n## Budget Breakdown\n| Category | Estimate (INR) |\n|---|---|\n| Flights | ₹${(buildBudgetAnalysis(intent, searchResults).breakdown.flights || 0).toLocaleString("en-IN")} |\n| Hotels | ₹${(buildBudgetAnalysis(intent, searchResults).breakdown.hotels || 0).toLocaleString("en-IN")} |\n| Activities | ₹${(buildBudgetAnalysis(intent, searchResults).breakdown.activities || 0).toLocaleString("en-IN")} |\n| Food | ₹${(buildBudgetAnalysis(intent, searchResults).breakdown.food || 0).toLocaleString("en-IN")} |\n| Local transport | ₹${(buildBudgetAnalysis(intent, searchResults).breakdown.localTransport || 0).toLocaleString("en-IN")} |\n\n${pkgPitch}\n\nYour day-by-day plan and flight/hotel picks are ready in the itinerary panel.${FOLLOW_UP_ENDING}`;

  const itinerary = {
    destination: dest,
    totalDays: days,
    estimatedBudget: budget,
    bestTimeToVisit: intent.departureDate ? intent.departureDate.slice(0, 7) : "Oct–Mar",
    weatherSummary: `Pleasant for sightseeing in ${dest}. Pack light layers and sun protection.`,
    visaSummary: searchResults.visa?.visaType || "Check Indian passport requirements",
    days: Array.from({ length: Math.min(days, 7) }, (_, i) => ({
      day: i + 1,
      title: i === 0 ? `Arrival in ${dest}` : `${dest} — Day ${i + 1}`,
      morning: {
        activity: searchResults.activities?.offers?.[i % 3]?.name || "Guided heritage walk",
        duration: "3h",
        tip: "Book morning slots to avoid crowds",
      },
      afternoon: {
        activity: intent.hasChildren ? "Family-friendly attraction" : "Local experiences & curated café",
        duration: "3h",
        tip: "Try regional specialities",
      },
      evening: {
        activity: intent.travelStyle?.includes("nightlife") ? "Night market & skyline views" : "Sunset viewpoint",
        duration: "2h",
        tip: "Reserve dinner at a recommended restaurant",
      },
      meals: {
        breakfast: "Hotel / local café",
        lunch: "Recommended local restaurant",
        dinner: "Curated dining pick",
      },
      transport: i === 0 ? "Airport transfer" : "Private cab / ride-hailing",
      estimatedCost: `₹${(8000 + i * 600).toLocaleString("en-IN")}`,
    })),
    transportTips: ["Pre-book airport transfers", "Use reputable ride apps"],
    packingTips: ["Universal adapter", "Comfortable walking shoes", "Light rain jacket"],
    localTips: ["Digital + paper copies of documents", "Notify bank for international use"],
    restaurantPicks: ["Ask your consultant for chef's-table reservations"],
    hiddenGems: ["Local markets away from tourist strips"],
    luxuryUpgrades: ["Suite upgrade", "Private guide", "Helicopter tour where available"],
    moneySavingTips: ["Book flights 6–8 weeks ahead", "Consider XOXO package bundles"],
  };

  const budgetAnalysis = buildBudgetAnalysis(intent, searchResults, itinerary.days);

  return {
    reply,
    highlights: [
      `${days}-day ${intent.tripType || "custom"} plan for ${dest}`,
      `Budget envelope ${budget}`,
      topPkg ? `XOXO package: ${topPkg.title}` : "Flights & hotels searched live",
      intent.hasSeniors ? "Senior-friendly pacing included" : "Optimised daily rhythm",
      "Visa & packing guidance included",
    ],
    itinerary,
    budget: budgetAnalysis,
    rankedFlights: (searchResults.flights?.offers || []).slice(0, 3),
    rankedHotels: (searchResults.hotels?.offers || []).slice(0, 3),
    topActivities: (searchResults.activities?.offers || []).slice(0, 5),
    packages,
    packagePitch: pkgPitch,
    budgetAlternatives: getBudgetAlternatives(intent),
    social: {
      travelers: searchResults.travelers || [],
      groups: searchResults.groups || [],
      guides: searchResults.guides || [],
    },
    visa: searchResults.visa,
    geo: searchResults.geo,
    suggestions: searchResults.suggestions || [],
  };
}

async function generatePlan(intent, searchResults, pageContext) {
  if (!hasKey()) return buildDemoPlan(intent, searchResults, pageContext);

  const pageCtxText = formatPackageContextForPrompt(pageContext);
  const alts = getBudgetAlternatives(intent);

  try {
    const response = await getClaude().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      system: `${LUXURY_CONCIERGE_SYSTEM}\n\n${PLAN_JSON_SYSTEM}`,
      messages: [
        {
          role: "user",
          content: `${pageCtxText}\n\nIntent:\n${JSON.stringify(intent)}\n\nSearch results:\n${JSON.stringify(
            summarizeSearch(searchResults)
          )}\n\nBudget alternatives to mention if relevant:\n${JSON.stringify(alts)}`,
        },
      ],
    });
    const text = response.content[0].text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    const budget = buildBudgetAnalysis(intent, searchResults, parsed.itinerary?.days);
    return {
      reply: parsed.reply + FOLLOW_UP_ENDING,
      highlights: parsed.highlights,
      itinerary: parsed.itinerary,
      packagePitch: parsed.packagePitch,
      budgetAlternatives: parsed.budgetAlternatives || alts,
      budget,
      rankedFlights: (searchResults.flights?.offers || []).slice(0, 3),
      rankedHotels: (searchResults.hotels?.offers || []).slice(0, 3),
      topActivities: (searchResults.activities?.offers || []).slice(0, 5),
      packages: searchResults.packages || [],
      social: {
        travelers: searchResults.travelers || [],
        groups: searchResults.groups || [],
        guides: searchResults.guides || [],
      },
      visa: searchResults.visa,
      geo: searchResults.geo,
      suggestions: searchResults.suggestions || [],
    };
  } catch {
    return buildDemoPlan(intent, searchResults, pageContext);
  }
}

function summarizeSearch(sr) {
  return {
    flights: sr.flights?.offers?.slice(0, 3),
    hotels: sr.hotels?.offers?.slice(0, 3),
    activities: sr.activities?.offers?.slice(0, 5),
    packages: formatPackagesForPrompt(sr.packages || []),
    visa: sr.visa,
    suggestions: sr.suggestions,
  };
}

function conversationContext(messages = [], limit = 8) {
  return messages
    .slice(-limit)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n\n");
}

async function generateAssistantReply(message, intent, missing, plan, searchResults, session, pageContext) {
  if (missing.length > 0) {
    const template = buildFollowUpQuestions(missing, intent, pageContext);
    if (hasKey()) {
      try {
        const response = await getClaude().messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 600,
          system: `${LUXURY_CONCIERGE_SYSTEM}\n\n${FOLLOW_UP_SYSTEM}`,
          messages: [
            {
              role: "user",
              content: `${formatPackageContextForPrompt(pageContext)}\n\nConversation:\n${conversationContext(session.messages || [])}\n\nUser: ${message}\nIntent: ${JSON.stringify(intent)}\nStill missing: ${missing.join(", ")}\n\nTemplate to refine:\n${template}`,
            },
          ],
        });
        return response.content[0].text;
      } catch {
        return template;
      }
    }
    return template;
  }

  if (plan?.reply) return plan.reply;
  return plan?.reply || `Your premium ${intent.destination || "trip"} plan is ready. Review the itinerary and budget panels — I'm here to refine every detail.${FOLLOW_UP_ENDING}`;
}

async function processMessage(session, userMessage) {
  const pageContext = session.pageContext || null;

  let intent = markOpenDestination({
    ...(session.intent?.toObject?.() || session.intent || {}),
  });
  intent = mergePageContextIntoIntent(intent, pageContext);
  intent = await extractIntent(userMessage, intent);

  if (!intent.destination && intent.openDestination) {
    const suggestions = suggestDestinations(intent);
    if (suggestions[0] && !getMissingFields(intent, pageContext).includes("destination")) {
      intent.destination = suggestions[0].name;
    }
  }

  const missing = getMissingFields(intent, pageContext);
  const needsSearch =
    missing.length === 0 ||
    (missing.length === 1 && missing[0] === "destination" && intent.budgetINR);

  let searchResults = session.searchResults || {};
  let plan = session.plan || null;

  if (needsSearch && (intent.destination || pageContext?.package)) {
    if (!intent.destination && pageContext?.package?.destination?.name) {
      intent.destination = pageContext.package.destination.name;
    }
    searchResults = await runInventorySearch(intent);
    plan = await generatePlan(intent, searchResults, pageContext);
    session.status = "plan_ready";
  } else if (intent.budgetINR && intent.openDestination && !intent.destination) {
    searchResults = { ...searchResults, suggestions: suggestDestinations(intent) };
    session.status = "gathering";
  } else {
    session.status = "gathering";
  }

  const assistantText = await generateAssistantReply(
    userMessage,
    intent,
    missing.filter((m) => m !== "destination" || !intent.budgetINR),
    plan,
    searchResults,
    session,
    pageContext
  );

  session.intent = intent;
  session.searchResults = searchResults;
  session.plan = plan;
  session.missingFields = missing;
  if (intent.destination || pageContext?.package?.title) {
    session.title = `${intent.destination || pageContext.package.title} · ${intent.durationDays || pageContext?.package?.durationDays || "?"} days`;
  }

  return {
    assistantText,
    intent,
    missingFields: missing,
    searchResults,
    plan,
    status: session.status,
  };
}

async function* streamText(text) {
  const words = text.split(/(\s+)/);
  for (const w of words) {
    yield w;
    await new Promise((r) => setTimeout(r, 10));
  }
}

module.exports = {
  processMessage,
  streamText,
  buildBudgetAnalysis,
  generatePlan,
};
