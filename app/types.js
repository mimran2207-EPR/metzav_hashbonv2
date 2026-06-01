// types.js — central JSDoc type definitions for the "מצב חשבון" domain model.
//
// Pure documentation: this module has no runtime code and is never imported at runtime,
// only referenced from JSDoc via `import('./types.js').TypeName`. It gives the editor
// (and `tsc`/jsconfig) explicit contracts for the shapes that flow through the app —
// holders, charges, properties, cases and the per-year model — without any build change.

/**
 * A single ledger transaction row (חיוב / זיכוי).
 * @typedef {Object} TxnRow
 * @property {string} date       value date, "DD/MM/YYYY"
 * @property {number} type       transaction-type code (see TXN_TYPES)
 * @property {string} ref        reference / description
 * @property {"ח"|"ז"} dc        debit (חובה) | credit (זכות)
 * @property {number} nominal    principal amount
 * @property {number} addon      indexation/interest add-on
 * @property {number} bal        running balance after this row
 */

/**
 * A property sub-type line (e.g. בית מגורים / מחסן).
 * @typedef {Object} PropertyType
 * @property {string} code
 * @property {string} desc
 * @property {number|null} area
 * @property {string} unit
 */

/**
 * One holder in a property's holder chain. Exactly one holder per property is `current`.
 * @typedef {Object} Holder
 * @property {string} name
 * @property {string} payerNo
 * @property {number} [balance]    the holder's own balance on this property
 * @property {string} from         tenure start, "MM/YYYY"
 * @property {string|null} to      tenure end, "MM/YYYY" or null while current
 * @property {boolean} [current]   true for the present holder
 * @property {string} [reason]     reason for the transition (רכישה / מכירה / ירושה …)
 */

/**
 * A charge type on a property (סוג חיוב). Its rows come from inline `rows`,
 * a `txns` key into TXNS, or a flat `balance` when there are no transactions.
 * @typedef {Object} Charge
 * @property {string} id
 * @property {number} code
 * @property {string} name
 * @property {number} [srcYear]
 * @property {boolean} [settled]
 * @property {number|null} [discount]
 * @property {string|null} [discountDesc]
 * @property {number|null} [arrangement]
 * @property {string} [arrangementDesc]
 * @property {boolean} [tracking]
 * @property {string} [txns]        key into TXNS
 * @property {TxnRow[]} [rows]      inline transactions
 * @property {number} [balance]     flat balance when there are no rows/txns
 */

/**
 * A property / entity under a subject (פיזי).
 * @typedef {Object} SubItem
 * @property {string} id
 * @property {string} name
 * @property {string} [meta]
 * @property {PropertyType[]} [propertyTypes]
 * @property {Holder[]} [holders]
 * @property {Charge[]} charges
 */

/**
 * A subject ("נושא": ארנונה, מים וביוב, חינוך …).
 * @typedef {Object} Subject
 * @property {string} id
 * @property {number} code
 * @property {string} name
 * @property {string} icon
 * @property {number} count
 * @property {string} unit
 * @property {number} balance
 */

/**
 * Drill-down tree: subject-id → its sub-items.
 * @typedef {Object.<string, { subItems: SubItem[] }>} SubjectDetailsMap
 */

/**
 * The data backing a single account view (a payer, a holder, or a closed year).
 * @typedef {Object} CaseData
 * @property {Subject[]} subjects
 * @property {SubjectDetailsMap} details
 */

/**
 * An open account/case. The demo payer + WORKLIST cases are the base shape; a holder
 * opened from a property may carry the real property it was opened from.
 * @typedef {Object} Case
 * @property {string} id              payer number
 * @property {string} name
 * @property {number} balance
 * @property {string} status          key into STATUS
 * @property {string} [priority]
 * @property {Object} [nba]           next-best-action {label, flow}
 * @property {string[]} [tags]
 * @property {Subject} [realSubject]      carried when opening a non-demo holder
 * @property {SubItem} [realSubItem]      the exact property opened, shown as-is
 * @property {SubItem[]} [extraSubItems]  extra demo properties for that holder
 */

/**
 * A flattened level-1 row built from a subject's sub-items (see buildEntityRows).
 * @typedef {Object} EntityRow
 * @property {string} id
 * @property {string} name
 * @property {string} meta
 * @property {Subject} subject
 * @property {Charge[]} charges
 * @property {Holder[]} holders
 * @property {PropertyType[]} propertyTypes
 * @property {SubItem} subItem
 */

/**
 * Per fiscal-year figures.
 * @typedef {Object} YearInfo
 * @property {number} principal    קרן (original)
 * @property {number} balance      updated balance incl. interest+indexation
 * @property {string} status       key into YEAR_STATUS
 */

/**
 * Money breakdown shown on the balance card.
 * @typedef {Object} Totals
 * @property {number} nominal
 * @property {number} indexation
 * @property {number} interest
 * @property {number} balance
 */

export {};
