/**
 * Central API URL resolution for browser + server.
 * NEXT_PUBLIC_* vars are inlined at build time on Vercel.
 */

const LOCAL_API = "http://localhost:5000/api";
const LOCAL_RELATIVE_API = "/api";
/** Production Railway API — used when env var missing at build time */
const PRODUCTION_RAILWAY_API = "https://xoxo-production-2503.up.railway.app/api";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Normalize API base — must end with /api */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      // Prefer same-origin /api (rewritten to Railway in next.config.mjs)
      console.warn(
        "[XOXO API] NEXT_PUBLIC_API_URL unset at build — using same-origin /api (proxied to Railway)"
      );
      return LOCAL_RELATIVE_API;
    }
    return LOCAL_API;
  }

  let base = stripTrailingSlash(raw);
  if (!base.endsWith("/api")) {
    base = `${base}/api`;
  }

  // Never use bare "/api" when a full Railway URL was configured
  if (base === LOCAL_RELATIVE_API && process.env.NODE_ENV === "production") {
    return PRODUCTION_RAILWAY_API;
  }

  return base;
}

/** Socket.io origin — no /api suffix */
export function getSocketBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (raw) return stripTrailingSlash(raw);

  const api = getApiBaseUrl();
  if (api.endsWith("/api")) return api.slice(0, -4);
  return process.env.NODE_ENV === "production"
    ? "https://xoxo-production-2503.up.railway.app"
    : "http://localhost:5000";
}

/** Debug helper — resolved URLs at runtime (client) or build time (SSR) */
export function getApiDebugInfo() {
  return {
    apiBaseUrl: getApiBaseUrl(),
    socketBaseUrl: getSocketBaseUrl(),
    envRaw: process.env.NEXT_PUBLIC_API_URL ?? "(unset)",
    nodeEnv: process.env.NODE_ENV,
    isRelativeApi: getApiBaseUrl() === LOCAL_RELATIVE_API,
  };
}

/** Full URL for an API path segment (e.g. "/packages" → absolute URL) */
export function resolveApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const segment = path.startsWith("/") ? path : `/${path}`;
  if (base.startsWith("http")) return `${base}${segment}`;
  if (typeof window !== "undefined") return `${window.location.origin}${base}${segment}`;
  return `${base}${segment}`;
}

if (typeof window !== "undefined") {
  const info = getApiDebugInfo();
  console.info("[XOXO API] Resolved configuration:", info);
  console.info("[XOXO API] Example endpoints:", {
    packages: resolveApiUrl("/packages"),
    packagesTrending: resolveApiUrl("/packages/trending"),
    destinations: resolveApiUrl("/destinations"),
  });
}
