/** Client-side phone validation — Indian 10-digit or international (+country code). */

export function phoneDigits(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

const PHONE_REQUIRED_MSG =
  "Please enter a valid mobile number so our travel expert can contact you.";

function isValidIndianLocal(digits: string): boolean {
  return /^[6-9]\d{9}$/.test(digits);
}

/** Returns an error message, or null when valid. */
export function getPhoneValidationError(value: string): string | null {
  const trimmed = String(value || "").trim();
  if (!trimmed) return PHONE_REQUIRED_MSG;

  const digits = phoneDigits(trimmed);

  if (trimmed.startsWith("+")) {
    if (digits.length < 10 || digits.length > 15) return PHONE_REQUIRED_MSG;
    return null;
  }

  if (digits.length === 10) {
    return isValidIndianLocal(digits) ? null : "Please enter a valid 10-digit Indian mobile number.";
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return isValidIndianLocal(digits.slice(2))
      ? null
      : "Please enter a valid 10-digit Indian mobile number.";
  }

  if (digits.length > 10 && digits.length <= 15) return null;

  return PHONE_REQUIRED_MSG;
}

export function isValidPhoneNumber(value: string): boolean {
  return getPhoneValidationError(value) === null;
}

export function formatPhoneHint(): string {
  return "+91 98765 43210";
}
