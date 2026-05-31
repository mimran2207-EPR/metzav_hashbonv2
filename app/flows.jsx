// flows.jsx — guided multi-step ACTION FLOWS (the BPM layer).
//
// Every meaningful clerk action — payment, arrangement, credit, discount,
// holder-swap, enforcement, letter — used to dead-end in a toast. Here each
// becomes a real wizard: inputs → live preview → confirm → emits a case event.
//
// FlowHost is the single dispatcher: App holds {id, ctx} and renders the
// matching flow inside a right-side Sheet. onComplete(event) bubbles a
// structured case-timeline event up to App.
import React, { useState, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { Sheet, PillButton, Chip } from './ui.jsx';
import { fmt } from './data.jsx';

/* ── shared wizard primitives ─────────────────────────────────────────────── */
function Stepper({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flex: "none" }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center",
              fontSize: 12, fontWeight: 700, flex: "none",
              background: i < current ? "var(--teal-500)" : i === current ? "var(--teal-600)" : "var(--ink-100)",
              color: i <= current ? "#fff" : "var(--ink-500)",
              boxShadow: i === current ? "0 0 0 3px rgba(var(--teal-rgb),.2)" : "none" }}>
              {i < current ? <Icon name="check" size={13} color="#fff"/> : i + 1}
            </span>
            <span style={{ fontSize: 12.5, fontWeight: i === current ? 700 : 500,
              color: i === current ? "var(--teal-700)" : "var(--ink-500)", whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < current ? "var(--teal-300)" : "var(--ink-100)", borderRadius: 2 }}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

const labelStyle = { fontSize: 12.5, fontWeight: 600, color: "var(--ink-600)", marginBottom: 5, display: "block" };
const inputStyle = { width: "100%", boxSizing: "border-box", height: 40, border: "1px solid var(--ink-300)",
  borderRadius: 10, padding: "0 12px", fontFamily: "var(--font)", fontSize: 14, color: "var(--ink-800)", outline: "none" };

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function SummaryBox({ rows, total }) {
  return (
    <div style={{ background: "var(--ink-50)", border: "1px solid var(--ink-200)", borderRadius: 12, padding: 16 }}>
      {rows.map(([l, v, c]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "4px 0", color: "var(--ink-700)" }}>
          <span>{l}</span><span className="num" style={{ fontWeight: 600, color: c || "var(--ink-800)" }}>{v}</span>
        </div>
      ))}
      {total && (
        <>
          <div style={{ height: 1, background: "var(--ink-200)", margin: "8px 0" }}/>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-900)" }}>{total[0]}</span>
            <span className="num" style={{ fontSize: 22, fontWeight: 700, color: "var(--teal-600)" }}>{total[1]}</span>
          </div>
        </>
      )}
    </div>
  );
}

// FlowFooter — back / next / finish controls
function FlowFooter({ step, lastStep, onBack, onNext, onFinish, nextLabel = "המשך", finishLabel = "אשר וסיים", finishIcon = "check", canNext = true }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {step > 0 && <PillButton variant="ghost" onClick={onBack} style={{ flex: "none" }}>חזרה</PillButton>}
      <div style={{ flex: 1 }}/>
      {!lastStep
        ? <PillButton variant="primary" chevron onClick={onNext} disabled={!canNext}>{nextLabel}</PillButton>
        : <PillButton variant="primary" icon={finishIcon} onClick={onFinish}>{finishLabel}</PillButton>}
    </div>
  );
}

/* ── 1. Payment arrangement (הסדר תשלומים) ────────────────────────────────── */
function ArrangementFlow({ ctx, onClose, onComplete }) {
  const balance = ctx.balance || 13574;
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(6);
  const [start, setStart] = useState("01/07/2026");
  const perMonth = Math.round(balance / count);
  const steps = ["תנאי הפריסה", "תצוגה מקדימה", "אישור"];

  const schedule = Array.from({ length: count }, (_, i) => {
    const [d, m, y] = start.split("/").map(Number);
    const dt = new Date(y, m - 1 + i, d);
    const p = x => String(x).padStart(2, "0");
    return { n: i + 1, date: `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear()}`,
      amount: i === count - 1 ? balance - perMonth * (count - 1) : perMonth };
  });

  const finish = () => {
    onComplete({ type: "arrangement", icon: "card", tone: "good",
      title: `הסדר תשלומים נפתח · ${count} תשלומים`,
      detail: `₪${fmt(perMonth)} לחודש החל מ-${start} · הריבית מוקפאת כל עוד התשלומים במועד` });
    onClose();
  };

  return (
    <Sheet open onClose={onClose} side="end" width={460} title="פתיחת הסדר תשלומים" sub={ctx.subtitle}
      footer={<FlowFooter step={step} lastStep={step === 2} onBack={() => setStep(s => s - 1)}
        onNext={() => setStep(s => s + 1)} onFinish={finish} finishLabel="הפעל הסדר" finishIcon="card"/>}>
      <Stepper steps={steps} current={step}/>
      {step === 0 && (
        <>
          <SummaryBox rows={[["יתרת חוב לפריסה", `₪${fmt(balance)}`, "var(--red)"]]}/>
          <div style={{ height: 14 }}/>
          <Field label="מספר תשלומים" hint="3–36 תשלומים חודשיים">
            <div style={{ display: "flex", gap: 6 }}>
              {[3, 6, 12, 24].map(n => (
                <button key={n} onClick={() => setCount(n)} data-focusring
                  style={{ flex: 1, height: 40, border: `1.5px solid ${count === n ? "var(--teal-500)" : "var(--ink-200)"}`,
                    background: count === n ? "var(--teal-50)" : "#fff", color: count === n ? "var(--teal-700)" : "var(--ink-700)",
                    borderRadius: 10, cursor: "pointer", fontFamily: "var(--font)", fontSize: 14, fontWeight: 700 }}>{n}</button>
              ))}
            </div>
          </Field>
          <Field label="תאריך תשלום ראשון"><input value={start} onChange={e => setStart(e.target.value)} className="num" style={inputStyle}/></Field>
          <SummaryBox rows={[["תשלום חודשי משוער", `₪${fmt(perMonth)}`, "var(--teal-700)"]]}/>
        </>
      )}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-600)", marginBottom: 4 }}>לוח תשלומים · {count} תשלומים</div>
          {schedule.map(p => (
            <div key={p.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              border: "1px solid var(--ink-200)", borderRadius: 10, background: p.n % 2 ? "#fff" : "var(--ink-50)" }}>
              <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--teal-100)", color: "var(--teal-700)",
                display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flex: "none" }}>{p.n}</span>
              <span className="num" style={{ flex: 1, fontSize: 13, color: "var(--ink-700)" }}>{p.date}</span>
              <span className="num" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-900)" }}>₪{fmt(p.amount)}</span>
            </div>
          ))}
        </div>
      )}
      {step === 2 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--ok-bg)",
            border: "1px solid var(--ok-fg)", borderRadius: 12, marginBottom: 14 }}>
            <Icon name="check" size={20} color="var(--ok-fg)"/>
            <span style={{ fontSize: 13.5, color: "var(--ok-fg)", fontWeight: 600 }}>ההסדר מקפיא ריבית עתידית כל עוד התשלומים במועד.</span>
          </div>
          <SummaryBox rows={[
            ["יתרה", `₪${fmt(balance)}`],
            ["מספר תשלומים", count],
            ["תשלום חודשי", `₪${fmt(perMonth)}`],
            ["מועד ראשון", start],
          ] } total={["סך הסדר", `₪${fmt(balance)}`]}/>
        </>
      )}
    </Sheet>
  );
}

/* ── 2. Holder swap (החלפת מחזיק) — effective date + proration ─────────────── */
function HolderSwapFlow({ ctx, onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [payerNo, setPayerNo] = useState("");
  const [effDate, setEffDate] = useState("01/06/2026");
  const [reason, setReason] = useState("מכירה");
  const steps = ["מחזיק נכנס", "פרורציה", "אישור"];
  const annual = ctx.balance || 13184;
  // proration: days remaining in year from effective date
  const [d, m] = effDate.split("/").map(Number);
  const dayOfYear = Math.round((new Date(2026, m - 1, d) - new Date(2026, 0, 0)) / 864e5);
  const outgoingShare = Math.round(annual * (dayOfYear / 365));
  const incomingShare = annual - outgoingShare;

  const finish = () => {
    onComplete({ type: "holder", icon: "user", tone: "warn",
      title: `החלפת מחזיק · ${name || "מחזיק חדש"}`,
      detail: `החל מ-${effDate} (${reason}) · חיוב מפוצל: יוצא ₪${fmt(outgoingShare)} / נכנס ₪${fmt(incomingShare)}` });
    onClose();
  };

  return (
    <Sheet open onClose={onClose} side="end" width={460} title="החלפת מחזיק לנכס" sub={ctx.subtitle}
      footer={<FlowFooter step={step} lastStep={step === 2} onBack={() => setStep(s => s - 1)}
        onNext={() => setStep(s => s + 1)} onFinish={finish} finishLabel="בצע החלפה" finishIcon="user" canNext={step !== 0 || name.trim().length > 1}/>}>
      <Stepper steps={steps} current={step}/>
      {step === 0 && (
        <>
          <Field label="שם המחזיק הנכנס"><input value={name} onChange={e => setName(e.target.value)} placeholder="שם מלא" style={inputStyle}/></Field>
          <Field label="מספר משלם"><input value={payerNo} onChange={e => setPayerNo(e.target.value)} placeholder="לדוגמה 028841200" className="num" style={inputStyle}/></Field>
          <Field label="תאריך תוקף"><input value={effDate} onChange={e => setEffDate(e.target.value)} className="num" style={inputStyle}/></Field>
          <Field label="סיבת ההחלפה">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["מכירה", "רכישה", "ירושה", "השכרה"].map(r => (
                <button key={r} onClick={() => setReason(r)} data-focusring
                  style={{ border: `1.5px solid ${reason === r ? "var(--teal-500)" : "var(--ink-200)"}`,
                    background: reason === r ? "var(--teal-50)" : "#fff", color: reason === r ? "var(--teal-700)" : "var(--ink-700)",
                    borderRadius: 999, padding: "7px 14px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600 }}>{r}</button>
              ))}
            </div>
          </Field>
        </>
      )}
      {step === 1 && (
        <>
          <div style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 12, lineHeight: 1.6 }}>
            חיוב שנתי של ₪{fmt(annual)} מפוצל לפי תאריך התוקף ({effDate}):
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, border: "1px solid var(--ink-200)", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 4 }}>מחזיק יוצא</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 700, color: "var(--ink-800)" }}>₪{fmt(outgoingShare)}</div>
              <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 2 }}>{dayOfYear} ימים</div>
            </div>
            <div style={{ flex: 1, border: "1.5px solid var(--teal-400)", borderRadius: 12, padding: 14, textAlign: "center", background: "var(--teal-50)" }}>
              <div style={{ fontSize: 12, color: "var(--teal-600)", marginBottom: 4 }}>מחזיק נכנס</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 700, color: "var(--teal-700)" }}>₪{fmt(incomingShare)}</div>
              <div style={{ fontSize: 11, color: "var(--teal-500)", marginTop: 2 }}>{365 - dayOfYear} ימים</div>
            </div>
          </div>
        </>
      )}
      {step === 2 && (
        <SummaryBox rows={[
          ["מחזיק נכנס", name || "—"],
          ["מספר משלם", payerNo || "—"],
          ["תאריך תוקף", effDate],
          ["סיבה", reason],
          ["חיוב מחזיק יוצא", `₪${fmt(outgoingShare)}`],
          ["חיוב מחזיק נכנס", `₪${fmt(incomingShare)}`, "var(--teal-700)"],
        ]}/>
      )}
    </Sheet>
  );
}

/* ── 3. Credit / refund a charge (זיכוי חיוב) ──────────────────────────────── */
function CreditFlow({ ctx, onClose, onComplete }) {
  const [amount, setAmount] = useState(ctx.balance ? Math.round(ctx.balance / 4) : 500);
  const [reason, setReason] = useState("תיקון חיוב שגוי");
  const [ref, setRef] = useState("");
  const finish = () => {
    onComplete({ type: "credit", icon: "receipt", tone: "good",
      title: `זיכוי חיוב · ₪${fmt(amount)}`, detail: `${reason}${ref ? ` · אסמכתא ${ref}` : ""}` });
    onClose();
  };
  return (
    <Sheet open onClose={onClose} side="end" width={440} title="זיכוי / תיקון חיוב" sub={ctx.subtitle}
      footer={<div style={{ display: "flex", justifyContent: "flex-end" }}><PillButton variant="primary" icon="check" onClick={finish}>בצע זיכוי</PillButton></div>}>
      <Field label="סכום הזיכוי (₪)"><input type="number" value={amount} onChange={e => setAmount(+e.target.value || 0)} className="num" style={inputStyle}/></Field>
      <Field label="סיבת הזיכוי">
        <select value={reason} onChange={e => setReason(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
          {["תיקון חיוב שגוי", "כפל חיוב", "החלטת ועדה", "פשרה משפטית", "טעות סופר"].map(r => <option key={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="אסמכתא (אופציונלי)"><input value={ref} onChange={e => setRef(e.target.value)} placeholder="מספר החלטה / מסמך" style={inputStyle}/></Field>
      <div style={{ height: 6 }}/>
      <SummaryBox rows={[["סכום זיכוי", `₪${fmt(amount)}`, "var(--ok-fg)"], ["סיבה", reason]]}/>
    </Sheet>
  );
}

/* ── 4. Discount (הנחות) ───────────────────────────────────────────────────── */
function DiscountFlow({ ctx, onClose, onComplete }) {
  const [pct, setPct] = useState(15);
  const [type, setType] = useState("ועדת הנחות");
  const base = ctx.balance || 8420;
  const saved = Math.round(base * pct / 100);
  const finish = () => {
    onComplete({ type: "discount", icon: "wallet", tone: "good",
      title: `הנחה ${pct}% · ${type}`, detail: `חיסכון ₪${fmt(saved)} מתוך ₪${fmt(base)}` });
    onClose();
  };
  return (
    <Sheet open onClose={onClose} side="end" width={440} title="הזנת הנחה לנכס" sub={ctx.subtitle}
      footer={<div style={{ display: "flex", justifyContent: "flex-end" }}><PillButton variant="primary" icon="check" onClick={finish}>אשר הנחה</PillButton></div>}>
      <Field label="סוג ההנחה">
        <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
          {["ועדת הנחות", "הנחת נכה", "אזרח ותיק", "מצב סוציו-אקונומי", "הנחת מקדמה"].map(r => <option key={r}>{r}</option>)}
        </select>
      </Field>
      <Field label={`שיעור הנחה · ${pct}%`}>
        <input type="range" min="0" max="100" value={pct} onChange={e => setPct(+e.target.value)} style={{ width: "100%", accentColor: "var(--teal-500)" }}/>
      </Field>
      <SummaryBox rows={[["חיוב מקורי", `₪${fmt(base)}`], ["הנחה", `${pct}%`, "var(--teal-700)"], ["חיסכון", `₪${fmt(saved)}`, "var(--ok-fg)"]]}
        total={["לתשלום אחרי הנחה", `₪${fmt(base - saved)}`]}/>
    </Sheet>
  );
}

/* ── 5. Enforcement ladder (אכיפה) — escalation with SLA ───────────────────── */
const ENFORCE_LADDER = [
  { id: 0, label: "מכתב התראה ראשון", sla: "בוצע 21/05/2026", done: true },
  { id: 1, label: "התראה אחרונה (דואר רשום)", sla: "זמין כעת", done: false },
  { id: 2, label: "עיקול חשבון בנק", sla: "אחרי 14 יום", done: false, heavy: true },
  { id: 3, label: "עיקול מטלטלין / רכב", sla: "אחרי 30 יום", done: false, heavy: true },
  { id: 4, label: "הגבלת רישיון / נכס", sla: "החלטת מנהל", done: false, heavy: true },
];
function EnforcementFlow({ ctx, onClose, onComplete }) {
  const [picked, setPicked] = useState(1);
  const finish = () => {
    const s = ENFORCE_LADDER[picked];
    onComplete({ type: "enforce", icon: "shield", tone: s.heavy ? "crit" : "warn",
      title: `אכיפה · ${s.label}`, detail: `הופעל הליך אכיפה ברמה ${picked + 1} · ${s.sla}` });
    onClose();
  };
  return (
    <Sheet open onClose={onClose} side="end" width={460} title="סולם אכיפה" sub={ctx.subtitle}
      footer={<div style={{ display: "flex", justifyContent: "flex-end" }}><PillButton variant="primary" icon="shield" onClick={finish}>הפעל הליך</PillButton></div>}>
      <div style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 14, lineHeight: 1.6 }}>
        בחר את שלב האכיפה הבא. שלבים כבדים דורשים אישור מנהל.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {ENFORCE_LADDER.map((s, i) => {
          const active = picked === s.id;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              {/* rail */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
                <span style={{ width: 26, height: 26, borderRadius: 999, display: "grid", placeItems: "center", flex: "none",
                  background: s.done ? "var(--ok-fg)" : active ? "var(--teal-600)" : "var(--ink-100)",
                  color: s.done || active ? "#fff" : "var(--ink-500)", fontSize: 12, fontWeight: 700 }}>
                  {s.done ? <Icon name="check" size={13} color="#fff"/> : i + 1}
                </span>
                {i < ENFORCE_LADDER.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 22, background: s.done ? "var(--ok-fg)" : "var(--ink-100)" }}/>}
              </div>
              {/* card */}
              <button onClick={() => !s.done && setPicked(s.id)} disabled={s.done} data-focusring
                style={{ flex: 1, textAlign: "start", marginBottom: 8, cursor: s.done ? "default" : "pointer",
                  border: `1.5px solid ${active ? "var(--teal-500)" : "var(--ink-200)"}`,
                  background: active ? "var(--teal-50)" : s.done ? "var(--ink-50)" : "#fff",
                  borderRadius: 11, padding: "10px 13px", fontFamily: "var(--font)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: s.done ? "var(--ink-400)" : "var(--ink-800)" }}>{s.label}</span>
                  {s.heavy && <Chip tone="red" style={{ fontSize: 10 }}>אישור מנהל</Chip>}
                  {s.done && <Chip tone="green" style={{ fontSize: 10 }}>בוצע</Chip>}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 2 }}>{s.sla}</div>
              </button>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ── 6. Letter (מכתב) — template → preview → send ─────────────────────────── */
function LetterFlow({ ctx, onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [tmpl, setTmpl] = useState("דרישת תשלום");
  const templates = {
    "דרישת תשלום": `הנדון: יתרת חוב בסך ₪${fmt(ctx.balance || 13574)}.\nהינך נדרש להסדיר את החוב תוך 14 יום מקבלת מכתב זה.`,
    "התראה לפני אכיפה": `הנדון: התראה אחרונה לפני נקיטת הליכי אכיפה.\nלא שולם חוב בסך ₪${fmt(ctx.balance || 13574)}. בהיעדר הסדר תוך 7 ימים יינקטו הליכים לפי פקודת המסים (גבייה).`,
    "אישור הסדר": `הנדון: אישור הסדר תשלומים.\nההסדר אושר ונכנס לתוקף. אנא עמוד בלוח התשלומים שנקבע.`,
  };
  const steps = ["בחירת תבנית", "תצוגה ושליחה"];
  const finish = () => {
    onComplete({ type: "letter", icon: "send", tone: "good", title: `מכתב נשלח · ${tmpl}`, detail: "נשלח בדואר רשום · אסמכתא תיווצר אוטומטית" });
    onClose();
  };
  return (
    <Sheet open onClose={onClose} side="end" width={460} title="ניסוח ושליחת מכתב" sub={ctx.subtitle}
      footer={<FlowFooter step={step} lastStep={step === 1} onBack={() => setStep(0)} onNext={() => setStep(1)} onFinish={finish} finishLabel="שלח בדואר רשום" finishIcon="send"/>}>
      <Stepper steps={steps} current={step}/>
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.keys(templates).map(t => (
            <button key={t} onClick={() => setTmpl(t)} data-focusring
              style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "start",
                border: `1.5px solid ${tmpl === t ? "var(--teal-500)" : "var(--ink-200)"}`,
                background: tmpl === t ? "var(--teal-50)" : "#fff", borderRadius: 11, padding: "12px 14px", cursor: "pointer",
                fontFamily: "var(--font)", fontSize: 14, fontWeight: 600, color: tmpl === t ? "var(--teal-700)" : "var(--ink-800)" }}>
              <Icon name="send" size={16} color={tmpl === t ? "var(--teal-600)" : "var(--ink-400)"}/>{t}
            </button>
          ))}
        </div>
      )}
      {step === 1 && (
        <div style={{ border: "1px solid var(--ink-200)", borderRadius: 12, padding: 18, background: "#fff", whiteSpace: "pre-wrap",
          fontSize: 13.5, lineHeight: 1.8, color: "var(--ink-800)", minHeight: 200 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>לכבוד: {ctx.payerName || "המשלם"}</div>
          {templates[tmpl]}
          <div style={{ marginTop: 18, color: "var(--ink-500)" }}>בכבוד רב,<br/>מחלקת גבייה · מועצה אזורית שדות נגב</div>
        </div>
      )}
    </Sheet>
  );
}

/* ── 7. Payment / receipt (גביית תשלום) ────────────────────────────────────── */
function PaymentFlow({ ctx, onClose, onComplete }) {
  const [amount, setAmount] = useState(ctx.balance || 13574);
  const [method, setMethod] = useState("אשראי");
  const finish = () => {
    onComplete({ type: "payment", icon: "card", tone: "good", title: `תשלום נקלט · ₪${fmt(amount)}`, detail: `אמצעי: ${method} · קבלה תופק אוטומטית` });
    onClose();
  };
  return (
    <Sheet open onClose={onClose} side="end" width={440} title="גביית תשלום / קבלה" sub={ctx.subtitle}
      footer={<div style={{ display: "flex", justifyContent: "flex-end" }}><PillButton variant="primary" icon="check" onClick={finish}>קלוט תשלום</PillButton></div>}>
      <Field label="סכום לתשלום (₪)"><input type="number" value={amount} onChange={e => setAmount(+e.target.value || 0)} className="num" style={inputStyle}/></Field>
      <Field label="אמצעי תשלום">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["אשראי", "מזומן", "העברה", "צ'ק", "הוראת קבע"].map(mth => (
            <button key={mth} onClick={() => setMethod(mth)} data-focusring
              style={{ border: `1.5px solid ${method === mth ? "var(--teal-500)" : "var(--ink-200)"}`,
                background: method === mth ? "var(--teal-50)" : "#fff", color: method === mth ? "var(--teal-700)" : "var(--ink-700)",
                borderRadius: 999, padding: "7px 14px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600 }}>{mth}</button>
          ))}
        </div>
      </Field>
      <SummaryBox rows={[["יתרה נוכחית", `₪${fmt(ctx.balance || 13574)}`], ["תשלום", `₪${fmt(amount)}`, "var(--ok-fg)"]]}
        total={["יתרה אחרי תשלום", `₪${fmt(Math.max(0, (ctx.balance || 13574) - amount))}`]}/>
    </Sheet>
  );
}

/* ── dispatcher ───────────────────────────────────────────────────────────── */
const FLOWS = {
  arrangement: ArrangementFlow,
  holder: HolderSwapFlow,
  credit: CreditFlow,
  discount: DiscountFlow,
  enforce: EnforcementFlow,
  letter: LetterFlow,
  payment: PaymentFlow,
};

export function FlowHost({ flow, onClose, onComplete }) {
  if (!flow || !FLOWS[flow.id]) return null;
  const Cmp = FLOWS[flow.id];
  return <Cmp ctx={flow.ctx || {}} onClose={onClose} onComplete={onComplete} />;
}

export const FLOW_IDS = Object.keys(FLOWS);
