#!/usr/bin/env node
/**
 * Extended beta QA smoke test — social, admin, notifications, guides.
 * Usage: API_URL=http://localhost:5000 node scripts/qa-smoke-extended.js
 */
require("dotenv").config();

const BASE = (process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");
let passed = 0;
let failed = 0;
let token = null;
let adminToken = null;
const issues = [];

async function req(method, path, { body, auth, token: t } = {}) {
  const headers = { "Content-Type": "application/json" };
  const tok = t || token;
  if (auth && tok) headers.Authorization = `Bearer ${tok}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

function ok(name, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    const msg = detail ? `${name}: ${detail}` : name;
    issues.push(msg);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function run() {
  console.log(`\nXOXO Travels Extended QA Smoke Test`);
  console.log(`Target: ${BASE}\n`);

  // Auth
  const login = await req("POST", "/api/auth/login", {
    body: { email: "demo@xoxotravels.com", password: "demo123" },
  });
  token = login.data.data?.accessToken;
  ok("Demo login", login.status === 200 && !!token);

  const adminLogin = await req("POST", "/api/auth/login", {
    body: { email: "admin@xoxotravels.com", password: "admin123" },
  });
  adminToken = adminLogin.data.data?.accessToken;
  ok("Admin login", adminLogin.status === 200 && !!adminToken);

  const register = await req("POST", "/api/auth/register", {
    body: {
      name: "QA Test User",
      email: `qa_${Date.now()}@test.local`,
      password: "testpass123",
    },
  });
  ok("Register new user", register.status === 201 || register.status === 200);

  // Dashboard data
  const bookings = await req("GET", "/api/bookings/my", { auth: true });
  ok("My bookings", bookings.status === 200 && Array.isArray(bookings.data.data));

  const wallet = await req("GET", "/api/wallet", { auth: true });
  ok("Wallet", wallet.status === 200);

  const notifs = await req("GET", "/api/notifications", { auth: true });
  ok("Notifications list", notifs.status === 200);

  // AI
  const ai = await req("POST", "/api/ai/itinerary", {
    auth: true,
    body: {
      destination: "Goa",
      days: 3,
      tripType: "friends",
      budget: "budget",
      travelStyle: "Beaches",
    },
  });
  ok("AI itinerary", ai.status === 200, `status=${ai.status}`);

  const itineraries = await req("GET", "/api/itineraries/my", { auth: true });
  ok("Saved itineraries", itineraries.status === 200);

  // Social - Match
  const matchProfile = await req("GET", "/api/match/profile", { auth: true });
  ok("Match profile get", matchProfile.status === 200 || matchProfile.status === 404);

  const matchDiscover = await req("GET", "/api/match/discover", { auth: true });
  ok("Match discover", matchDiscover.status === 200);

  const matchReqs = await req("GET", "/api/match/requests", { auth: true });
  ok("Match requests", matchReqs.status === 200);

  // Nearby
  const nearbyMe = await req("GET", "/api/nearby/me", { auth: true });
  ok("Nearby me", nearbyMe.status === 200);

  const nearbyUpdate = await req("PUT", "/api/nearby/location", {
    auth: true,
    body: { latitude: 28.6139, longitude: 77.209 },
  });
  ok("Nearby location update", nearbyUpdate.status === 200);

  const nearbyList = await req("GET", "/api/nearby", { auth: true });
  ok("Nearby travelers", nearbyList.status === 200);

  // Friends
  const friends = await req("GET", "/api/friends", { auth: true });
  ok("Friends list", friends.status === 200);

  const friendReqs = await req("GET", "/api/friends/requests", { auth: true });
  ok("Friend requests", friendReqs.status === 200);

  // Community / Posts
  const posts = await req("GET", "/api/posts");
  ok("Community feed", posts.status === 200);

  // Groups
  const groups = await req("GET", "/api/groups");
  ok("Groups list", groups.status === 200);

  const myGroups = await req("GET", "/api/groups/my", { auth: true });
  ok("My groups", myGroups.status === 200);

  // Chat
  const convos = await req("GET", "/api/chat/conversations", { auth: true });
  ok("Chat conversations", convos.status === 200);

  // Guides
  const guides = await req("GET", "/api/guides");
  ok("Guides list", guides.status === 200);

  // Visa
  const visa = await req("GET", "/api/visa");
  ok("Visa list", visa.status === 200 && visa.data.data?.length > 0);

  // Verification
  const verStatus = await req("GET", "/api/verification/status", { auth: true });
  ok("Verification status", verStatus.status === 200);

  const verPending = await req("GET", "/api/verification/pending", {
    auth: true,
    token: adminToken,
  });
  ok("Admin verification queue", verPending.status === 200, `status=${verPending.status}`);

  // Destinations + packages detail
  const dests = await req("GET", "/api/destinations?limit=1");
  const destSlug = dests.data.data?.[0]?.slug;
  if (destSlug) {
    const destDetail = await req("GET", `/api/destinations/slug/${destSlug}`);
    ok("Destination detail by slug", destDetail.status === 200);
  } else {
    ok("Destination detail by slug", false, "no destinations");
  }

  const pkgs = await req("GET", "/api/packages?limit=1");
  const pkgId = pkgs.data.data?.[0]?._id;
  if (pkgId) {
    const pkgDetail = await req("GET", `/api/packages/${pkgId}`);
    ok("Package detail", pkgDetail.status === 200);
    const reviews = await req("GET", `/api/reviews/package/${pkgId}`);
    ok("Package reviews", reviews.status === 200);
  }

  // Wishlist
  if (pkgId) {
    const wish = await req("POST", `/api/users/wishlist/${pkgId}`, { auth: true });
    ok("Wishlist toggle", wish.status === 200);
  }

  // Unauthenticated protected routes should 401
  const noAuth = await req("GET", "/api/bookings/my");
  ok("Protected route rejects unauth", noAuth.status === 401, `status=${noAuth.status}`);

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (issues.length) {
    console.log("\nIssues:");
    issues.forEach((i) => console.log(`  - ${i}`));
  }
  console.log();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("QA test crashed:", err.message);
  process.exit(1);
});
