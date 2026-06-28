const mongoose = require("mongoose");
const logger = require("./logger");
const { resolveMongoUri, getMongoUriDebugInfo } = require("./mongo-uri");

const connectDB = async ({ exitOnFail = true } = {}) => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const debug = getMongoUriDebugInfo();
  logger.info("MongoDB connection attempt", debug);

  try {
    const uri = resolveMongoUri();
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    logger.error("MongoDB connection error", {
      message: err.message,
      ...debug,
    });
    if (process.env.VERCEL || process.env.NEXT_RUNTIME || process.env.IS_SERVERLESS) {
      throw err;
    }
    if (exitOnFail) process.exit(1);
    throw err;
  }
};

module.exports = connectDB;
