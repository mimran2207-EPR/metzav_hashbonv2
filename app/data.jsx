// data.jsx — mock account-status data (demo only — all personal details are fictional)
import { minusDays } from './dates.js';

const PAYER = {
  name: "ישראל לדוגמה",
  payerNo: "999-DEMO",
  taz: "000000000",
  type: "משלם פרטי",
  address: "רחוב הדוגמה 1, דירה 1",
  city: "עיר הדוגמה",
  zip: "00000",
  phone: "000-000-0000",
  email: "demo@example.com",
  council: "מועצה אזורית שדות נגב",
  since: "2008",
  status: "פעיל",
};

const ENTITIES = [
  { id: "5002205", subject: 3,  subjectName: "נכס", title: "דירת מגורים", sub: "רחוב הדוגמה 1, דירה 1", balance: 11268, services: 3 },
  { id: "13-88142", subject: 13, subjectName: "מים שוטף", title: "מד מים 2\"", sub: "צריכה רבעונית", balance: 1386, services: 1 },
  { id: "15-2204",  subject: 15, subjectName: "שלטים", title: "שילוט עסק", sub: "רחוב הדוגמה 1", balance: 0, services: 1 },
];

const SERVICES = [
  { id: "arnona",  name: "ארנונה", subject: "arnona", entity: "5002205", nominal: 8420, indexation: 612, interest: 1340, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 9 },
  { id: "water",   name: "מים וביוב", subject: "water", entity: "13-88142", nominal: 1180, indexation: 64, interest: 142, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 6 },
  { id: "shmira",  name: "אגרת שמירה", subject: "arnona", entity: "5002205", nominal: 540, indexation: 22, interest: 38, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 4 },
  { id: "sewage",  name: "אגרת ביוב", subject: "arnona", entity: "5002205", nominal: 760, indexation: 40, interest: 96, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 5 },
  { id: "collect", name: "הוצ' גבייה (מילגם חדש)", subject: "arnona", entity: "5002205", nominal: 320, indexation: 0, interest: 0, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 2 },
];

// SUBJECTS — the payer's subjects ("נושאים"). Each has an icon and a count whose
// UNIT changes per subject type: properties / children / reports / signs …
// `id` matches SERVICES.subject so selecting a subject filters the balances table.
function subjectBalance(id) { return SERVICES.filter(s => s.subject === id).reduce((a, s) => a + s.balance, 0); }
const SUBJECTS = [
  { id: "arnona",      code:  3, name: "ארנונה",   icon: "building",    count: 3, unit: "נכסים",   get balance(){ return subjectBalance("arnona"); } },
  { id: "water",       code: 13, name: "מים וביוב", icon: "droplet",     count: 2, unit: "מדי מים", get balance(){ return subjectBalance("water"); } },
  { id: "education",   code:  4, name: "חינוך",     icon: "education",   count: 2, unit: "ילדים",   balance: 0 },
  { id: "parking",     code:  5, name: "חניה",      icon: "parking",     count: 5, unit: "דוחות",   balance: 740 },
  { id: "signage",     code: 15, name: "שילוט",     icon: "signage",     count: 1, unit: "שלט",     balance: 0 },
  { id: "clubs",       code:  6, name: "חוגים",     icon: "clubs",       count: 3, unit: "רישומים", balance: 180 },
  { id: "welfare",     code:  7, name: "רווחה",     icon: "welfare",     count: 1, unit: "תיק",     balance: 0 },
  { id: "engineering", code:  8, name: "הנדסה",     icon: "engineering", count: 1, unit: "היתר",    balance: 0 },
  { id: "supervision", code:  9, name: "פיקוח",     icon: "supervision", count: 1, unit: "תיק",     balance: 0 },
];

// SUBJECT_DETAILS — drill-down tree:  subject → subItems (תתי-נושאים)
//   → charges (סוגי חיוב) → txns (מצב חשבון). A charge with a `txns` key
//   resolves to TXNS[key]; otherwise it carries a flat `balance`.
//   Subjects not listed here auto-generate sub-items from their count/unit.
const SUBJECT_DETAILS = {
  arnona: { subItems: [
    { id: "5002205", name: "דירת מגורים", meta: "רחוב הדוגמה 1, דירה 1",
      propertyTypes: [
        { code: "100", desc: "בית מגורים",    area: 85,  unit: 'מ"ר' },
        { code: "150", desc: "חניה פרטית",    area: 12,  unit: 'מ"ר' },
        { code: "190", desc: "מחסן בניין",    area: 8,   unit: 'מ"ר' },
      ],
      holders: [
        { name: "ישראל לדוגמה", payerNo: "999-DEMO", from: "10/2019", to: null, current: true, reason: "רכישה" },
        { name: "לדוגמה רחל", payerNo: "888-DEMO-2", from: "03/2014", to: "10/2019", reason: "מכירה" },
        { name: "ישראל לדוגמה (קודם)", payerNo: "888-DEMO-1", from: "08/2008", to: "03/2014", reason: "ירושה" },
      ],
      charges: [
        { id: "arnona",  code:  1, name: "ארנונה",            txns: "arnona",  srcYear: 2026, discount: 15, discountDesc: "ועדת הנחות", arrangement: null, tracking: false },
        { id: "shmira",  code:  2, name: "אגרת שמירה",        txns: "shmira",  srcYear: 2026, discount: null, discountDesc: null, arrangement: null, tracking: false },
        { id: "sewage",  code:  3, name: "אגרת ביוב",         txns: "sewage",  srcYear: 2026, discount: null, discountDesc: null, arrangement: null, tracking: false },
        { id: "collect", code: 16, name: "הוצ' גבייה (מילגם)", txns: "collect", srcYear: 2026, discount: null, discountDesc: null, arrangement: null, tracking: true },
      ] },
    { id: "5002206", name: "מחסן", meta: "רחוב הדוגמה 1",
      propertyTypes: [
        { code: "190", desc: "מחסן / אחסנה",  area: 18,  unit: 'מ"ר' },
      ],
      holders: [
        { name: "ישראל לדוגמה", payerNo: "999-DEMO", from: "10/2019", to: null, current: true, reason: "רכישה" },
        { name: "כהן דוד", payerNo: "028841200", from: "05/2011", to: "10/2019", reason: "מכירה" },
      ],
      charges: [
        { id: "arnona_b", code: 1, name: "ארנונה", balance: 0, srcYear: 2026, discount: null, arrangement: null, tracking: false },
      ] },
    { id: "5002207", name: "חניה צמודה", meta: "רחוב הדוגמה 1",
      propertyTypes: [
        { code: "150", desc: "חניה פרטית",    area: 14,  unit: 'מ"ר' },
      ],
      holders: [
        { name: "ישראל לדוגמה", payerNo: "999-DEMO", from: "10/2019", to: null, current: true, reason: "צמוד לדירה" },
      ],
      charges: [
        { id: "arnona_c", code: 1, name: "ארנונה", balance: 0, srcYear: 2026, discount: null, arrangement: null, tracking: false },
      ] },
  ] },
  water: { subItems: [
    { id: "13-88142", name: 'מד מים 2"', meta: "צריכה רבעונית",
      propertyTypes: [
        { code: "W02", desc: 'מד מים 2"',     area: null, unit: "יח'" },
      ],
      holders: [
        { name: "ישראל לדוגמה", payerNo: "999-DEMO", from: "10/2019", to: null, current: true, reason: "החלפת מחזיק" },
        { name: "לדוגמה רחל", payerNo: "888-DEMO-2", from: "03/2014", to: "10/2019", reason: "החלפת מחזיק" },
      ],
      charges: [
        { id: "water", code: 4, name: "מים וביוב", txns: "water", srcYear: 2026, discount: null, arrangement: 30, arrangementDesc: "פריסה 6 תשלומים", tracking: false },
      ] },
    { id: "13-88143", name: "מד מים — גינה", meta: "גינון / השקיה",
      propertyTypes: [
        { code: "W01", desc: "מד מים גינה",   area: null, unit: "יח'" },
      ],
      holders: [
        { name: "ישראל לדוגמה", payerNo: "999-DEMO", from: "10/2019", to: null, current: true, reason: "התקנה" },
      ],
      charges: [
        { id: "water_b", code: 4, name: "מים — גינון", balance: 0, srcYear: 2026, discount: null, arrangement: null, tracking: false },
      ] },
  ] },
};

function sumServices(field) { return SERVICES.reduce((a, s) => a + (field === "balance" ? s.balance : s[field]), 0); }
const TOTALS = {
  nominal: sumServices("nominal"),
  indexation: sumServices("indexation"),
  interest: sumServices("interest"),
  get balance() { return this.nominal + this.indexation + this.interest; },
};

const TXN_TYPES = {
  8:   "יתרה עוברת",
  1:   "תק. ארנונה",
  100: "העברה בנקאית",
  12:  "תשלום במזומן",
  31:  "הצמדה וריבית",
  44:  "זיכוי הנחה",
  17:  "חיוב מים",
};

const TXNS = {
  arnona: [
    { date: "01/01/2026", type: 8,   ref: "—",        dc: "ח", nominal: 7980, addon: 0,    bal: 7980 },
    { date: "01/01/2026", type: 1,   ref: "חיוב שנתי", dc: "ח", nominal: 8420, addon: 0,    bal: 16400 },
    { date: "12/02/2026", type: 44,  ref: "ועדת הנחות",dc: "ז", nominal: 1260, addon: 0,    bal: 15140 },
    { date: "28/02/2026", type: 100, ref: "BANK-7741", dc: "ז", nominal: 4000, addon: 0,    bal: 11140 },
    { date: "31/03/2026", type: 12,  ref: "קבלה 90412",dc: "ז", nominal: 2000, addon: 0,    bal: 9140 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,    addon: 612,  bal: 9752 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,    addon: 1340, bal: 11092 },
    { date: "15/05/2026", type: 12,  ref: "קבלה 90855",dc: "ז", nominal: 1100, addon: 0,    bal: 9992 },
    { date: "28/05/2026", type: 1,   ref: "יתרת קרן",  dc: "ח", nominal: 1376, addon: 0,    bal: 11368 },
  ],
  water: [
    { date: "01/01/2026", type: 8,   ref: "—",        dc: "ח", nominal: 980,  addon: 0,   bal: 980 },
    { date: "20/02/2026", type: 17,  ref: "רבעון 1",   dc: "ח", nominal: 410,  addon: 0,   bal: 1390 },
    { date: "15/03/2026", type: 100, ref: "BANK-8120", dc: "ז", nominal: 600,  addon: 0,   bal: 790 },
    { date: "20/04/2026", type: 17,  ref: "רבעון 2",   dc: "ח", nominal: 390,  addon: 0,   bal: 1180 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,    addon: 64,  bal: 1244 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,    addon: 142, bal: 1386 },
  ],
  shmira: [
    { date: "01/01/2026", type: 8,  ref: "—",        dc: "ח", nominal: 180, addon: 0,  bal: 180 },
    { date: "01/01/2026", type: 1,  ref: "אגרה שנתית",dc: "ח", nominal: 360, addon: 0,  bal: 540 },
    { date: "30/04/2026", type: 31, ref: "חישוב מע'", dc: "ח", nominal: 0,   addon: 22, bal: 562 },
    { date: "30/04/2026", type: 31, ref: "חישוב מע'", dc: "ח", nominal: 0,   addon: 38, bal: 600 },
  ],
  sewage: [
    { date: "01/01/2026", type: 8,   ref: "—",        dc: "ח", nominal: 360, addon: 0,  bal: 360 },
    { date: "01/01/2026", type: 1,   ref: "אגרה שנתית",dc: "ח", nominal: 600, addon: 0,  bal: 960 },
    { date: "10/03/2026", type: 100, ref: "BANK-8330", dc: "ז", nominal: 200, addon: 0,  bal: 760 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,   addon: 40, bal: 800 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,   addon: 96, bal: 896 },
  ],
  collect: [
    { date: "12/02/2026", type: 1,  ref: "מילגם חדש", dc: "ח", nominal: 200, addon: 0, bal: 200 },
    { date: "28/05/2026", type: 1,  ref: "מילגם חדש", dc: "ח", nominal: 120, addon: 0, bal: 320 },
  ],
};

// ── Wide "תנועות למשלם" ledger ───────────────────────────────────────────────
// A flat, payer-level ledger built from TXNS, enriched with the full column set
// from the legacy MASTER screen + field dictionary (חוברת1.xlsx):
// נכס · סוג חיוב · ת.ערך · ת.פעולה · ת.גביה · פרטים · ז/ח · זכות · חובה · ית.מצטברת · מ.גב · בוצע ע"י · מס' פקודה.
const CHARGE_META = {
  arnona:  { naxas: "5002205", sug: "ארנונה" },
  shmira:  { naxas: "5002205", sug: "אגרת שמירה" },
  sewage:  { naxas: "5002205", sug: "אגרת ביוב" },
  collect: { naxas: "5002205", sug: "הוצ' גבייה (מילגם)" },
  water:   { naxas: "13-88142", sug: "מים וביוב" },
};
// minusDays imported from ./dates.js (single source of truth)
const LEDGER = Object.entries(CHARGE_META).flatMap(([key, meta]) =>
  (TXNS[key] || []).map((r, i) => {
    const credit = r.dc === "ז";
    const amount = r.nominal || r.addon || 0;
    const system = r.type === 31 || r.type === 8;
    return {
      id: `${key}-${i}`,
      naxas: meta.naxas,
      sug: meta.sug,
      sugKey: key,
      terech: r.date,                                  // ת. ערך
      tpeula: minusDays(r.date, r.type === 8 ? 0 : 1), // ת. פעולה
      tgviya: credit ? r.date : "—",                   // ת. גבייה (לזכות בלבד)
      peratim: r.ref && r.ref !== "—" ? r.ref : TXN_TYPES[r.type],
      type: r.type,
      dc: r.dc,
      zchut: credit ? amount : null,
      chova: credit ? null : amount,
      itra: r.bal,                                     // ית. מצטברת (לכל סוג חיוב)
      magav: credit ? "55" : "23",                     // קוד מ.גב
      user: system ? "מערכת" : credit ? "hsv_hug" : "שמעון עמר",
      pkuda: credit ? `69${9000 + i * 13}` : r.type === 44 ? "44120" : "—",
      fyr: Number(r.date.split("/")[2]),
    };
  })
);
const LEDGER_COLUMNS = [
  { key: "naxas",   label: "נכס",         align: "start", w: 96,  num: true },
  { key: "sug",     label: "סוג חיוב",    align: "start", w: 150 },
  { key: "terech",  label: "ת. ערך",      align: "start", w: 92,  num: true },
  { key: "tpeula",  label: "ת. פעולה",    align: "start", w: 92,  num: true },
  { key: "tgviya",  label: "ת. גבייה",    align: "start", w: 92,  num: true },
  { key: "peratim", label: "פרטים",       align: "start", w: 170 },
  { key: "dc",      label: "ז/ח",         align: "center", w: 52 },
  { key: "zchut",   label: "זכות",        align: "end",   w: 96,  num: true, money: true },
  { key: "chova",   label: "חובה",        align: "end",   w: 96,  num: true, money: true },
  { key: "itra",    label: "ית. מצטברת",  align: "end",   w: 110, num: true, money: true },
  { key: "magav",   label: "מ.גב",        align: "center", w: 60, num: true },
  { key: "user",    label: "בוצע ע\"י",   align: "start", w: 110 },
  { key: "pkuda",   label: "מס' פקודה",   align: "start", w: 100, num: true },
];

const YEARS = Array.from({ length: 2026 - 2007 + 1 }, (_, i) => 2026 - i);

// YEAR_BALANCES — closing balance per fiscal year (multi-year view). Most years
// are settled (0); a few carry open debt. Drives the year navigator + window.
const YEAR_BALANCES = (() => {
  const open = { 2026: 13574, 2025: 4120, 2023: 880 };
  const o = {};
  YEARS.forEach(y => { o[y] = open[y] || 0; });
  return o;
})();

const AI_INSIGHTS = [
  { id: "growth", tone: "warn", icon: "trend",
    text: "החוב גדל ב-21% מתחילת השנה — ₪1,950 מתוכם ריבית והצמדה מצטברת.",
    source: "מנוע חישוב ריבית · תנועות 30/04/2026", weight: 1,
    action: { label: "הצע הסדר", flow: "arrangement" } },
  { id: "payer", tone: "good", icon: "check",
    text: "המשלם שילם 4 מתוך 5 התשלומים האחרונים במועד — פרופיל אמין להסדר.",
    source: "היסטוריית תנועות 2024–2026", weight: 2,
    action: { label: "פתח הסדר", flow: "arrangement" } },
  { id: "unpaid", tone: "crit", icon: "alert",
    text: "זוהו 2 שוברי ארנונה פתוחים לשנת 2026 (יתרת קרן ₪1,376).",
    source: "קובץ אב משלמים · נושא 1", weight: 1,
    action: { label: "שלח דרישת תשלום", flow: "letter" } },
];

const AI_ACTIONS = [
  { id: "arrangement", icon: "card",    label: "הצע הסדר תשלומים", hint: "6 תשלומים · ₪2,262 לחודש" },
  { id: "letter",      icon: "send",    label: "נסח מכתב התראה", hint: "טיוטה אוטומטית מוכנה" },
  { id: "interest",    icon: "calc",    label: "חשב ריבית מעודכנת", hint: "נכון להיום" },
  { id: "summary",     icon: "sigma",   label: "הפק סיכום למשלם", hint: "PDF · עברית" },
];

const QUICK_ACTIONS = [
  { id: "update_arrangement", icon: "card",    label: "עדכון הסדר",        hint: "הסדר תשלומים פעיל" },
  { id: "credit_charge",      icon: "receipt", label: "זיכוי חיוב לנכס",   hint: "ביטול / תיקון חיוב" },
  { id: "discounts",          icon: "wallet",  label: "הנחות לנכס",        hint: "ניהול הנחות וועדה" },
  { id: "swap_holders",       icon: "user",    label: "החלפת מחזיקים",     hint: "עדכון מחזיק הנכס" },
  { id: "view_refs",          icon: "docs",    label: "הצגת אסמכתאות",     hint: "צפייה במסמכים מקושרים" },
];

const NOTES = [
  { id: 1, author: "שמעון עמר", role: "פקיד גבייה", date: "28/05/2026 14:12", text: "המשלם פנה טלפונית, ביקש לפרוס את יתרת הארנונה ל-6 תשלומים. ממתין לאישור מנהל." },
  { id: 2, author: "רונית כהן", role: "מוקדנית", date: "21/05/2026 09:40", text: "נשלח מכתב התראה ראשון בדואר רשום. אסמכתא RR-44120." },
  { id: 3, author: "מערכת", role: "אוטומטי", date: "30/04/2026 02:00", text: "בוצע חישוב ריבית והצמדה חודשי לכלל השירותים הפתוחים." },
  { id: 4, author: "שמעון עמר", role: "פקיד גבייה", date: "12/02/2026 11:05", text: "אושרה הנחת ועדה 15% לשנת 2026 בגין מצב סוציו-אקונומי." },
];

const DOCUMENTS = [
  { id: 1, name: "שובר ארנונה 2026 — מחזור 1", type: "PDF", date: "01/01/2026", size: "240KB" },
  { id: 2, name: "אישור ועדת הנחות", type: "PDF", date: "12/02/2026", size: "180KB" },
  { id: 3, name: "מכתב התראה ראשון", type: "PDF", date: "21/05/2026", size: "96KB" },
  { id: 4, name: "צילום ת.ז.", type: "JPG", date: "08/03/2024", size: "1.2MB" },
];

function fmt(n) { return Math.round(n).toLocaleString("en-US"); }

// ── BPM layer ───────────────────────────────────────────────────────────────
// WORKLIST — the clerk's case queue (entry screen). Each case carries priority,
// SLA, status, assignee, a propensity-to-pay score, and a Next-Best-Action.
// `nba.flow` matches a FlowHost id so the recommendation is one click to execute.
const STATUS = {
  new:        { label: "חדש",        tone: "blue"  },
  active:     { label: "בטיפול",     tone: "teal"  },
  arrangement:{ label: "בהסדר",      tone: "green" },
  enforcement:{ label: "באכיפה",     tone: "red"   },
  waiting:    { label: "ממתין",      tone: "amber" },
  resolved:   { label: "טופל",       tone: "gray"  },
};
const WORKLIST = [
  { id: "999-DEMO",   name: "ישראל לדוגמה", balance: 13574, priority: "crit", status: "active",
    sla: "חורג ב-3 ימים", slaOverdue: true, assignee: "שמעון עמר", score: 78, tasks: 2,
    last: "מכתב התראה · 21/05", nba: { label: "הצע הסדר תשלומים", flow: "arrangement" }, tags: ["ארנונה", "2 שוברים"] },
  { id: "028841200",  name: "כהן דוד",       balance: 28960, priority: "crit", status: "enforcement",
    sla: "חורג ב-12 ימים", slaOverdue: true, assignee: "שמעון עמר", score: 31, tasks: 3,
    last: "עיקול בנק · 14/05", nba: { label: "המשך אכיפה", flow: "enforce" }, tags: ["עסק", "ותיק"] },
  { id: "301992847",  name: "לוי שרה",       balance: 4120,  priority: "high", status: "waiting",
    sla: "תוך 2 ימים", slaOverdue: false, assignee: "רונית כהן", score: 64, tasks: 1,
    last: "המתנה לאישור ועדה", nba: { label: "אשר הנחת ועדה", flow: "discount" }, tags: ["הנחה"] },
  { id: "205518830",  name: "אברהם יצחק",    balance: 9870,  priority: "high", status: "new",
    sla: "תוך 4 ימים", slaOverdue: false, assignee: "—", score: 52, tasks: 0,
    last: "תיק נפתח · 29/05", nba: { label: "שלח דרישת תשלום", flow: "letter" }, tags: ["חדש"] },
  { id: "118402665",  name: "מזרחי רחל",      balance: 1980,  priority: "med",  status: "arrangement",
    sla: "תקין", slaOverdue: false, assignee: "רונית כהן", score: 88, tasks: 0,
    last: "תשלום 3/6 · במועד", nba: { label: "ללא פעולה — במסלול", flow: null }, tags: ["הסדר פעיל"] },
  { id: "442087109",  name: "פרץ משה",       balance: 760,   priority: "low",  status: "active",
    sla: "תקין", slaOverdue: false, assignee: "שמעון עמר", score: 71, tasks: 1,
    last: "תזכורת SMS · 20/05", nba: { label: "שלח תזכורת תשלום", flow: "letter" }, tags: ["מים"] },
  { id: "667301284",  name: "דהן אורי",      balance: 15230, priority: "high", status: "active",
    sla: "תוך 1 יום", slaOverdue: false, assignee: "שמעון עמר", score: 44, tasks: 2,
    last: "שיחה יוצאת · 22/05", nba: { label: "הצע הסדר תשלומים", flow: "arrangement" }, tags: ["ארנונה", "עסק"] },
  { id: "550113907",  name: "ביטון נעמה",    balance: 0,     priority: "low",  status: "resolved",
    sla: "—", slaOverdue: false, assignee: "רונית כהן", score: 100, tasks: 0,
    last: "חוב סולק · 18/05", nba: { label: "סגור תיק", flow: null }, tags: ["שולם"] },
];

// CLERKS — who's logged in and their colleagues.
const CURRENT_CLERK = { id: "shmon", name: "שמעון עמר", role: "פקיד גבייה", avatar: "שע" };
const CLERKS = [
  { id: "shmon",  name: "שמעון עמר", role: "פקיד גבייה" },
  { id: "ronit",  name: "רונית כהן",  role: "מוקדנית" },
  { id: "system", name: "מערכת",      role: "אוטומטי" },
];

// TASK_TYPES — category of each task with an icon, a colour, and the flow it triggers.
const TASK_TYPES = {
  call:       { label: "שיחה טלפונית",   icon: "notes",   color: "var(--teal-600)",  bg: "var(--teal-50)",  flow: null },
  letter:     { label: "שליחת מכתב",     icon: "send",    color: "var(--info-fg)",   bg: "var(--info-bg)",  flow: "letter" },
  payment:    { label: "גביית תשלום",    icon: "card",    color: "var(--ok-fg)",     bg: "var(--ok-bg)",    flow: "payment" },
  arrangement:{ label: "הסדר תשלומים",  icon: "wallet",  color: "var(--teal-700)",  bg: "var(--teal-50)",  flow: "arrangement" },
  discount:   { label: "טיפול בהנחה",   icon: "wallet",  color: "var(--warn-fg)",   bg: "var(--warn-bg)",  flow: "discount" },
  approve:    { label: "אישור מנהל",     icon: "shield",  color: "var(--err-fg)",    bg: "var(--err-bg)",   flow: "enforce" },
  followup:   { label: "מעקב",           icon: "history", color: "var(--ink-600)",   bg: "var(--ink-100)",  flow: null },
  credit:     { label: "זיכוי חיוב",    icon: "receipt", color: "var(--ok-fg)",     bg: "var(--ok-bg)",    flow: "credit" },
  holder:     { label: "החלפת מחזיק",   icon: "user",    color: "var(--teal-600)",  bg: "var(--teal-50)",  flow: "holder" },
  docs:       { label: "טיפול במסמכים", icon: "docs",    color: "var(--ink-500)",   bg: "var(--ink-100)",  flow: null },
};

// TASKS — the clerk's daily work queue. Rich: type, case link, balance, channel, note.
const TASKS = [
  { id:  1, type: "approve",    title: "אישור מנהל לעיקול חשבון בנק",          caseName: "כהן דוד",         caseId: "028841200", balance: 28960, due: "01/06/2026", overdue: true,  assignee: "shmon", priority: "crit", done: false, note: "ממתין לחתימה — תיק אכיפה ברמה 2" },
  { id:  2, type: "call",       title: "התקשר לחידוש הסדר תשלומים שנפסק",      caseName: "ישראל לדוגמה",    caseId: "999-DEMO",  balance: 13574, due: "02/06/2026", overdue: true,  assignee: "shmon", priority: "high", done: false, note: "פנה בעצמו 22/05, לא ענה מאז" },
  { id:  3, type: "letter",     title: "שלח התראה אחרונה לפני אכיפה",           caseName: "דהן אורי",        caseId: "667301284", balance: 15230, due: "02/06/2026", overdue: true,  assignee: "shmon", priority: "high", done: false, note: "14 ימים עברו מהמכתב הראשון" },
  { id:  4, type: "payment",    title: "קלוט תשלום שהועבר בהעברה בנקאית",      caseName: "פרץ משה",         caseId: "442087109", balance: 760,   due: "01/06/2026", overdue: true,  assignee: "shmon", priority: "high", done: false, note: "העברה BANK-8822 ממתינה לזיהוי" },
  { id:  5, type: "arrangement",title: "פתח הסדר תשלומים — ביקש בשיחה",        caseName: "אברהם יצחק",      caseId: "205518830", balance: 9870,  due: "03/06/2026", overdue: false, assignee: "shmon", priority: "high", done: false, note: "3 תשלומים, מועד ראשון 01/07" },
  { id:  6, type: "discount",   title: "טפל בבקשת הנחת נכה 50%",               caseName: "ישראל לדוגמה",    caseId: "999-DEMO",  balance: 13574, due: "04/06/2026", overdue: false, assignee: "shmon", priority: "med",  done: false, note: "הגיש אישור רפואי — בדוק תקינות" },
  { id:  7, type: "followup",   title: "מעקב תשלום 4/6 בהסדר",                 caseName: "מזרחי רחל",       caseId: "118402665", balance: 1980,  due: "05/07/2026", overdue: false, assignee: "shmon", priority: "med",  done: false, note: "תשלומים 1-3 הגיעו במועד" },
  { id:  8, type: "docs",       title: "אסוף מסמכי ועדת הנחות",                caseName: "לוי שרה",         caseId: "301992847", balance: 4120,  due: "03/06/2026", overdue: false, assignee: "ronit", priority: "med",  done: false, note: "" },
  { id:  9, type: "credit",     title: "בצע זיכוי כפל-חיוב ארנונה רבעון 1",    caseName: "ישראל לדוגמה",    caseId: "999-DEMO",  balance: 13574, due: "05/06/2026", overdue: false, assignee: "shmon", priority: "med",  done: false, note: "₪640 שחויבו פעמיים, ראה חשבונית 9912" },
  { id: 10, type: "holder",     title: "עדכן מחזיק עפ\"י חוזה שכירות חדש",     caseName: "כהן דוד",         caseId: "028841200", balance: 28960, due: "06/06/2026", overdue: false, assignee: "shmon", priority: "med",  done: false, note: "שוכר חדש מ-01/06 — עדכן לפרורציה" },
  { id: 11, type: "call",       title: "שיחת מעקב — סיכמנו על תשלום",          caseName: "דהן אורי",        caseId: "667301284", balance: 15230, due: "07/06/2026", overdue: false, assignee: "shmon", priority: "low",  done: false, note: "" },
  { id: 12, type: "followup",   title: "ודא קבלת מכתב רשום",                   caseName: "ישראל לדוגמה",    caseId: "999-DEMO",  balance: 13574, due: "10/06/2026", overdue: false, assignee: "ronit", priority: "low",  done: false, note: "אסמכתא RR-44120" },
  { id: 13, type: "payment",    title: "סגור תיק — חוב סולק במלואו",           caseName: "ביטון נעמה",      caseId: "550113907", balance: 0,     due: "20/05/2026", overdue: false, assignee: "ronit", priority: "low",  done: true,  note: "" },
];

// CASE_TIMELINE — seed history for the open case (live flow events prepend to this).
const CASE_TIMELINE = [
  { id: 1, type: "letter",  icon: "send",   tone: "warn", time: "21/05/2026 09:40", title: "מכתב התראה ראשון נשלח", detail: "דואר רשום · אסמכתא RR-44120 · רונית כהן" },
  { id: 2, type: "system",  icon: "calc",   tone: "gray", time: "30/04/2026 02:00", title: "חישוב ריבית והצמדה חודשי", detail: "בוצע אוטומטית לכלל השירותים הפתוחים" },
  { id: 3, type: "discount",icon: "wallet", tone: "good", time: "12/02/2026 11:05", title: "אושרה הנחת ועדה 15%", detail: "מצב סוציו-אקונומי · שמעון עמר" },
  { id: 4, type: "open",    icon: "user",   tone: "teal", time: "01/01/2026 00:00", title: "תיק גבייה נפתח לשנת 2026", detail: "חיוב שנתי הופק · יתרת פתיחה ₪7,980" },
];

// synthRows — deterministic transaction list for a charge of a given balance.
function synthRows(balance) {
  if (balance <= 0) return [{ date: "01/01/2026", type: 8, ref: "—", dc: "ח", nominal: 0, addon: 0, bal: 0 }];
  const open = Math.round(balance * 0.55), annual = Math.round(balance * 1.55), paid = annual - balance;
  return [
    { date: "01/01/2026", type: 8,  ref: "—",         dc: "ח", nominal: open,            addon: 0, bal: open },
    { date: "01/01/2026", type: 1,  ref: "חיוב שנתי",  dc: "ח", nominal: annual - open,    addon: 0, bal: annual },
    { date: "15/03/2026", type: 100, ref: "BANK",      dc: "ז", nominal: paid,             addon: 0, bal: balance },
  ];
}

// buildCaseData — per-case entities/charges/transactions. The demo payer returns
// the rich global data; every other case gets its own set summing to its balance,
// so the drill view always reflects the open case (no more "demo data" mismatch).
function buildCaseData(c) {
  if (!c || c.id === PAYER.payerNo) return { subjects: SUBJECTS, details: SUBJECT_DETAILS };
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

export {
  PAYER, ENTITIES, SUBJECTS, SUBJECT_DETAILS, SERVICES, TOTALS, TXNS, TXN_TYPES, YEARS, YEAR_BALANCES,
  AI_INSIGHTS, AI_ACTIONS, QUICK_ACTIONS, NOTES, DOCUMENTS, LEDGER, LEDGER_COLUMNS, fmt,
  WORKLIST, STATUS, CASE_TIMELINE, TASKS, TASK_TYPES, CLERKS, CURRENT_CLERK, buildCaseData,
};
