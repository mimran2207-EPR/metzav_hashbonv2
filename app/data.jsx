// data.jsx — public data API (barrel). The concerns are split across:
//   • mock-data.js  — static mock data (payers, subjects, charges, transactions, years…)
//   • domain.js     — derivation logic (buildCaseData and friends)
//   • txn-utils.js  — pure transaction-row generators
// Consumers keep importing from './data.jsx'; to wire a real backend, swap mock-data.js.
export * from './mock-data.js';
export * from './domain.js';
