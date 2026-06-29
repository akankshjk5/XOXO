/**
 * Normalize and validate phone numbers (international-friendly).
 * Stores E.164-ish compact form: optional + prefix, digits only otherwise collapsed.
 */

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Normalize for storage — keeps leading + when present, strips spaces/dashes. */
function normalizePhone(value) {
  if (value == null || value === "") return "";
  const raw = String(value).trim();
  const digits = digitsOnly(raw);
  if (!digits) return "";
  if (raw.startsWith("+")) return `+${digits}`;
  return digits;
}

function validatePhone(value) {
  const digits = digitsOnly(value);
  return digits.length >= 10 && digits.length <= 15;
}

/** Loose pattern for MongoDB search (digits from query). */
function phoneSearchPattern(query) {
  const digits = digitsOnly(query);
  if (digits.length < 3) return null;
  return digits;
}

module.exports = { normalizePhone, validatePhone, digitsOnly, phoneSearchPattern };
