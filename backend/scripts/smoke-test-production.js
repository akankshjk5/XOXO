#!/usr/bin/env node
/**
 * Production smoke test — run against a deployed or local API.
 * Usage: API_URL=https://api.xoxo.travel node scripts/smoke-test-production.js
 */
require("dotenv").config();

const BASE = (process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");
let passed = 0;
let failed = 0;
let token = null;

async function req(method, path, { body, auth, headers: extraHeaders } = {}) {
  const headers = { "Content-Type": "application/json", ...extraHeaders };
  if (auth && token) headers.Authorization = `Bearer ${token}`;
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
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function run() {
  console.log(`\nXOXO Travels Production Smoke Test`);
  console.log(`Target: ${BASE}\n`);

  // 1. Health
  const health = await req("GET", "/api/health");
  ok("Health check", health.status === 200 && health.data.success);
  ok("Database connected", health.data.database === "connected", health.data.database);

  // 2. Integration status
  const inv = await req("GET", "/api/inventory/status");
  ok("Inventory status", inv.status === 200 && inv.data.success);
  ok("Flight provider", !!inv.data.data?.flights?.provider);
  ok("Payments status", !!inv.data.data?.payments);
  ok("Email status", !!inv.data.data?.email);
  ok("Uploads status", !!inv.data.data?.uploads);
  const mode = inv.data.data?.flights?.live ? "live" : "mock";
  ok("Provider mode reported", mode === "live" || mode === "mock", `flights=${mode}`);

  // 3. Flight search (mock or live)
  const flights = await req(
    "GET",
    "/api/inventory/flights?origin=DEL&destination=BKK&departureDate=2026-09-01&adults=1"
  );
  ok("Flight search", flights.status === 200 && Array.isArray(flights.data.data));
  ok("Flight results", flights.data.data?.length > 0, `count=${flights.data.data?.length}`);

  // 4. Hotel search
  const hotels = await req(
    "GET",
    "/api/inventory/hotels?cityCode=BKK&checkIn=2026-09-01&checkOut=2026-09-04&adults=2"
  );
  ok("Hotel search", hotels.status === 200 && Array.isArray(hotels.data.data));

  // 5. Activities
  const acts = await req("GET", "/api/inventory/activities?latitude=13.75&longitude=100.52");
  ok("Activity search", acts.status === 200 && Array.isArray(acts.data.data));

  // 6. Google Places (mock or live)
  const places = await req("GET", "/api/inventory/places/autocomplete?q=Bang");
  ok(
    "Places autocomplete",
    places.status === 200 && Array.isArray(places.data.data?.predictions)
  );
  ok(
    "Places predictions",
    places.data.data?.predictions?.length > 0,
    `count=${places.data.data?.predictions?.length}`
  );

  const details = await req("GET", "/api/inventory/places/details?placeId=mock_bkk");
  ok("Place details", details.status === 200 && details.data.success);

  // 7. Upload status
  const uploadStatus = await req("GET", "/api/upload/status");
  ok("Upload status", uploadStatus.status === 200 && uploadStatus.data.success);

  // 8. Visa
  const visa = await req("GET", "/api/visa/thailand");
  ok("Visa info", visa.status === 200 && visa.data.found);

  // 9. Packages (catalog)
  const pkgs = await req("GET", "/api/packages?limit=3");
  ok("Packages list", pkgs.status === 200 && pkgs.data.data?.length > 0);

  // 10. Auth — login demo user
  const login = await req("POST", "/api/auth/login", {
    body: { email: "demo@xoxotravels.com", password: "demo123" },
  });
  ok("Auth login", login.status === 200 && login.data.data?.accessToken);
  token = login.data.data?.accessToken;

  // 11. Auth me
  const me = await req("GET", "/api/auth/me", { auth: true });
  ok("Auth me", me.status === 200 && me.data.data?.user?.email);

  // 12. AI itinerary (may fail without Anthropic key — warn only)
  const ai = await req("POST", "/api/ai/itinerary", {
    auth: true,
    body: {
      destination: "Bali",
      days: 3,
      tripType: "couple",
      budget: "mid-range",
      travelStyle: "Culture",
    },
  });
  ok("AI planner", ai.status === 200 || ai.status === 502, `status=${ai.status}`);

  // 12b. AI Concierge
  const prompts = await req("GET", "/api/concierge/prompts");
  ok("Concierge prompts", prompts.status === 200 && Array.isArray(prompts.data.data));

  const session = await req("POST", "/api/concierge/sessions");
  const sessionId = session.data.data?.id || session.data.data?._id;
  const guestId = session.data.guestId;
  ok("Concierge session create", session.status === 201 && !!sessionId, `id=${sessionId}`);

  if (sessionId) {
    const guestHeaders = guestId ? { "x-guest-id": guestId } : {};
    const msg = await req("POST", `/api/concierge/sessions/${sessionId}/message`, {
      headers: guestHeaders,
      body: {
        message: "I have ₹80000 for a honeymoon in Bali for 6 days in December",
        stream: false,
      },
    });
    ok(
      "Concierge message",
      msg.status === 200 && msg.data.data?.messages?.length >= 2,
      `status=${msg.status}`
    );
    ok(
      "Concierge plan or gathering",
      msg.data.data?.status === "plan_ready" || msg.data.data?.status === "gathering",
      `status=${msg.data.data?.status}`
    );

    const shareToken = msg.data.data?.shareToken;
    if (shareToken) {
      const shared = await req("GET", `/api/concierge/share/${shareToken}`);
      ok("Concierge share", shared.status === 200 && shared.data.data?.plan != null);
    }
  }

  // 12c. Transport Hub
  const tStatus = await req("GET", "/api/transport/status");
  ok("Transport status", tStatus.status === 200 && Array.isArray(tStatus.data.data?.modes));

  const tModes = await req("GET", "/api/transport/modes");
  ok("Transport modes", tModes.status === 200 && tModes.data.data?.length > 0);

  const tSearch = await req(
    "GET",
    "/api/transport/search?origin=DEL&destination=MUM&departureDate=2026-09-01&passengers=1"
  );
  ok(
    "Transport search",
    tSearch.status === 200 && tSearch.data.offers?.length > 0,
    `count=${tSearch.data.offers?.length}`
  );
  ok(
    "Transport recommendations",
    tSearch.data.recommendations?.cheapest != null,
    "cheapest present"
  );
  ok("Transport grouped results", Array.isArray(tSearch.data.grouped));

  // 13. Booking flow (demo payment)
  const pkgId = pkgs.data.data?.[0]?._id;
  if (pkgId && token) {
    const book = await req("POST", "/api/bookings", {
      auth: true,
      body: {
        packageId: pkgId,
        travelDate: "2026-10-01",
        numTravelers: 2,
        travelers: [{ name: "Test User", age: 30 }],
      },
    });
    ok("Create booking", book.status === 201, `status=${book.status}`);

    if (book.status === 201) {
      const bookingId = book.data.data._id;
      const order = await req("POST", "/api/payments/order", {
        auth: true,
        body: { bookingId },
      });
      ok("Payment order", order.status === 200, `demo=${order.data.demo}`);

      const verify = await req("POST", "/api/payments/verify", {
        auth: true,
        body: {
          bookingId,
          razorpay_order_id: order.data.data?.orderId,
          razorpay_payment_id: "pay_smoke_test",
          razorpay_signature: "demo",
        },
      });
      ok("Payment verify", verify.status === 200 && verify.data.data?.paymentStatus === "paid");
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Smoke test crashed:", err.message);
  process.exit(1);
});
