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
const socketSetup = require("./config/socket");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const requestId = require("./middleware/requestId");
const { standardLimiter, authLimiter, aiLimiter } = require("./middleware/rateLimiter");
const paymentCtrl = require("./controllers/payment.controller");
const { INVOICE_DIR } = require("./utils/invoice");
const mongoose = require("mongoose");

const env = validateEnv();
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

app.get("/api/health", async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbOk = dbState === 1;
  res.status(dbOk ? 200 : 503).json({
    success: dbOk,
    message: "XOXO Travels API",
    time: new Date().toISOString(),
    environment: env.nodeEnv,
    database: dbOk ? "connected" : "disconnected",
    version: process.env.npm_package_version || "1.0.0",
  });
});

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

app.use(notFound);
app.use(errorHandler);

const io = new Server(server, {
  cors: { origin: getSocketCorsOrigins(), credentials: true },
});
app.set("io", io);
socketSetup(io);

const PORT = env.port;

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`XOXO Travels API listening on port ${PORT}`, {
      environment: env.nodeEnv,
      clientUrl: env.clientUrl,
    });
  });
};

start();

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled rejection", { error: err.message, stack: err.stack });
});

module.exports = { app, server, io };
