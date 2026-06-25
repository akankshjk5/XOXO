const winston = require("winston");

const { combine, timestamp, json, errors, colorize, simple } = winston.format;

const isProd = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  defaultMeta: { service: "xoxo-travels-api" },
  transports: [
    new winston.transports.Console({
      format: isProd
        ? combine(timestamp(), errors({ stack: true }), json())
        : combine(colorize(), timestamp({ format: "HH:mm:ss" }), simple()),
    }),
  ],
});

module.exports = logger;
