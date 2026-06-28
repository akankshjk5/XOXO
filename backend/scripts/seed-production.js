/**
 * Seed production MongoDB from your local machine.
 *
 * Usage (PowerShell):
 *   cd backend
 *   $env:MONGODB_URI="mongodb+srv://USER:PASS@cluster.mongodb.net/xoxo-travels?retryWrites=true&w=majority"
 *   npm run seed:production
 *
 * Or create backend/.env.production (gitignored) with MONGODB_URI=...
 */
require("dotenv").config({ path: ".env.production" });
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const { seedDatabase, redactMongoUri } = require("../src/services/seedDatabase");

const uri = process.env.MONGODB_URI || "";
const isLocal =
  !uri ||
  uri.includes("localhost") ||
  uri.includes("127.0.0.1");

if (isLocal) {
  console.error("\n❌ Production seed requires a remote MONGODB_URI.\n");
  console.error("Get it from: Railway Dashboard → API service → Variables → MONGODB_URI\n");
  console.error("Then run:\n");
  console.error('  $env:MONGODB_URI="mongodb+srv://..."');
  console.error("  npm run seed:production\n");
  process.exit(1);
}

const force = process.argv.includes("--force") || process.env.SEED_FORCE === "true";

async function run() {
  await connectDB();
  const info = redactMongoUri(uri);

  console.log("\n=== XOXO Production Database Seed ===");
  console.log(`Host:     ${info.host}`);
  console.log(`Database: ${info.database}`);
  console.log(`Mode:     ${force ? "FORCE" : "idempotent"}\n`);

  const stats = await seedDatabase({ force });

  console.log("--- Results ---");
  console.log(`Destinations inserted: ${stats.destinationsInserted}`);
  console.log(`Destinations skipped:  ${stats.destinationsSkipped}`);
  console.log(`Packages inserted:     ${stats.packagesInserted}`);
  console.log(`Packages skipped:      ${stats.packagesSkipped}`);
  console.log(`Users created:         ${stats.usersCreated}`);
  console.log(`Database:              ${stats.database}`);
  console.log(`Host:                  ${stats.host}`);

  const verifyUrl =
    process.env.PRODUCTION_API_URL ||
    "https://xoxo-production-2503.up.railway.app";

  console.log("\nVerify:");
  console.log(`  curl ${verifyUrl}/api/destinations`);
  console.log(`  curl ${verifyUrl}/api/packages\n`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Production seed failed:", err.message);
  await mongoose.connection.close();
  process.exit(1);
});
