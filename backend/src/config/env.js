/**
 * Validates required environment variables at startup.
 * In production, missing critical secrets will prevent the server from booting.
 */

const { resolveMongoUri, getMongoUriDebugInfo } = require("./mongo-uri");

const REQUIRED_PRODUCTION = [
  "MONGODB_URI",
  "JWT_SECRET",
  "REFRESH_TOKEN_SECRET",
  "CLIENT_URL",
];

const WEAK_SECRETS = [
  "change_this_to_a_long_random_string",
  "change_this_refresh_secret_too",
  "secret",
  "jwt_secret",
];

/** Map common dashboard typos / aliases onto canonical names (no values logged). */
function normalizeEnvAliases() {
  const pairs = [
    ["REFRESH_TOKEN_SECRET", ["JWT_REFRESH_SECRET", "JWT_REFRESH_TOKEN_SECRET", "REFRESH_SECRET"]],
    ["JWT_SECRET", ["JWT_ACCESS_SECRET", "ACCESS_TOKEN_SECRET"]],
  ];

  for (const [canonical, aliases] of pairs) {
    if (process.env[canonical]?.trim()) continue;
    for (const alias of aliases) {
      const value = process.env[alias]?.trim();
      if (value) {
        process.env[canonical] = value;
        break;
      }
    }
  }
}

/** Safe booleans for /health — never exposes secret values. */
function getEnvStatus() {
  normalizeEnvAliases();
  return {
    mongodbUri: Boolean(process.env.MONGODB_URI?.trim()),
    jwtSecret: Boolean(process.env.JWT_SECRET?.trim()),
    refreshTokenSecret: Boolean(process.env.REFRESH_TOKEN_SECRET?.trim()),
    clientUrl: Boolean(process.env.CLIENT_URL?.trim()),
    refreshAliasDetected: Boolean(
      process.env.JWT_REFRESH_SECRET?.trim() && !process.env.REFRESH_TOKEN_SECRET?.trim()
    ),
    mongo: getMongoUriDebugInfo(),
  };
}

function validateEnv() {
  normalizeEnvAliases();

  const isProd = process.env.NODE_ENV === "production";
  const missing = REQUIRED_PRODUCTION.filter((k) => !process.env[k]?.trim());

  if (isProd && missing.length) {
    throw new Error(`Missing required production env vars: ${missing.join(", ")}`);
  }

  if (isProd) {
    for (const key of ["JWT_SECRET", "REFRESH_TOKEN_SECRET"]) {
      const val = process.env[key] || "";
      if (val.length < 32) {
        throw new Error(`${key} must be at least 32 characters in production`);
      }
      if (WEAK_SECRETS.includes(val.toLowerCase())) {
        throw new Error(`${key} is using a default/weak value — rotate before deploy`);
      }
    }
  }

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: isProd,
    port: Number(process.env.PORT) || 5000,
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    mongoUri: resolveMongoUri(),
    trustProxy: process.env.TRUST_PROXY === "true" || isProd,
  };
}

module.exports = { validateEnv, normalizeEnvAliases, getEnvStatus };
