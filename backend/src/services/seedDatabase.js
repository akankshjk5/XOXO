const Destination = require("../models/Destination");
const Package = require("../models/Package");
const User = require("../models/User");

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const img = (q) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=1200&q=80`;

const destinations = [
  {
    name: "Bali",
    country: "Indonesia",
    tagline: "Island of the Gods",
    description: "Lush rice terraces, beach clubs, temples and world-class surf.",
    category: ["beach", "honeymoon", "adventure"],
    avgPriceINR: 65000,
    bestSeason: "Apr–Oct",
    isVisaFree: true,
    visaRequired: false,
    isTrending: true,
    currency: "IDR",
    language: "Indonesian",
    timezone: "GMT+8",
    coverImage: img("photo-1537996194471-e657df975ab4"),
  },
  {
    name: "Maldives",
    country: "Maldives",
    tagline: "Overwater luxury paradise",
    description: "Private water villas, turquoise lagoons and coral reefs.",
    category: ["beach", "honeymoon", "luxury"],
    avgPriceINR: 120000,
    bestSeason: "Nov–Apr",
    isVisaFree: true,
    visaRequired: false,
    isTrending: true,
    currency: "MVR",
    language: "Dhivehi",
    timezone: "GMT+5",
    coverImage: img("photo-1514282401047-d79a71a590e8"),
  },
  {
    name: "Switzerland",
    country: "Switzerland",
    tagline: "Alpine dreams come true",
    description: "Snow peaks, scenic trains, lakes and chocolate towns.",
    category: ["mountains", "honeymoon", "luxury"],
    avgPriceINR: 180000,
    bestSeason: "May–Sep",
    isVisaFree: false,
    visaRequired: true,
    isTrending: true,
    currency: "CHF",
    language: "German/French",
    timezone: "GMT+1",
    coverImage: img("photo-1530122037265-a5f1f91d3b99"),
  },
  {
    name: "Thailand",
    country: "Thailand",
    tagline: "Land of smiles",
    description: "Buzzing Bangkok, island hopping and street food heaven.",
    category: ["beach", "friends", "budget"],
    avgPriceINR: 45000,
    bestSeason: "Nov–Mar",
    isVisaFree: true,
    visaRequired: false,
    isTrending: true,
    currency: "THB",
    language: "Thai",
    timezone: "GMT+7",
    coverImage: img("photo-1528181304800-259b08848526"),
  },
  {
    name: "Dubai",
    country: "UAE",
    tagline: "City of superlatives",
    description: "Skyscrapers, desert safaris, luxury malls and beaches.",
    category: ["city", "family", "luxury"],
    avgPriceINR: 70000,
    bestSeason: "Nov–Mar",
    isVisaFree: false,
    visaRequired: true,
    isTrending: true,
    currency: "AED",
    language: "Arabic",
    timezone: "GMT+4",
    coverImage: img("photo-1512453979798-5ea266f8880c"),
  },
  {
    name: "Singapore",
    country: "Singapore",
    tagline: "Garden city of the future",
    description: "Gardens by the Bay, Sentosa, hawker food and Universal Studios.",
    category: ["city", "family"],
    avgPriceINR: 80000,
    bestSeason: "Year-round",
    isVisaFree: false,
    visaRequired: true,
    isTrending: true,
    currency: "SGD",
    language: "English",
    timezone: "GMT+8",
    coverImage: img("photo-1525625293386-3f8f99389edd"),
  },
  {
    name: "Vietnam",
    country: "Vietnam",
    tagline: "Timeless charm",
    description: "Ha Long Bay cruises, lantern towns and rich cuisine.",
    category: ["adventure", "budget", "friends"],
    avgPriceINR: 50000,
    bestSeason: "Feb–Apr",
    isVisaFree: true,
    visaRequired: false,
    isAdventure: true,
    currency: "VND",
    language: "Vietnamese",
    timezone: "GMT+7",
    coverImage: img("photo-1528127269322-539801943592"),
  },
  {
    name: "Iceland",
    country: "Iceland",
    tagline: "Land of fire and ice",
    description: "Northern lights, glaciers, geysers and waterfalls.",
    category: ["adventure", "mountains"],
    avgPriceINR: 200000,
    bestSeason: "Jun–Aug / Sep–Mar (auroras)",
    isVisaFree: false,
    visaRequired: true,
    isAdventure: true,
    isTrending: true,
    currency: "ISK",
    language: "Icelandic",
    timezone: "GMT+0",
    coverImage: img("photo-1504829857797-ddff29c27927"),
  },
  {
    name: "Mauritius",
    country: "Mauritius",
    tagline: "Tropical island bliss",
    description: "White sand beaches, lagoons and lush mountains.",
    category: ["beach", "honeymoon"],
    avgPriceINR: 90000,
    bestSeason: "May–Dec",
    isVisaFree: true,
    visaRequired: false,
    currency: "MUR",
    language: "English/French",
    timezone: "GMT+4",
    coverImage: img("photo-1544551763-46a013bb70d5"),
  },
  {
    name: "Nepal",
    country: "Nepal",
    tagline: "Roof of the world",
    description: "Himalayan treks, Everest views and ancient temples.",
    category: ["adventure", "mountains", "budget"],
    avgPriceINR: 35000,
    bestSeason: "Oct–Nov / Mar–Apr",
    isVisaFree: true,
    visaRequired: false,
    isAdventure: true,
    currency: "NPR",
    language: "Nepali",
    timezone: "GMT+5:45",
    coverImage: img("photo-1544735716-392fe2489ffa"),
  },
];

const categories = ["honeymoon", "family", "friends", "solo", "adventure", "luxury", "corporate"];
const badges = ["hot", "new", "deal", ""];

function buildItinerary(days, place) {
  const arr = [];
  for (let d = 1; d <= Math.min(days, 6); d++) {
    arr.push({
      day: d,
      title: d === 1 ? `Arrival in ${place}` : `${place} Day ${d}`,
      description: `Explore the best of ${place} on day ${d}.`,
      activities: ["Sightseeing", "Local experience", "Leisure time"],
      meals: ["Breakfast"],
      accommodation: `4-star hotel in ${place}`,
    });
  }
  return arr;
}

function buildCorporateDetails(index, destName) {
  const travelTypeSets = [
    ["conference", "business-event", "mice-travel"],
    ["incentive-travel", "team-outing"],
    ["workation", "corporate-retreat"],
    ["conference", "business-event"],
  ];
  const types = travelTypeSets[index % travelTypeSets.length];
  return {
    companyName: "XOXO Corporate Partners",
    employeeCountMin: 10 + index * 5,
    employeeCountMax: 50 + index * 20,
    meetingLocation: `${destName} Convention Centre`,
    travelTypes: types,
    supportsInvoice: true,
    supportsGst: true,
    dedicatedTravelManager: index % 2 === 0,
    customPricing: true,
    negotiatedHotels: index % 3 !== 0,
    airportTransfers: true,
  };
}

function buildPackages(destDocs) {
  const pkgs = [];
  const titles = [
    "Romantic Escape",
    "Family Fun",
    "Backpacker Special",
    "Luxury Retreat",
    "Adventure Trail",
    "Honeymoon Bliss",
    "Weekend Getaway",
    "Grand Tour",
  ];
  let i = 0;
  while (pkgs.length < 20) {
    const dest = destDocs[i % destDocs.length];
    const titleBase = titles[pkgs.length % titles.length];
    const days = 4 + (pkgs.length % 7);
    const title = `${dest.name} ${titleBase}`;
    const price = Math.round((dest.avgPriceINR || 60000) * (0.9 + (pkgs.length % 3) * 0.15));
    const original = Math.round(price * 1.2);
    const cat = categories[pkgs.length % categories.length];
    const pkg = {
      title,
      slug: slugify(`${title}-${days}d`),
      destination: dest._id,
      description: `A handcrafted ${days}-day ${titleBase.toLowerCase()} experience in ${dest.name}, ${dest.country}.`,
      durationDays: days,
      durationNights: days - 1,
      pricePerPerson: price,
      originalPrice: original,
      maxPeople: cat === "corporate" ? 80 : 12,
      minPeople: cat === "corporate" ? 10 : 1,
      category: cat,
      badge: badges[pkgs.length % badges.length],
      images: [dest.coverImage, ...(dest.images || [])],
      inclusions: cat === "corporate"
        ? [
            "Flights",
            "Negotiated business hotels",
            "Airport transfers",
            "Meeting venue coordination",
            "GST invoice",
            "Dedicated travel manager",
            "Daily breakfast",
          ]
        : ["Flights", "Hotels", "Airport transfers", "Daily breakfast", "Sightseeing"],
      exclusions: ["Visa fees", "Travel insurance", "Personal expenses"],
      itinerary: buildItinerary(days, dest.name),
      highlights: [`${dest.tagline}`, "Curated experiences", "24x7 support"],
      rating: Math.round((3.8 + (pkgs.length % 12) * 0.1) * 10) / 10,
      reviewCount: 20 + ((pkgs.length * 7) % 300),
      bookingCount: 50 + ((pkgs.length * 13) % 500),
      visaRequired: dest.visaRequired,
      isVisaFree: dest.isVisaFree,
      isActive: true,
    };
    if (cat === "corporate") {
      pkg.corporate = buildCorporateDetails(pkgs.length, dest.name);
      pkg.title = `${dest.name} Corporate ${["Retreat", "MICE", "Offsite", "Conference"][pkgs.length % 4]}`;
      pkg.slug = slugify(`${pkg.title}-${days}d`);
      pkg.description = `End-to-end corporate travel for teams of ${pkg.corporate.employeeCountMin}+ in ${dest.name}. Invoice & GST supported.`;
    }
    pkgs.push(pkg);
    i++;
  }
  return pkgs;
}

function redactMongoUri(uri) {
  if (!uri) return { host: "(not set)", database: "(unknown)" };
  const hostMatch =
    uri.match(/@([^/?]+)/) || uri.match(/mongodb(?:\+srv)?:\/\/([^/?]+)/);
  const dbMatch = uri.match(/\/([^/?]+)(?:\?|$)/);
  return {
    host: hostMatch ? hostMatch[1] : "unknown-host",
    database: dbMatch ? dbMatch[1] : "(default)",
  };
}

async function seedUsers() {
  let usersCreated = 0;
  const adminEmail = "admin@xoxotravels.com";
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: "XOXO Admin",
      email: adminEmail,
      password: "admin123",
      role: "admin",
      isVerified: true,
    });
    usersCreated++;
  }

  const demoEmail = "demo@xoxotravels.com";
  if (!(await User.findOne({ email: demoEmail }))) {
    await User.create({
      name: "Demo Traveller",
      email: demoEmail,
      password: "demo123",
      isVerified: true,
    });
    usersCreated++;
  }

  return usersCreated;
}

/**
 * Idempotent seed — upserts by slug. Use { force: true } to wipe destinations/packages first.
 */
async function seedDatabase({ force = false } = {}) {
  const uri = process.env.MONGODB_URI || "";
  const connectionInfo = redactMongoUri(uri);

  const stats = {
    destinationsInserted: 0,
    destinationsSkipped: 0,
    packagesInserted: 0,
    packagesSkipped: 0,
    usersCreated: 0,
    database: connectionInfo.database,
    host: connectionInfo.host,
    force,
  };

  if (force) {
    await Destination.deleteMany({});
    await Package.deleteMany({});
  }

  const destDocs = [];
  for (const d of destinations) {
    const slug = slugify(`${d.name}-${d.country}`);
    const existing = await Destination.findOne({ slug });
    if (existing) {
      stats.destinationsSkipped++;
      destDocs.push(existing);
      continue;
    }
    const created = await Destination.create({ ...d, slug });
    stats.destinationsInserted++;
    destDocs.push(created);
  }

  const pkgs = buildPackages(destDocs);
  for (const p of pkgs) {
    const existing = await Package.findOne({ slug: p.slug });
    if (existing) {
      stats.packagesSkipped++;
      continue;
    }
    await Package.create(p);
    stats.packagesInserted++;
  }

  stats.usersCreated = await seedUsers();

  return stats;
}

module.exports = {
  seedDatabase,
  redactMongoUri,
  destinations,
  buildPackages,
};
