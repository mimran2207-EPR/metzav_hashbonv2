// data.jsx — mock account-status data for payer יהודה מימראן (040499667)
// Sums computed so the UI stays internally consistent.

const PAYER = {
  name: "יהודה מימראן",
  payerNo: "040499667",
  taz: "058814203",
  type: "משלם פרטי",
  address: "חזון איש 21, דירה 16",
  city: "מודיעין עילית",
  zip: "71919",
  phone: "958-603-9422",
  email: "y.mimran@gmail.com",
  council: "מועצה אזורית שדות נגב",
  since: "2008",
  status: "פעיל",
};

// נושאים / ישויות (subjects) attached to the payer
const ENTITIES = [
  { id: "5002205", subject: 3,  subjectName: "נכס", title: "דירת מגורים", sub: "חזון איש 21, דירה 16", balance: 11268, services: 3 },
  { id: "13-88142", subject: 13, subjectName: "מים שוטף", title: "מד מים 2\"", sub: "צריכה רבעונית", balance: 1386, services: 1 },
  { id: "15-2204",  subject: 15, subjectName: "שלטים", title: "שילוט עסק", sub: "חזון איש 21", balance: 0, services: 1 },
];

// סוגי שירות — balance breakdown (per service)
const SERVICES = [
  { id: "arnona",  name: "ארנונה", entity: "5002205", nominal: 8420, indexation: 612, interest: 1340, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 9 },
  { id: "water",   name: "מים וביוב", entity: "13-88142", nominal: 1180, indexation: 64, interest: 142, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 6 },
  { id: "shmira",  name: "אגרת שמירה", entity: "5002205", nominal: 540, indexation: 22, interest: 38, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 4 },
  { id: "sewage",  name: "אגרת ביוב", entity: "5002205", nominal: 760, indexation: 40, interest: 96, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 5 },
  { id: "collect", name: "הוצ' גבייה (מילגם חדש)", entity: "5002205", nominal: 320, indexation: 0, interest: 0, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 2 },
];

function sumServices(field) { return SERVICES.reduce((a, s) => a + (field === "balance" ? s.balance : s[field]), 0); }
const TOTALS = {
  nominal: sumServices("nominal"),
  indexation: sumServices("indexation"),
  interest: sumServices("interest"),
  get balance() { return this.nominal + this.indexation + this.interest; },
};

// תנועות (transactions) keyed by service; running balance flows top→bottom (newest first display reversed)
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

const YEARS = Array.from({ length: 2026 - 2007 + 1 }, (_, i) => 2026 - i);

// AI insights (Explainable — each carries a source)
const AI_INSIGHTS = [
  { id: "growth", tone: "warn", icon: "trend",
    text: "החוב גדל ב-21% מתחילת השנה — ₪1,950 מתוכם ריבית והצמדה מצטברת.",
    source: "מנוע חישוב ריבית · תנועות 30/04/2026", weight: 1 },
  { id: "payer", tone: "good", icon: "check",
    text: "המשלם שילם 4 מתוך 5 התשלומים האחרונים במועד — פרופיל אמין להסדר.",
    source: "היסטוריית תנועות 2024–2026", weight: 2 },
  { id: "unpaid", tone: "crit", icon: "alert",
    text: "זוהו 2 שוברי ארנונה פתוחים לשנת 2026 (יתרת קרן ₪1,376).",
    source: "קובץ אב משלמים · נושא 1", weight: 1 },
];

// Suggested next actions (Context-aware)
const AI_ACTIONS = [
  { id: "arrangement", icon: "card",    label: "הצע הסדר תשלומים", hint: "6 תשלומים · ₪2,262 לחודש" },
  { id: "letter",      icon: "send",    label: "נסח מכתב התראה", hint: "טיוטה אוטומטית מוכנה" },
  { id: "interest",    icon: "calc",    label: "חשב ריבית מעודכנת", hint: "נכון להיום" },
  { id: "summary",     icon: "sigma",   label: "הפק סיכום למשלם", hint: "PDF · עברית" },
];

// פעולות מהירות — operational quick actions (collection clerk)
const QUICK_ACTIONS = [
  { id: "update_arrangement", icon: "card",    label: "עדכון הסדר",        hint: "הסדר תשלומים פעיל" },
  { id: "credit_charge",      icon: "receipt", label: "זיכוי חיוב לנכס",   hint: "ביטול / תיקון חיוב" },
  { id: "discounts",          icon: "wallet",  label: "הנחות לנכס",        hint: "ניהול הנחות וועדה" },
  { id: "swap_holders",       icon: "user",    label: "החלפת מחזיקים",     hint: "עדכון מחזיק הנכס" },
  { id: "view_refs",          icon: "docs",    label: "הצגת אסמכתאות",     hint: "צפייה במסמכים מקושרים" },
];

// Notes (drawer) — count shown on action bar
const NOTES = [
  { id: 1, author: "שמעון עמר", role: "פקיד גבייה", date: "28/05/2026 14:12", text: "המשלם פנה טלפונית, ביקש לפרוס את יתרת הארנונה ל-6 תשלומים. ממתין לאישור מנהל." },
  { id: 2, author: "רונית כהן", role: "מוקדנית", date: "21/05/2026 09:40", text: "נשלח מכתב התראה ראשון בדואר רשום. אסמכתא RR-44120." },
  { id: 3, author: "מערכת", role: "אוטומטי", date: "30/04/2026 02:00", text: "בוצע חישוב ריבית והצמדה חודשי לכלל השירותים הפתוחים." },
  { id: 4, author: "שמעון עמר", role: "פקיד גבייה", date: "12/02/2026 11:05", text: "אושרה הנחת ועדה 15% לשנת 2026 בגין מצב סוציו-אקונומי." },
];

// Documents
const DOCUMENTS = [
  { id: 1, name: "שובר ארנונה 2026 — מחזור 1", type: "PDF", date: "01/01/2026", size: "240KB" },
  { id: 2, name: "אישור ועדת הנחות", type: "PDF", date: "12/02/2026", size: "180KB" },
  { id: 3, name: "מכתב התראה ראשון", type: "PDF", date: "21/05/2026", size: "96KB" },
  { id: 4, name: "צילום ת.ז.", type: "JPG", date: "08/03/2024", size: "1.2MB" },
];

// Currency / number helpers
function nis(n, withSign = true) {
  const v = Math.abs(Math.round(n)).toLocaleString("en-US");
  return (withSign ? "₪" : "") + v;
}
function fmt(n) { return Math.round(n).toLocaleString("en-US"); }

Object.assign(window, {
  PAYER, ENTITIES, SERVICES, TOTALS, TXNS, TXN_TYPES, YEARS,
  AI_INSIGHTS, AI_ACTIONS, QUICK_ACTIONS, NOTES, DOCUMENTS, nis, fmt,
});
