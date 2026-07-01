const STORAGE_KEY = "xoxo_safety_disclaimer_dismissed";

export function isSafetyDisclaimerDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function dismissSafetyDisclaimer(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, "1");
}

export const SAFETY_DISCLAIMER_TEXT =
  "Never share your personal information with strangers. XOXO Travels may suspend suspicious accounts and is not responsible for negligence during personal interactions.";
