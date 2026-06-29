/** Package categories — keep in sync with frontend lib/travel-categories.ts */

const PACKAGE_CATEGORIES = [
  "honeymoon",
  "family",
  "friends",
  "solo",
  "adventure",
  "luxury",
  "corporate",
];

const TYPE_TO_CATEGORY = {
  couple: "honeymoon",
  family: "family",
  friends: "friends",
  solo: "solo",
  corporate: "corporate",
  honeymoon: "honeymoon",
  adventure: "adventure",
  luxury: "luxury",
};

const CORPORATE_TRAVEL_TYPES = [
  "conference",
  "business-event",
  "incentive-travel",
  "team-outing",
  "workation",
  "corporate-retreat",
  "mice-travel",
];

function resolveCategoryFilter({ category, type } = {}) {
  if (category) {
    return TYPE_TO_CATEGORY[category] || category;
  }
  if (type) {
    return TYPE_TO_CATEGORY[type] || type;
  }
  return null;
}

module.exports = {
  PACKAGE_CATEGORIES,
  TYPE_TO_CATEGORY,
  CORPORATE_TRAVEL_TYPES,
  resolveCategoryFilter,
};
