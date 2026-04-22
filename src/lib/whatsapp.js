// wa.me deep link builder. No API, works on mobile + desktop WhatsApp Web.

/**
 * Normalize a phone number to E.164 digits only (wa.me expects no + or spaces).
 * Accepts "+91 98765 43210", "91-98765-43210", "98765 43210" (assumes IN if no cc).
 */
export function normalizeNumber(input, defaultCountryCode = "91") {
  if (!input) return "";
  let digits = String(input).replace(/\D+/g, "");
  if (!digits) return "";
  // If number is short (no country code), prepend default
  if (digits.length <= 10) digits = defaultCountryCode + digits;
  return digits;
}

/**
 * Build a wa.me URL with pre-filled text.
 */
export function waLink(rawNumber, text = "") {
  const num = normalizeNumber(rawNumber);
  if (!num) return "";
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${num}${encoded ? `?text=${encoded}` : ""}`;
}

/**
 * Open WhatsApp with the given number + text. Uses window.open so it works
 * from a button click (user gesture required by mobile browsers).
 */
export function openWhatsApp(rawNumber, text = "") {
  const url = waLink(rawNumber, text);
  if (!url) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
