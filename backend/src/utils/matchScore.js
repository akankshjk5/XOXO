/** Great-circle distance in kilometres between two lat/lng points. */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function dateOverlapScore(fromA, toA, fromB, toB) {
  const start = Math.max(new Date(fromA).getTime(), new Date(fromB).getTime());
  const end = Math.min(new Date(toA).getTime(), new Date(toB).getTime());
  if (end < start) return 0;
  const overlap = end - start;
  const spanA = new Date(toA).getTime() - new Date(fromA).getTime() || 1;
  const spanB = new Date(toB).getTime() - new Date(fromB).getTime() || 1;
  const ratio = overlap / Math.min(spanA, spanB);
  return Math.min(1, ratio);
}

function interestOverlapScore(a = [], b = []) {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b.map((x) => x.toLowerCase()));
  const common = a.filter((x) => setB.has(x.toLowerCase())).length;
  return common / Math.max(a.length, b.length);
}

function destinationScore(destA, destB) {
  if (!destA || !destB) return 0;
  const a = destA.toLowerCase().trim();
  const b = destB.toLowerCase().trim();
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.7;
  return 0;
}

/** Weighted match percentage 0–100. */
function computeMatchScore(myProfile, theirProfile) {
  const dest = destinationScore(myProfile.destination, theirProfile.destination);
  const dates = dateOverlapScore(
    myProfile.travelDateFrom,
    myProfile.travelDateTo,
    theirProfile.travelDateFrom,
    theirProfile.travelDateTo
  );
  const interests = interestOverlapScore(myProfile.interests, theirProfile.interests);
  const raw = dest * 0.4 + dates * 0.35 + interests * 0.25;
  return Math.round(raw * 100);
}

module.exports = { haversineKm, computeMatchScore, dateOverlapScore, interestOverlapScore, destinationScore };
