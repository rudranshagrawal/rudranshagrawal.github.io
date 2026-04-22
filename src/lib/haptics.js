// Thin wrapper around Web Vibration API. iOS Safari supports Vibration
// inconsistently — it works when triggered from a user gesture in PWA mode
// but is silently ignored otherwise. Android Chrome supports it fully.
// We degrade silently on unsupported platforms.

function canVibrate() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function tap() {
  if (canVibrate()) navigator.vibrate(10);
}

export function bump() {
  if (canVibrate()) navigator.vibrate(25);
}

export function success() {
  if (canVibrate()) navigator.vibrate([30, 40, 30]);
}

export function doubleBump() {
  if (canVibrate()) navigator.vibrate([40, 60, 40]);
}
