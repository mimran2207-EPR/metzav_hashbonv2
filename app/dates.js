// dates.js — single source of truth for DD/MM/YYYY date handling.
// Replaces the ad-hoc parsing/comparison scattered across the app (which
// included a real bug: lexicographic string comparison of "DD/MM/YYYY").

const pad = (n) => String(n).padStart(2, "0");

export function parseDMY(s) {
  const [d, m, y] = String(s).split("/").map(Number);
  return new Date(y, m - 1, d);
}

export function fmtDMY(dt) {
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

// chronological comparator (negative = a before b)
export const cmpDate = (a, b) => parseDMY(a) - parseDMY(b);

// numeric key for sorting (YYYYMMDD)
export const dateKey = (s) => { const [d, m, y] = String(s).split("/").map(Number); return y * 1e4 + m * 1e2 + d; };

// demo "now" — a single anchor instead of literals sprinkled in filters
export const TODAY = new Date(2026, 5, 2); // 02/06/2026

export const isOnOrBefore = (s, ref = TODAY) => parseDMY(s) <= ref;

export function minusDays(s, n) {
  const dt = parseDMY(s);
  dt.setDate(dt.getDate() - n);
  return fmtDMY(dt);
}
