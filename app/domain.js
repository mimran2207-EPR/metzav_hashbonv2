// domain.js — derivation logic over the mock data: build the drill-down account data for
// an open case (a payer, a holder's view, or a closed year). Pure functions; the only
// public entry point is buildCaseData. Swapping mock-data.js for a real API leaves this intact.
import { synthRows, paidRows } from './txn-utils.js';
import { PAYER, SUBJECTS, SUBJECT_DETAILS, YEAR_BALANCES, CURRENT_YEAR } from './mock-data.js';

// buildYearData — the demo payer's account for a single past (closed) year, synthesized from
// that year's closing balance: same subject, with that year's charges and transactions.
/**
 * @param {number} year
 * @returns {import('./types.js').CaseData}
 */
function buildYearData(year) {
  const B = YEAR_BALANCES[year] || 0;
  const settled = B === 0;            // a closed year with no debt still has paid history
  const arn = settled ? 3200 : Math.round(B * 0.72);
  const shm = settled ? 640 : B - arn;
  const rows = (amt) => settled ? paidRows(amt, year) : synthRows(amt, year);
  const holders = [{ name: PAYER.name, payerNo: PAYER.payerNo, balance: B, from: "10/2019", to: null, current: true, reason: "רכישה" }];
  const subItems = [{
    id: `arn-${year}`, name: "דירת מגורים", meta: "רחוב הדוגמה 1, דירה 1",
    propertyTypes: [{ code: "100", desc: "בית מגורים", area: 90, unit: 'מ"ר' }], holders,
    charges: [
      { id: `arn-${year}-a`, code: 1, name: "ארנונה",      srcYear: year, settled, discount: null, arrangement: null, tracking: false, rows: rows(arn) },
      { id: `arn-${year}-s`, code: 2, name: "אגרת שמירה", srcYear: year, settled, discount: null, arrangement: null, tracking: false, rows: rows(shm) },
    ],
  }];
  return {
    subjects: [{ id: "arnona", code: 3, name: "ארנונה", icon: "building", count: subItems.length, unit: "נכסים", balance: B }],
    details: { arnona: { subItems } },
  };
}

/**
 * Build the drill-down data for an open case. The demo payer returns the authored data
 * (year-aware); a holder opened from a real property returns that exact property; every
 * other case is synthesized from its balance.
 * @param {import('./types.js').Case|null|undefined} c
 * @param {number} [year]
 * @returns {import('./types.js').CaseData}
 */
export function buildCaseData(c, year) {
  if (!c || c.id === PAYER.payerNo) {
    // demo payer is year-aware: the open year shows the authored data; closed years are synthesized
    return (year != null && year !== CURRENT_YEAR) ? buildYearData(year) : { subjects: SUBJECTS, details: SUBJECT_DETAILS };
  }
  // opened from a real property's holder chain → show that exact property (same id/name/data/chain),
  // so switching between its holders never fabricates a new property or a second current holder.
  if (c.realSubItem && c.realSubject) {
    const subItems = [c.realSubItem, ...(c.extraSubItems || [])];
    return { subjects: [{ ...c.realSubject, count: subItems.length }], details: { [c.realSubject.id]: { subItems } } };
  }
  const B = c.balance, idNum = (c.id.replace(/\D/g, "") || "1");
  const holders = [{ name: c.name, payerNo: c.id, from: "01/2020", to: null, current: true, reason: "רכישה" }];
  const isBiz = (c.tags || []).includes("עסק");
  const p1 = B > 0 && isBiz ? Math.round(B * 0.6) : B, p2 = B - p1;
  const subItems = [{
    id: idNum, name: isBiz ? "נכס מסחרי ראשי" : "דירת מגורים", meta: "כתובת התיק",
    propertyTypes: [{ code: "100", desc: isBiz ? "מבנה מסחרי" : "בית מגורים", area: 90, unit: 'מ"ר' }], holders,
    charges: [
      { id: idNum + "-arn", code: 1, name: "ארנונה",      srcYear: 2026, discount: null, arrangement: c.status === "arrangement" ? 100 : null, tracking: false, rows: synthRows(Math.round(p1 * 0.72)) },
      { id: idNum + "-shm", code: 2, name: "אגרת שמירה", srcYear: 2026, discount: null, arrangement: null, tracking: false, rows: synthRows(p1 - Math.round(p1 * 0.72)) },
    ],
  }];
  if (p2 > 0) subItems.push({
    id: String(Number(idNum) + 1), name: "נכס נוסף", meta: "נכס משני", propertyTypes: [{ code: "190", desc: "מחסן/אחסנה", area: 35, unit: 'מ"ר' }], holders,
    charges: [{ id: idNum + "-b", code: 1, name: "ארנונה", srcYear: 2026, discount: null, arrangement: null, tracking: false, rows: synthRows(p2) }],
  });
  return {
    subjects: [{ id: "arnona", code: 3, name: "ארנונה", icon: "building", count: subItems.length, unit: "נכסים", balance: B }],
    details: { arnona: { subItems } },
  };
}
