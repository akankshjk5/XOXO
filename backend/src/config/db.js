const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async ({ exitOnFail = true } = {}) => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/xoxo-travels";
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    if (process.env.VERCEL || process.env.NEXT_RUNTIME || process.env.IS_SERVERLESS) {
      throw err;
    }
    if (exitOnFail) process.exit(1);
    throw err;
  }
};
module.exports = connectDB;
