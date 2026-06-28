/**
 * Validates required environment variables at startup.
 * In production, missing critical secrets will prevent the server from booting.
 */

const { resolveMongoUri } = require("./mongo-uri");

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

function validateEnv() {
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

module.exports = { validateEnv };
