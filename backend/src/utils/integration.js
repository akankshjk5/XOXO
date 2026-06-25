const logger = require("../config/logger");

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const RETRYABLE_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
]);

/**
 * Exponential backoff retry for external API calls.
 * @param {() => Promise<T>} fn
 * @param {{ label: string, maxAttempts?: number, baseDelayMs?: number }} opts
 * @returns {Promise<T>}
 */
async function withRetry(fn, { label, maxAttempts = 3, baseDelayMs = 400 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const retryable =
        RETRYABLE_STATUS.has(err.statusCode) ||
        RETRYABLE_STATUS.has(err.status) ||
        RETRYABLE_CODES.has(err.code) ||
        err.name === "FetchError";

      if (!retryable || attempt === maxAttempts) {
        logIntegrationFailure(label, err, { attempt, maxAttempts });
        throw err;
      }

      const delay = baseDelayMs * 2 ** (attempt - 1);
      logger.warn("Integration retry", { label, attempt, delayMs: delay, error: err.message });
      await sleep(delay);
    }
  }
  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logIntegrationFailure(integration, err, extra = {}) {
  logger.error("Integration failure", {
    integration,
    error: err.message,
    statusCode: err.statusCode || err.status,
    code: err.code,
    ...extra,
  });
}

/**
 * Run live provider search; fall back to mock on failure (keeps API responsive).
 */
async function withMockFallback({ live, mock, params, domain }) {
  if (!live.isLive()) {
    return mock.search(params);
  }
  try {
    return await live.search(params);
  } catch (err) {
    logIntegrationFailure(domain, err, { fallback: "mock" });
    const result = await mock.search(params);
    return {
      ...result,
      meta: {
        ...result.meta,
        fallback: true,
        reason: "live_unavailable",
        liveProvider: live.name,
      },
    };
  }
}

/**
 * Run live maps call; return empty demo payload on failure.
 */
async function withMapsFallback(fn, { domain, demoPayload }) {
  try {
    return await fn();
  } catch (err) {
    logIntegrationFailure(domain, err, { fallback: "demo" });
    return { ...demoPayload, fallback: true, reason: "live_unavailable" };
  }
}

module.exports = {
  withRetry,
  logIntegrationFailure,
  withMockFallback,
  withMapsFallback,
  RETRYABLE_STATUS,
};
