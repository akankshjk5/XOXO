/** Client-side phone validation — matches backend rules (10–15 digits). */

export function phoneDigits(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

export function isValidPhoneNumber(value: string): boolean {
  const digits = phoneDigits(value);
  return digits.length >= 10 && digits.length <= 15;
}

export function formatPhoneHint(): string {
  return "+91 98765 43210";
}
