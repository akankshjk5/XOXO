const { getClaude, CLAUDE_MODEL, TRAVEL_EXPERT_SYSTEM } = require("../../utils/claude");
const { extractIntent, getMissingFields, markOpenDestination } = require("./intent");
const { runInventorySearch } = require("./tools");
const { resolveDestination } = require("./destinations");

const hasKey = () => !!process.env.ANTHROPIC_API_KEY;

function buildBudgetAnalysis(intent, searchResults, planDays = []) {
  const travelers = intent.travelers || 2;
  const totalBudget = intent.budgetINR || 0;

  const flightOffer = searchResults.flights?.offers?.[0];
  const hotelOffer = searchResults.hotels?.offers?.[0];
  const flightCost = flightOffer ? Math.round((flightOffer.price || 0) * travelers) : 0;
  const nights = intent.durationDays || 5;
  const hotelCost = hotelOffer
    ? Math.round((hotelOffer.pricePerNight || hotelOffer.totalPrice / nights || 0) * nights)
    : Math.round(nights * 4500 * (intent.hotelCategory === "luxury" ? 2 : 1));

  const activitiesCost = Math.round((searchResults.activities?.offers?.length || 3) * 2500);
  const localTransport = Math.round(nights * 1200);
  const foodEstimate = Math.round(nights * travelers * 1800);
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

function buildDemoPlan(intent, searchResults) {
  const dest = intent.destination || "your destination";
  const days = intent.durationDays || 6;
  const budget = intent.budgetLabel || (intent.budgetINR ? `₹${intent.budgetINR.toLocaleString("en-IN")}` : "flexible");

  const itinerary = {
    destination: dest,
    totalDays: days,
    estimatedBudget: budget,
    bestTimeToVisit: intent.departureDate ? intent.departureDate.slice(0, 7) : "Oct–Mar",
    weatherSummary: `${dest} is pleasant during your travel window. Pack light layers and sun protection.`,
    days: Array.from({ length: Math.min(days, 7) }, (_, i) => ({
      day: i + 1,
      title: i === 0 ? `Arrival in ${dest}` : `${dest} — Day ${i + 1}`,
      morning: {
        activity: searchResults.activities?.offers?.[i % 3]?.name || "Guided sightseeing",
        duration: "3h",
        tip: "Book morning slots to avoid crowds",
      },
      afternoon: {
        activity: "Local experiences & cafes",
        duration: "3h",
        tip: "Try regional specialities",
      },
      evening: {
        activity: intent.travelStyle?.includes("nightlife") ? "Night market & nightlife" : "Sunset viewpoint",
        duration: "2h",
        tip: "Reserve dinner for ocean-view spots",
      },
      meals: {
        breakfast: "Hotel / local café",
        lunch: "Recommended local restaurant",
        dinner: "Curated dining pick",
      },
      transport: i === 0 ? "Airport transfer" : "Private cab / ride-hailing",
      estimatedCost: `₹${(8000 + i * 500).toLocaleString("en-IN")}`,
    })),
    transportTips: ["Use Grab/Gojek where available", "Pre-book airport transfers"],
    packingTips: ["Universal adapter", "Comfortable walking shoes", "Light rain jacket"],
    localTips: ["Carry digital + paper copies of documents", "Notify bank for international use"],
  };

  const budgetAnalysis = buildBudgetAnalysis(intent, searchResults, itinerary.days);

  return {
    itinerary,
    budget: budgetAnalysis,
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
}

async function generatePlan(intent, searchResults) {
  if (!hasKey()) return buildDemoPlan(intent, searchResults);

  try {
    const response = await getClaude().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 3500,
      system: `${TRAVEL_EXPERT_SYSTEM}
You are building a complete trip plan. Return ONLY valid JSON:
{
  "reply": "conversational summary under 120 words",
  "itinerary": { destination, totalDays, estimatedBudget, bestTimeToVisit, weatherSummary, days[{day,title,morning,afternoon,evening,meals,transport,estimatedCost}], transportTips[], packingTips[], localTips[] },
  "highlights": ["3-5 bullet points"]
}
Use INR. Incorporate real flight/hotel/activity options from search results when available.`,
      messages: [
        {
          role: "user",
          content: JSON.stringify({ intent, searchResults: summarizeSearch(searchResults) }),
        },
      ],
    });
    const parsed = JSON.parse(response.content[0].text);
    const budget = buildBudgetAnalysis(intent, searchResults, parsed.itinerary?.days);
    return {
      reply: parsed.reply,
      highlights: parsed.highlights,
      itinerary: parsed.itinerary,
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
    return buildDemoPlan(intent, searchResults);
  }
}

function summarizeSearch(sr) {
  return {
    flights: sr.flights?.offers?.slice(0, 3),
    hotels: sr.hotels?.offers?.slice(0, 3),
    activities: sr.activities?.offers?.slice(0, 5),
    packages: sr.packages?.map((p) => ({ title: p.title, price: p.pricePerPerson })),
    visa: sr.visa,
    suggestions: sr.suggestions,
  };
}

function buildFollowUp(missing, intent) {
  const questions = {
    destination: "Which destination are you dreaming of — or should I suggest options based on your budget?",
    budget: "What's your total budget in INR for this trip (all travellers included)?",
    dates: "When are you planning to travel, and for how many days?",
    travelers: "How many travellers will be joining this trip?",
  };
  const parts = missing.map((m) => questions[m]).filter(Boolean);
  if (intent.openDestination && intent.budgetINR) {
    return `I can suggest destinations within ₹${intent.budgetINR.toLocaleString("en-IN")}. ${parts.join(" ")}`;
  }
  return parts.join(" ") || "Tell me a bit more about your ideal trip — destination, budget, and dates.";
}

async function demoReply(message, intent, missing) {
  if (missing.length > 0) {
    return buildFollowUp(missing, intent);
  }
  const dest = intent.destination || "your trip";
  return `Perfect — I'm putting together a ${intent.durationDays || 6}-day ${intent.tripType || "leisure"} plan for ${dest} within ${intent.budgetLabel || "your budget"}. I've searched flights, hotels, and activities. Check the itinerary and budget panel on the right — ready to book when you are! ✈️`;
}

async function generateAssistantReply(message, intent, missing, plan, searchResults) {
  if (missing.length > 0) {
    if (hasKey()) {
      try {
        const response = await getClaude().messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 400,
          system: TRAVEL_EXPERT_SYSTEM + " Ask ONE natural follow-up question to fill missing trip details. Under 80 words.",
          messages: [{ role: "user", content: `User: ${message}\nIntent: ${JSON.stringify(intent)}\nMissing: ${missing.join(", ")}` }],
        });
        return response.content[0].text;
      } catch {
        return buildFollowUp(missing, intent);
      }
    }
    return buildFollowUp(missing, intent);
  }

  if (plan?.reply) return plan.reply;
  return demoReply(message, intent, missing);
}

async function processMessage(session, userMessage) {
  let intent = markOpenDestination({
    ...(session.intent?.toObject?.() || session.intent || {}),
  });

  intent = await extractIntent(userMessage, intent);

  if (!intent.destination && intent.openDestination) {
    const suggestions = require("./tools").suggestDestinations(intent);
    if (suggestions[0]) intent.destination = suggestions[0].name;
  }

  const missing = getMissingFields(intent);
  const needsSearch = missing.length === 0 || (missing.length === 1 && missing[0] === "destination" && intent.budgetINR);

  let searchResults = session.searchResults || {};
  let plan = session.plan || null;

  if (needsSearch && intent.destination) {
    searchResults = await runInventorySearch(intent);
    plan = await generatePlan(intent, searchResults);
    session.status = "plan_ready";
  } else if (intent.budgetINR && intent.openDestination && !intent.destination) {
    searchResults = await runInventorySearch({ ...intent, destination: null });
    session.status = "gathering";
  } else {
    session.status = "gathering";
  }

  const assistantText = await generateAssistantReply(
    userMessage,
    intent,
    missing.filter((m) => m !== "destination" || !intent.budgetINR),
    plan,
    searchResults
  );

  session.intent = intent;
  session.searchResults = searchResults;
  session.plan = plan;
  session.missingFields = missing;
  if (intent.destination) {
    session.title = `${intent.destination} · ${intent.durationDays || "?"} days`;
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

/** Stream tokens for SSE — chunks assistant text */
async function* streamText(text) {
  const words = text.split(/(\s+)/);
  for (const w of words) {
    yield w;
    await new Promise((r) => setTimeout(r, 12));
  }
}

module.exports = {
  processMessage,
  streamText,
  buildBudgetAnalysis,
  generatePlan,
};
