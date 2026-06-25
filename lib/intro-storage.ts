const INTRO_KEY = "xoxo_intro_seen";
const INTRO_DISABLED_KEY = "xoxo_intro_disabled";
const REDUCE_ANIMATIONS_KEY = "xoxo_reduce_animations";
const REPLAY_KEY = "xoxo_intro_replay";

/** Re-show cinematic intro after this many days (when not disabled) */
export const INTRO_EXPIRY_DAYS = 30;

export function isIntroDisabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(INTRO_DISABLED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setIntroDisabled(disabled: boolean): void {
  try {
    if (disabled) localStorage.setItem(INTRO_DISABLED_KEY, "1");
    else localStorage.removeItem(INTRO_DISABLED_KEY);
  } catch {
    /* private browsing */
  }
}

export function getReduceAnimationsPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(REDUCE_ANIMATIONS_KEY) === "1";
  } catch {
    return false;
  }
}

export function setReduceAnimationsPreference(reduced: boolean): void {
  try {
    if (reduced) localStorage.setItem(REDUCE_ANIMATIONS_KEY, "1");
    else localStorage.removeItem(REDUCE_ANIMATIONS_KEY);
  } catch {
    /* private browsing */
  }
}

export function requestIntroReplay(): void {
  try {
    sessionStorage.setItem(REPLAY_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function consumeIntroReplay(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = sessionStorage.getItem(REPLAY_KEY);
    if (v) {
      sessionStorage.removeItem(REPLAY_KEY);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function shouldShowIntro(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (getReduceAnimationsPreference()) return false;
  if (isIntroDisabled()) return false;
  if (consumeIntroReplay()) return true;

  try {
    const raw = localStorage.getItem(INTRO_KEY);
    if (!raw) return true;
    const { ts } = JSON.parse(raw) as { ts: number };
    const days = (Date.now() - ts) / (1000 * 60 * 60 * 24);
    return days >= INTRO_EXPIRY_DAYS;
  } catch {
    return true;
  }
}

export function markIntroSeen(): void {
  try {
    localStorage.setItem(INTRO_KEY, JSON.stringify({ ts: Date.now() }));
  } catch {
    /* private browsing */
  }
}

export function clearIntroSeen(): void {
  try {
    localStorage.removeItem(INTRO_KEY);
  } catch {
    /* ignore */
  }
}
