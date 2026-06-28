export type AnalyticsEventType = "view" | "click" | "wishlist" | "share" | "booking" | "newsletter" | "contact";

const SESSION_KEY = "xoxo_analytics_session";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function trackEvent(
  event: AnalyticsEventType,
  opts?: {
    entityType?: string;
    entityId?: string;
    meta?: Record<string, unknown>;
  }
) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    entityType: opts?.entityType,
    entityId: opts?.entityId,
    meta: opts?.meta,
    sessionId: getSessionId(),
    device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
  };

  import("@/lib/api").then(({ analyticsAPI }) => {
    analyticsAPI.track(payload).catch(() => {});
  });
}
