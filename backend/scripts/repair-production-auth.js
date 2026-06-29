#!/usr/bin/env node
/**
 * Verify and repair production auth users + live API smoke tests.
 *
 * Usage (PowerShell):
 *   cd backend
 *   $env:MONGODB_URI="mongodb+srv://..."          # Atlas URI from Railway
 *   $env:PRODUCTION_API_URL="https://xoxo-production-2503.up.railway.app"
 *   npm run auth:repair
 *
 * Optional Railway push (after `railway login` + `railway link`):
 *   $env:PUSH_RAILWAY_SECRETS="true"
 *   npm run auth:repair
 */
require("dotenv").config({ path: ".env.production" });
require("dotenv").config();

const crypto = require("crypto");
const { execSync } = require("child_process");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const { normalizeEnvAliases, getEnvStatus } = require("../src/config/env");
const { getMongoUriDebugInfo } = require("../src/config/mongo-uri");

const API_BASE = (
  process.env.PRODUCTION_API_URL ||
  process.env.API_URL ||
  "https://xoxo-production-2503.up.railway.app"
).replace(/\/$/, "");

const USERS = [
  {
    email: "admin@xoxotravels.com",
    password: "admin123",
    name: "XOXO Admin",
    role: "admin",
    isVerified: true,
  },
  {
    email: "demo@xoxotravels.com",
    password: "demo123",
    name: "Demo Traveller",
    role: "user",
    isVerified: true,
  },
];

const report = {
  env: {},
  database: {},
  users: { found: [], created: [] },
  api: {},
};

function log(section, msg) {
  console.log(`[${section}] ${msg}`);
}

async function ensureUser(spec) {
  let user = await User.findOne({ email: spec.email });
  if (user) {
    report.users.found.push({ email: spec.email, role: user.role, isVerified: user.isVerified });
    log("USER", `Found ${spec.email} (role=${user.role})`);
    return user;
  }

  user = await User.create({
    name: spec.name,
    email: spec.email,
    password: spec.password,
    role: spec.role,
    isVerified: spec.isVerified,
  });
  report.users.created.push({ email: spec.email, role: user.role });
  log("USER", `Created ${spec.email} (role=${user.role})`);
  return user;
}

async function apiJson(method, path, { body, token, cookies } = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookies) headers.Cookie = cookies;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(25000),
    });

    const setCookie = res.headers.getSetCookie?.() || [];
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    return { status: res.status, data, cookies: setCookie };
  } catch (err) {
    if (process.platform === "win32") {
      return apiJsonCurl(method, path, { body, token, cookies, cause: err.message });
    }
    throw err;
  }
}

function apiJsonCurl(method, path, { body, token, cookies, cause }) {
  const { execFileSync } = require("child_process");
  const url = `${API_BASE}${path}`;
  const args = ["-s", "--connect-timeout", "20", "-m", "30", "-w", "\n__HTTP_STATUS__:%{http_code}", "-X", method, url];
  args.push("-H", "Content-Type: application/json");
  if (token) args.push("-H", `Authorization: Bearer ${token}`);
  if (cookies) args.push("-H", `Cookie: ${cookies}`);
  if (body) args.push("--data-raw", JSON.stringify(body));

  try {
    const out = execFileSync("curl.exe", args, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    const statusMatch = out.match(/__HTTP_STATUS__:(\d+)/);
    const status = statusMatch ? Number(statusMatch[1]) : 0;
    const text = statusMatch ? out.slice(0, statusMatch.index).trim() : out.trim();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    return { status, data, cookies: [], viaCurl: true };
  } catch (curlErr) {
    throw new Error(`fetch failed (${cause}); curl fallback failed (${curlErr.message})`);
  }
}

async function testLogin(email, password) {
  const res = await apiJson("POST", "/api/auth/login", {
    body: { email, password },
  });
  const token = res.data?.data?.accessToken;
  const role = res.data?.data?.user?.role;
  const cookieHeader = res.cookies.join("; ");
  return { ...res, token, role, cookieHeader };
}

async function repairDatabase() {
  const uri = process.env.MONGODB_URI || "";
  const isLocal = !uri || uri.includes("localhost") || uri.includes("127.0.0.1");

  if (isLocal) {
    log("DB", "MONGODB_URI not set or points to localhost — skipping direct Atlas repair.");
    log("DB", "Set MONGODB_URI to your Atlas connection string from Railway Variables.");
    report.database.skipped = true;
    return;
  }

  report.database.mongo = getMongoUriDebugInfo();
  await connectDB();
  report.database.connected = mongoose.connection.readyState === 1;
  log("DB", `Connected (${report.database.mongo.hostname})`);

  for (const spec of USERS) {
    await ensureUser(spec);
  }

  await mongoose.connection.close();
}

async function testApiFlow(label, email, password) {
  log("API", `Testing ${label} (${email})`);
  const login = await testLogin(email, password);
  const result = {
    loginStatus: login.status,
    jwt: Boolean(login.token),
    role: login.role,
    meStatus: null,
    logoutStatus: null,
    error: login.data?.message,
  };

  if (login.status !== 200 || !login.token) {
    report.api[label] = result;
    log("API", `Login FAILED (${login.status}): ${result.error || "no token"}`);
    return result;
  }

  log("API", `Login OK — role=${login.role}, JWT present`);

  const me = await apiJson("GET", "/api/auth/me", { token: login.token });
  result.meStatus = me.status;
  result.meEmail = me.data?.data?.user?.email;
  log("API", `/me → ${me.status}`);

  const logout = await apiJson("POST", "/api/auth/logout", {
    cookies: login.cookieHeader || undefined,
  });
  result.logoutStatus = logout.status;
  log("API", `/logout → ${logout.status}`);

  report.api[label] = result;
  return result;
}

function generateSecrets() {
  return {
    JWT_SECRET: crypto.randomBytes(32).toString("hex"),
    REFRESH_TOKEN_SECRET: crypto.randomBytes(32).toString("hex"),
  };
}

function printRailwayInstructions(secrets) {
  console.log("\n=== Railway environment repair ===");
  console.log("Railway CLI is not linked. Set these in Railway Dashboard → API service → Variables:\n");
  console.log(`JWT_SECRET=${secrets.JWT_SECRET}`);
  console.log(`REFRESH_TOKEN_SECRET=${secrets.REFRESH_TOKEN_SECRET}`);
  console.log("\nAlso verify:");
  console.log("  MONGODB_URI          (Atlas connection string)");
  console.log("  CLIENT_URL           (your Vercel app URL, e.g. https://xoxo.travel)");
  console.log("  ALLOWED_ORIGINS      (comma-separated Vercel domains)");
  console.log("\nVercel (frontend) Variables:");
  console.log(`  NEXT_PUBLIC_API_URL=${API_BASE}/api`);
  console.log(`  NEXT_PUBLIC_SOCKET_URL=${API_BASE}`);
  console.log(`  API_PROXY_TARGET=${API_BASE}`);
  console.log("\nAfter saving Railway variables, redeploy the API service.\n");
}

function tryPushRailwaySecrets(secrets) {
  if (process.env.PUSH_RAILWAY_SECRETS !== "true") return false;

  try {
    execSync("npx --yes @railway/cli whoami", { stdio: "pipe" });
  } catch {
    log("RAILWAY", "Not logged in — run: npx @railway/cli login");
    return false;
  }

  try {
    for (const [key, value] of Object.entries(secrets)) {
      execSync(`npx --yes @railway/cli variable set ${key}=${value}`, {
        stdio: "inherit",
        shell: true,
      });
      log("RAILWAY", `Set ${key}`);
    }
    return true;
  } catch (err) {
    log("RAILWAY", `Failed to set variables: ${err.message}`);
    return false;
  }
}

async function checkProductionHealth() {
  try {
    const res = await apiJson("GET", "/health");
    report.env.productionHealth = res.data;
    log("HEALTH", JSON.stringify(res.data?.env || {}, null, 0));
    return res;
  } catch (err) {
    report.env.productionHealth = { unreachable: true, error: err.message };
    log("HEALTH", `Unreachable: ${err.message}`);
    return null;
  }
}

async function main() {
  normalizeEnvAliases();
  report.env.local = getEnvStatus();

  console.log("\n=== XOXO Production Auth Repair ===\n");
  console.log(`API target: ${API_BASE}\n`);

  await checkProductionHealth();
  await repairDatabase();

  const secrets = generateSecrets();
  const pushed = tryPushRailwaySecrets(secrets);
  const prodEnv = report.env.productionHealth?.env;
  if (!pushed && prodEnv && (!prodEnv.jwtSecret || !prodEnv.refreshTokenSecret)) {
    printRailwayInstructions(secrets);
  } else if (!pushed && report.env.productionHealth?.unreachable) {
    printRailwayInstructions(secrets);
  }

  if (!report.env.productionHealth?.unreachable) {
    await testApiFlow("admin", USERS[0].email, USERS[0].password);
    await testApiFlow("demo", USERS[1].email, USERS[1].password);
  } else {
    log("API", "Skipping live API tests — production host unreachable from this machine.");
  }

  console.log("\n=== FINAL REPORT ===");
  console.log(JSON.stringify(report, null, 2));

  const adminOk = report.api.admin?.loginStatus === 200 && report.api.admin?.jwt;
  process.exit(adminOk ? 0 : 1);
}

main().catch(async (err) => {
  console.error("Repair failed:", err.message);
  try {
    await mongoose.connection.close();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
