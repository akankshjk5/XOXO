require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { seedDatabase, redactMongoUri } = require("./services/seedDatabase");

const force = process.argv.includes("--force") || process.env.SEED_FORCE === "true";

const run = async () => {
  await connectDB();

  const before = redactMongoUri(process.env.MONGODB_URI);
  console.log("=== XOXO Travels Database Seed ===");
  console.log(`Host:     ${before.host}`);
  console.log(`Database: ${before.database}`);
  console.log(`Mode:     ${force ? "FORCE (wipe + reseed)" : "idempotent (skip duplicates)"}`);
  console.log("");

  const stats = await seedDatabase({ force });

  console.log("--- Results ---");
  console.log(`Destinations inserted: ${stats.destinationsInserted}`);
  console.log(`Destinations skipped:  ${stats.destinationsSkipped}`);
  console.log(`Packages inserted:     ${stats.packagesInserted}`);
  console.log(`Packages skipped:      ${stats.packagesSkipped}`);
  console.log(`Users created:         ${stats.usersCreated}`);
  console.log(`Database:              ${stats.database}`);
  console.log(`Host:                  ${stats.host}`);
  console.log("Seed complete.");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.connection.close();
  process.exit(1);
});
