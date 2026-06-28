/**
 * Central API URL resolution for browser + server.
 * NEXT_PUBLIC_* vars are inlined at build time on Vercel.
 */

const LOCAL_API = "/api";
const LOCAL_SOCKET = "";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Normalize API base — must end with /api */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[XOXO API] NEXT_PUBLIC_API_URL is empty — defaulting to same-origin /api"
      );
    }
    return LOCAL_API;
  }

  let base = stripTrailingSlash(raw);
  if (!base.endsWith("/api")) {
    base = `${base}/api`;
  }
  return base;
}

/** Socket.io origin — no /api suffix */
export function getSocketBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (raw) return stripTrailingSlash(raw);

  const api = getApiBaseUrl();
  if (api.endsWith("/api")) return api.slice(0, -4);
  return LOCAL_SOCKET;
}

/** Debug helper — resolved URLs at runtime (client) or build time (SSR) */
export function getApiDebugInfo() {
  return {
    apiBaseUrl: getApiBaseUrl(),
    socketBaseUrl: getSocketBaseUrl(),
    envRaw: process.env.NEXT_PUBLIC_API_URL ?? "(unset)",
    nodeEnv: process.env.NODE_ENV,
  };
}

if (typeof window !== "undefined") {
  const info = getApiDebugInfo();
  console.info("[XOXO API] Resolved configuration:", info);
}
