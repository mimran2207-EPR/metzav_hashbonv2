// entity-helpers.js — pure helpers for the entities drill-down: resolve a charge's rows
// and balance, and flatten subjects into level-1 entity rows.
import { TXNS, SUBJECT_DETAILS } from './data.jsx';

const UNIT_SINGULAR = { "נכסים": "נכס", "מדי מים": "מד מים", "ילדים": "ילד/ה", "דוחות": "דוח", "שלט": "שלט", "רישומים": "רישום", "תיק": "תיק", "היתר": "היתר" };

/**
 * Resolve a charge's transaction rows: inline `rows`, else a `txns` key into TXNS, else none.
 * @param {import('./types.js').Charge} charge
 * @returns {import('./types.js').TxnRow[]}
 */
export function chargeRows(charge) {
  if (charge.rows) return charge.rows;
  if (charge.txns && TXNS[charge.txns]) return TXNS[charge.txns];
  return [];
}

/**
 * A charge's outstanding balance — the last row's running balance, or the flat `balance`.
 * @param {import('./types.js').Charge} charge
 * @returns {number}
 */
export function chargeBalance(charge) {
  const r = chargeRows(charge);
  if (r.length) return r[r.length - 1].bal;
  return charge.balance || 0;
}

// buildEntityRows — flatten all subjects into a list of entity objects (level 1 rows).
// detailsMap defaults to the demo payer's SUBJECT_DETAILS; per-case data passes its own.
/**
 * @param {import('./types.js').Subject[]} subjects
 * @param {import('./types.js').Subject|null} filterSubject
 * @param {import('./types.js').SubjectDetailsMap} [detailsMap]
 * @returns {import('./types.js').EntityRow[]}
 */
export function buildEntityRows(subjects, filterSubject, detailsMap = SUBJECT_DETAILS) {
  const result = [];
  const list = filterSubject ? [filterSubject] : subjects;
  list.forEach(subj => {
    const authored = detailsMap[subj.id];
    if (authored) {
      authored.subItems.forEach(si => result.push({
        id: si.id, name: si.name, meta: si.meta || "", subject: subj,
        charges: si.charges, holders: si.holders || [],
        propertyTypes: si.propertyTypes || [], subItem: si,
      }));
    } else {
      const sing = UNIT_SINGULAR[subj.unit] || subj.unit || "פריט";
      Array.from({ length: subj.count }, (_, i) => {
        const id = `${subj.id}-${i + 1}`;
        const ch = { id: `${id}-c`, name: subj.name, balance: 0 };
        const si = { id, name: `${sing} ${i + 1}`, meta: subj.name, charges: [ch] };
        result.push({ id, name: si.name, meta: subj.name, subject: subj, charges: [ch], holders: [], propertyTypes: [], subItem: si });
      });
    }
  });
  return result;
}
