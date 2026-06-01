// txn-utils.js — pure transaction-row generators (no data dependencies). Used both by the
// mock data (inline charge rows) and by the domain layer (synthesized per-case/per-year rows).

/**
 * Synthesize a charge's transactions for a given balance and year (opening + annual + payment).
 * @param {number} balance  closing balance the rows should sum to
 * @param {number} [year]   fiscal year for the row dates
 * @returns {import('./types.js').TxnRow[]}
 */
export function synthRows(balance, year = 2026) {
  if (balance <= 0) return [{ date: `01/01/${year}`, type: 8, ref: "—", dc: "ח", nominal: 0, addon: 0, bal: 0 }];
  const open = Math.round(balance * 0.55), annual = Math.round(balance * 1.55), paid = annual - balance;
  return [
    { date: `01/01/${year}`, type: 8,  ref: "יתרת פתיחה", dc: "ח", nominal: open,         addon: 0, bal: open },
    { date: `01/01/${year}`, type: 1,  ref: "חיוב שנתי",  dc: "ח", nominal: annual - open, addon: 0, bal: annual },
    { date: `15/03/${year}`, type: 100, ref: "BANK",      dc: "ז", nominal: paid,          addon: 0, bal: balance },
  ];
}

/**
 * A fully-settled charge: yearly charge debited then paid in full, ending at 0. Gives
 * closed/settled years real (balanced) transaction history instead of an empty row.
 * @param {number} charge  the yearly charge amount (debited then paid)
 * @param {number} year    fiscal year for the row dates
 * @returns {import('./types.js').TxnRow[]}
 */
export function paidRows(charge, year) {
  if (charge <= 0) return synthRows(0, year);
  return [
    { date: `01/01/${year}`, type: 1,   ref: "חיוב שנתי", dc: "ח", nominal: charge, addon: 0, bal: charge },
    { date: `20/06/${year}`, type: 100, ref: "BANK",      dc: "ז", nominal: charge, addon: 0, bal: 0 },
  ];
}
