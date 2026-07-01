const Package = require("../../models/Package");

async function loadPackageContext(packageId) {
  if (!packageId) return null;
  try {
    const pkg = await Package.findById(packageId)
      .populate("destination", "name country slug coverImage")
      .lean();
    if (!pkg) return null;
    return {
      source: "package",
      packageId: String(pkg._id),
      path: `/packages/${pkg._id}`,
      package: {
        id: String(pkg._id),
        title: pkg.title,
        slug: pkg.slug,
        pricePerPerson: pkg.pricePerPerson,
        originalPrice: pkg.originalPrice,
        durationDays: pkg.durationDays,
        durationNights: pkg.durationNights,
        category: pkg.category,
        badge: pkg.badge,
        rating: pkg.rating,
        reviewCount: pkg.reviewCount,
        images: (pkg.images || []).slice(0, 3),
        highlights: pkg.highlights || [],
        inclusions: pkg.inclusions || [],
        isVisaFree: pkg.isVisaFree,
        destination: pkg.destination
          ? {
              name: pkg.destination.name,
              country: pkg.destination.country,
              slug: pkg.destination.slug,
            }
          : null,
      },
    };
  } catch {
    return null;
  }
}

async function resolvePageContext(pageContext = {}) {
  if (!pageContext || typeof pageContext !== "object") return null;

  if (pageContext.packageId) {
    const loaded = await loadPackageContext(pageContext.packageId);
    if (loaded) return loaded;
  }

  if (pageContext.package) return pageContext;

  if (pageContext.path?.includes("/packages/")) {
    const id = pageContext.path.split("/packages/")[1]?.split(/[?#/]/)[0];
    if (id) return loadPackageContext(id);
  }

  return pageContext.source ? pageContext : null;
}

function mergePageContextIntoIntent(intent, pageContext) {
  if (!pageContext?.package) return intent;
  const pkg = pageContext.package;
  const merged = { ...intent };

  if (!merged.destination) {
    merged.destination =
      pkg.destination?.name || pkg.title?.split(" ")[0] || merged.destination;
  }
  if (!merged.durationDays && pkg.durationDays) merged.durationDays = pkg.durationDays;
  if (!merged.budgetINR && pkg.pricePerPerson) {
    const travelers = merged.travelers || 2;
    merged.budgetINR = Math.round(pkg.pricePerPerson * travelers);
    merged.budgetLabel = `₹${merged.budgetINR.toLocaleString("en-IN")}`;
  }
  if (!merged.hotelCategory && pkg.category === "luxury") merged.hotelCategory = "luxury";
  if (pkg.isVisaFree && !merged.visaPreference) merged.visaPreference = "visa-free";

  merged.pagePackageId = pkg.id;
  merged.pagePackageTitle = pkg.title;
  return merged;
}

function formatPackageContextForPrompt(pageContext) {
  if (!pageContext?.package) return "";
  const p = pageContext.package;
  return `PAGE CONTEXT — User is viewing XOXO package on website:
Title: ${p.title}
Price: ₹${(p.pricePerPerson || 0).toLocaleString("en-IN")} per person
Duration: ${p.durationDays} days
Destination: ${p.destination?.name || "—"}, ${p.destination?.country || ""}
Rating: ${p.rating || "—"} (${p.reviewCount || 0} reviews)
Highlights: ${(p.highlights || []).slice(0, 5).join("; ")}
Inclusions: ${(p.inclusions || []).slice(0, 6).join("; ")}
Book URL path: /packages/${p.id}
Do NOT ask for destination, base price, or duration again — they are known.`;
}

module.exports = {
  loadPackageContext,
  resolvePageContext,
  mergePageContextIntoIntent,
  formatPackageContextForPrompt,
};
