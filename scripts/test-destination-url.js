/** Destination URL validation tests — run: node scripts/test-destination-url.js */

function isValidDestinationSlug(slug) {
  return typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function buildDestinationHref(slug) {
  if (!isValidDestinationSlug(slug)) return "/destinations";
  return `/destinations/${slug}`;
}

const tests = [
  ["valid canonical slug", isValidDestinationSlug("bali-indonesia"), true],
  ["valid single-word slug", isValidDestinationSlug("bali"), true],
  ["invalid empty", isValidDestinationSlug(""), false],
  ["invalid uppercase", isValidDestinationSlug("Bali"), false],
  ["invalid underscore", isValidDestinationSlug("bali_indonesia"), false],
  ["build canonical href", buildDestinationHref("thailand-thailand"), "/destinations/thailand-thailand"],
  ["build bad format fallback", buildDestinationHref("Bali"), "/destinations"],
];

let fail = 0;
tests.forEach(([name, got, expected]) => {
  const ok = got === expected;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
});

process.exit(fail > 0 ? 1 : 0);
