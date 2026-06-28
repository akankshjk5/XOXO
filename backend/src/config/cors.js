/**
 * Production-aware CORS configuration.
 * Set ALLOWED_ORIGINS as comma-separated list for multiple domains.
 * Example: https://xoxo.travel,https://www.xoxo.travel
 */

function buildCorsOptions() {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const extra = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const allowedOrigins = new Set([
    clientUrl,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3005",
    ...extra,
  ]);

  const isDev = process.env.NODE_ENV !== "production";

  function isAllowedOrigin(origin) {
    if (!origin) return true;
    if (allowedOrigins.has(origin)) return true;
    if (isDev && /^http:\/\/localhost:\d+$/.test(origin)) return true;
    // Vercel production + preview deployments
    if (/^https:\/\/[a-z0-9-]+(-[a-z0-9-]+)*\.vercel\.app$/i.test(origin)) return true;
    return false;
  }

  return {
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "x-guest-id"],
  };
}

function getSocketCorsOrigins() {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const extra = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return [clientUrl, ...extra];
}

module.exports = { buildCorsOptions, getSocketCorsOrigins };
