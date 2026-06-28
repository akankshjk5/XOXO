require("dotenv").config();
const http = require("http");
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const { validateEnv } = require("./config/env");
const { buildCorsOptions, getSocketCorsOrigins } = require("./config/cors");
const logger = require("./config/logger");
const connectDB = require("./config/db");
const { seedDatabase } = require("./services/seedDatabase");
const socketSetup = require("./config/socket");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const requestId = require("./middleware/requestId");
const { standardLimiter, authLimiter, aiLimiter } = require("./middleware/rateLimiter");
const paymentCtrl = require("./controllers/payment.controller");
const { INVOICE_DIR } = require("./utils/invoice");
const mongoose = require("mongoose");

let env;
try {
  env = validateEnv();
} catch (err) {
  logger.error(`Environment validation failed: ${err.message}`);
  env = {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    port: Number(process.env.PORT) || 5000,
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    trustProxy: process.env.TRUST_PROXY === "true" || process.env.NODE_ENV === "production",
  };
}

const app = express();
const server = http.createServer(app);

if (env.trustProxy) {
  app.set("trust proxy", 1);
}

// Razorpay webhook must receive raw body for signature verification
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentCtrl.webhook
);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(require("cors")(buildCorsOptions()));
app.use(requestId);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  morgan.token("req-id", (req) => req.id);
  app.use(
    morgan(":req-id :method :url :status :response-time ms", {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

app.use(standardLimiter);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/invoices", express.static(INVOICE_DIR));

/** Railway liveness — always 200 once HTTP server is up (DB may still be connecting). */
function healthHandler(req, res) {
  const dbState = mongoose.connection.readyState;
  const dbLabels = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  res.status(200).json({
    success: true,
    message: "XOXO Travels API",
    time: new Date().toISOString(),
    environment: env.nodeEnv,
    database: dbLabels[dbState] || "unknown",
    ready: dbState === 1,
    version: process.env.npm_package_version || "1.0.0",
  });
}

app.get("/api/health", healthHandler);
app.get("/health", healthHandler);

app.use("/api/auth", authLimiter, require("./routes/auth.routes"));
app.use("/api/packages", require("./routes/package.routes"));
app.use("/api/destinations", require("./routes/destination.routes"));
app.use("/api/inventory", require("./routes/inventory.routes"));
app.use("/api/transport", require("./routes/transport.routes"));
app.use("/api/ai", aiLimiter, require("./routes/ai.routes"));
app.use("/api/concierge", aiLimiter, require("./routes/concierge.routes"));
app.use("/api/search", require("./routes/search.routes"));
app.use("/api/bookings", require("./routes/booking.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/itineraries", require("./routes/itinerary.routes"));
app.use("/api/visa", require("./routes/visa.routes"));
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/wallet", require("./routes/wallet.routes"));
app.use("/api/guides", require("./routes/guide.routes"));
app.use("/api/chat", require("./routes/chat.routes"));
app.use("/api/match", require("./routes/match.routes"));
app.use("/api/nearby", require("./routes/nearby.routes"));
app.use("/api/verification", require("./routes/verification.routes"));
app.use("/api/groups", require("./routes/group.routes"));
app.use("/api/posts", require("./routes/post.routes"));
app.use("/api/friends", require("./routes/friend.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

app.use(notFound);
app.use(errorHandler);

const io = new Server(server, {
  cors: { origin: getSocketCorsOrigins(), credentials: true },
});
app.set("io", io);
socketSetup(io);

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

async function maybeAutoSeed() {
  if (process.env.SEED_IF_EMPTY === "false") return;

  const Destination = require("./models/Destination");
  const destCount = await Destination.countDocuments();
  if (destCount > 0 && process.env.SEED_ON_BOOT !== "true") return;

  try {
    const stats = await seedDatabase({ force: false });
    logger.info("Auto-seeded empty database", stats);
  } catch (err) {
    logger.error("Auto-seed failed", { error: err.message, stack: err.stack });
  }
}

async function bootstrapDatabase() {
  try {
    await connectDB({ exitOnFail: false });
    if (mongoose.connection.readyState === 1) {
      await maybeAutoSeed();
    } else {
      logger.warn("MongoDB not ready after connect — skipping auto-seed");
    }
  } catch (err) {
    logger.error("Database bootstrap failed — API up, retrying DB in background", {
      error: err.message,
    });
    if (!(process.env.VERCEL || process.env.NEXT_RUNTIME || process.env.IS_SERVERLESS)) {
      setTimeout(bootstrapDatabase, 5000);
    } else {
      throw err;
    }
  }
}

const startPromise = (async () => {
  if (process.env.VERCEL || process.env.NEXT_RUNTIME || process.env.IS_SERVERLESS) {
    logger.info("Serverless database connection initializing...");
    await bootstrapDatabase();
    logger.info("Serverless database connection initialized successfully.");
    return;
  }

  return new Promise((resolve) => {
    server.listen(PORT, HOST, () => {
      logger.info(`XOXO Travels API listening on ${HOST}:${PORT}`, {
        environment: env.nodeEnv,
        clientUrl: env.clientUrl,
      });
      bootstrapDatabase();
      resolve();
    });
  });
})();

server.on("error", (err) => {
  logger.error("HTTP server error", { error: err.message, stack: err.stack });
  if (!(process.env.VERCEL || process.env.NEXT_RUNTIME || process.env.IS_SERVERLESS)) {
    process.exit(1);
  }
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled rejection", { error: err.message, stack: err.stack });
});

module.exports = { app, server, io, startPromise };
