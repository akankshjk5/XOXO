/**
 * Resolve and validate MONGODB_URI for all environments.
 * Never logs credentials — hostname and scheme only.
 */

const LOCAL_URI = "mongodb://localhost:27017/xoxo-travels";

function isServerless() {
  return Boolean(process.env.VERCEL || process.env.NEXT_RUNTIME || process.env.IS_SERVERLESS);
}

function isProduction() {
  return process.env.NODE_ENV === "production" || isServerless();
}

/** Strip accidental wrapping quotes from dashboard copy-paste. */
function sanitizeRawUri(raw) {
  if (!raw) return "";
  let uri = raw.trim();
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }
  return uri;
}

function getMongoScheme(uri) {
  if (!uri) return null;
  if (/^mongodb\+srv:/i.test(uri)) return "mongodb+srv";
  if (/^mongodb:/i.test(uri)) return "mongodb";
  return null;
}

/**
 * Extract hostname the same way the MongoDB driver does for SRV URIs.
 * Unencoded @ in the password makes the driver treat the next segment as host (e.g. "0804").
 */
function getMongoHostname(uri) {
  if (!uri) return null;

  const scheme = getMongoScheme(uri);
  if (!scheme) return null;

  const rest = uri.slice(scheme.length + 3); // after "://"
  const atIndex = rest.indexOf("@");

  let hostPart;
  if (atIndex === -1) {
    hostPart = rest;
  } else {
    hostPart = rest.slice(atIndex + 1);
  }

  // Host ends at /, ?, or a second @ (malformed multi-@ strings)
  const host = hostPart.split(/[/?@]/)[0];
  return host || null;
}

function isLocalMongoHost(hostname) {
  if (!hostname) return false;
  const host = hostname.split(":")[0].toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "mongo" || host === "0.0.0.0";
}

/** Safe debug info — no username/password. */
function getMongoUriDebugInfo() {
  const raw = process.env.MONGODB_URI;
  const uri = sanitizeRawUri(raw);
  return {
    typeofUri: typeof raw,
    exists: Boolean(uri),
    scheme: uri ? getMongoScheme(uri) : null,
    hostname: uri ? getMongoHostname(uri) : null,
    isServerless: isServerless(),
    nodeEnv: process.env.NODE_ENV || "development",
  };
}

function validateMongoUri(uri) {
  const scheme = getMongoScheme(uri);
  if (!scheme) {
    throw new Error(
      "MONGODB_URI must start with mongodb:// or mongodb+srv:// — check the Vercel environment variable."
    );
  }

  const hostname = getMongoHostname(uri);
  if (!hostname) {
    throw new Error("MONGODB_URI has no host — verify the Atlas connection string.");
  }

  // Hostname without a dot (e.g. "0804") means credentials/host split is wrong.
  // Local/docker hosts are valid without a dot.
  if (!isLocalMongoHost(hostname) && !hostname.includes(".")) {
    throw new Error(
      `MONGODB_URI hostname "${hostname}" is invalid. ` +
        "This usually means the password contains special characters (@, :, /, #) that must be URL-encoded, " +
        "or the connection string was truncated in Vercel. " +
        "Expected a host like cluster0.xxxxx.mongodb.net."
    );
  }

  if (scheme === "mongodb+srv" && !hostname.endsWith(".mongodb.net")) {
    throw new Error(
      `MONGODB_URI SRV host "${hostname}" does not look like MongoDB Atlas (*.mongodb.net).`
    );
  }

  return uri;
}

/**
 * Single source of truth for the connection string used by mongoose.connect().
 */
function resolveMongoUri() {
  const uri = sanitizeRawUri(process.env.MONGODB_URI);

  if (!uri) {
    if (isProduction()) {
      throw new Error(
        "MONGODB_URI is not set. Add it in Vercel → Project → Settings → Environment Variables."
      );
    }
    return LOCAL_URI;
  }

  return validateMongoUri(uri);
}

module.exports = {
  resolveMongoUri,
  getMongoHostname,
  getMongoUriDebugInfo,
  isServerless,
  isProduction,
  LOCAL_URI,
};
