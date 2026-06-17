// Singapore-time (UTC+8) date helpers. Pure, no DOM.
// We never rely on the browser's timezone or toLocaleString TZ names; we shift
// the epoch by +8h and read the UTC fields, which is robust across all engines.

const SGT_OFFSET_MS = 8 * 3600 * 1000;

// Returns the current Singapore calendar date as "YYYY-MM-DD".
export function sgtDateString(now = Date.now()) {
  return new Date(now + SGT_OFFSET_MS).toISOString().slice(0, 10);
}

// Human-friendly timestamp in SGT, e.g. "17 Jun 2026, 14:35".
export function sgtTimestamp(now = Date.now()) {
  const d = new Date(now + SGT_OFFSET_MS);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getUTCDate())} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}, ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

// Milliseconds remaining until the next SGT midnight (for "refreshes in" displays).
export function msUntilSgtMidnight(now = Date.now()) {
  const shifted = now + SGT_OFFSET_MS;
  const dayMs = 24 * 3600 * 1000;
  return dayMs - (shifted % dayMs);
}
