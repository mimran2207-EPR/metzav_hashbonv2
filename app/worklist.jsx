// worklist.jsx — the BPM entry layer: a case queue (Inbox) + a case timeline.
//
// Worklist is the clerk's landing screen: every payer-with-debt is a CASE with
// a priority, an SLA, a status, a propensity-to-pay score and a Next-Best-Action
// that is one click to execute. CaseTimeline shows the process history of the
// open case, with live action-flow events prepended.
import React, { useState, useMemo } from 'react';
import { Icon } from './icons.jsx';
import { Chip } from './ui.jsx';
import { WORKLIST, STATUS, fmt } from './data.jsx';

const PRIORITY = {
  crit: { label: "דחוף", color: "var(--red)",   bg: "var(--err-bg)" },
  high: { label: "גבוה", color: "var(--amber)", bg: "var(--warn-bg)" },
  med:  { label: "בינוני", color: "var(--teal-500)", bg: "var(--teal-50)" },
  low:  { label: "נמוך", color: "var(--ink-400)", bg: "var(--ink-100)" },
};
const scoreColor = s => s >= 70 ? "var(--ok-fg)" : s >= 40 ? "var(--warn-fg)" : "var(--err-fg)";

function ScoreBar({ score }) {
  return (
    <div title={`סיכוי גבייה ${score}%`} style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{ width: 54, height: 6, borderRadius: 999, background: "var(--ink-100)", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: scoreColor(score), borderRadius: 999 }}/>
      </div>
      <span className="num" style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score) }}>{score}</span>
    </div>
  );
}

const SORTS = [
  { id: "priority", label: "עדיפות" },
  { id: "sla",      label: "SLA" },
  { id: "balance",  label: "יתרה" },
  { id: "score",    label: "סיכוי גבייה" },
];
const PRIO_RANK = { crit: 0, high: 1, med: 2, low: 3 };

function Worklist({ onOpenCase, onRunNba }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("priority");

  const filtered = useMemo(() => {
    let r = WORKLIST.filter(c => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (onlyOverdue && !c.slaOverdue) return false;
      if (q && !`${c.name} ${c.id} ${c.tags.join(" ")}`.includes(q)) return false;
      return true;
    });
    const cmp = {
      priority: (a, b) => PRIO_RANK[a.priority] - PRIO_RANK[b.priority] || b.balance - a.balance,
      sla:      (a, b) => (b.slaOverdue - a.slaOverdue) || PRIO_RANK[a.priority] - PRIO_RANK[b.priority],
      balance:  (a, b) => b.balance - a.balance,
      score:    (a, b) => a.score - b.score,
    }[sortBy];
    return [...r].sort(cmp);
  }, [statusFilter, onlyOverdue, q, sortBy]);

  const kpi = useMemo(() => ({
    total: WORKLIST.filter(c => c.status !== "resolved").length,
    debt: WORKLIST.reduce((a, c) => a + c.balance, 0),
    overdue: WORKLIST.filter(c => c.slaOverdue).length,
    crit: WORKLIST.filter(c => c.priority === "crit").length,
  }), []);

  const statusTabs = [["all", "הכל"], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])];

  return (
    <div style={{ maxWidth: 1360, margin: "0 auto", width: "100%", padding: "20px 24px 40px", boxSizing: "border-box" }}>
      {/* heading + KPIs */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--teal-800)", letterSpacing: "-.01em" }}>תור עבודה</div>
          <div style={{ fontSize: 13.5, color: "var(--ink-muted)", marginTop: 2 }}>תיקי גבייה פעילים · ממוין לפי עדיפות ו-SLA</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "תיקים פעילים", val: kpi.total, color: "var(--teal-700)" },
            { label: "חריגות SLA", val: kpi.overdue, color: "var(--red)" },
            { label: "דחופים", val: kpi.crit, color: "var(--amber)" },
            { label: "סך חוב בתור", val: `₪${fmt(kpi.debt)}`, color: "var(--ink-800)" },
          ].map(k => (
            <div key={k.label} style={{ background: "var(--white)", border: "1px solid var(--ink-100)", borderRadius: 14,
              padding: "10px 16px", boxShadow: "var(--shadow-card)", minWidth: 92 }}>
              <div className="num" style={{ fontSize: 20, fontWeight: 800, color: k.color, lineHeight: 1.1 }}>{k.val}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* toolbar: status tabs + search + sort + overdue toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14,
        background: "var(--white)", border: "1px solid var(--ink-100)", borderRadius: 14, padding: "10px 12px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {statusTabs.map(([k, label]) => (
            <button key={k} data-focusring onClick={() => setStatusFilter(k)}
              style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "6px 13px", fontFamily: "var(--font)",
                fontSize: 13, fontWeight: 600, transition: "all .12s",
                background: statusFilter === k ? "var(--teal-500)" : "var(--ink-50)",
                color: statusFilter === k ? "#fff" : "var(--ink-600)" }}>{label}</button>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <button data-focusring onClick={() => setOnlyOverdue(o => !o)} aria-pressed={onlyOverdue}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${onlyOverdue ? "var(--red)" : "var(--ink-200)"}`,
            background: onlyOverdue ? "var(--err-bg)" : "#fff", color: onlyOverdue ? "var(--err-fg)" : "var(--ink-600)",
            borderRadius: 999, padding: "6px 12px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 12.5, fontWeight: 600 }}>
          <Icon name="alert" size={13} color={onlyOverdue ? "var(--err-fg)" : "var(--ink-400)"}/> רק חריגות SLA
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--ink-50)", border: "1px solid var(--ink-200)", borderRadius: 9, padding: "5px 10px" }}>
          <Icon name="search" size={15} color="var(--ink-400)"/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="חפש תיק…"
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--font)", fontSize: 13, width: 140, color: "var(--ink-800)" }}/>
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} title="מיון"
          style={{ appearance: "none", border: "1px solid var(--ink-200)", borderRadius: 9, padding: "7px 12px", background: "#fff",
            fontFamily: "var(--font)", fontSize: 13, color: "var(--ink-700)", cursor: "pointer" }}>
          {SORTS.map(s => <option key={s.id} value={s.id}>מיון: {s.label}</option>)}
        </select>
      </div>

      {/* case list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--ink-400)", fontSize: 14 }}>אין תיקים התואמים לסינון</div>
        )}
        {filtered.map(c => {
          const prio = PRIORITY[c.priority];
          const st = STATUS[c.status];
          return (
            <div key={c.id} onClick={() => onOpenCase(c)} data-focusring tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter") onOpenCase(c); }}
              style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--white)", cursor: "pointer",
                border: "1px solid var(--ink-100)", borderInlineStart: `4px solid ${prio.color}`, borderRadius: 14,
                padding: "13px 16px", boxShadow: "var(--shadow-card)", transition: "transform .12s, box-shadow .12s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}>
              {/* avatar */}
              <div style={{ width: 44, height: 44, borderRadius: 12, flex: "none", display: "grid", placeItems: "center",
                background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))", color: "#fff", fontWeight: 700, fontSize: 16 }}>
                {c.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              {/* identity */}
              <div style={{ minWidth: 0, width: 180 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-900)", whiteSpace: "nowrap" }}>{c.name}</span>
                  <Chip tone={st.tone} style={{ fontSize: 10 }}>{st.label}</Chip>
                </div>
                <div className="num" style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{c.id}</div>
              </div>
              {/* SLA */}
              <div style={{ width: 130, flex: "none" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600,
                  color: c.slaOverdue ? "var(--err-fg)" : "var(--ink-600)" }}>
                  <Icon name={c.slaOverdue ? "alert" : "clock"} size={13} color={c.slaOverdue ? "var(--err-fg)" : "var(--ink-400)"}/>
                  {c.sla}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.last}</div>
              </div>
              {/* score */}
              <div style={{ flex: "none" }}><ScoreBar score={c.score}/></div>
              {/* balance */}
              <div className="num" style={{ width: 110, textAlign: "end", flex: "none", fontSize: 16, fontWeight: 800,
                color: c.balance > 0 ? "var(--ink-900)" : "var(--ok-fg)" }}>
                {c.balance > 0 ? `₪${fmt(c.balance)}` : "0 ✓"}
              </div>
              {/* NBA */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                {c.nba.flow ? (
                  <button data-focusring onClick={e => { e.stopPropagation(); onRunNba(c); }}
                    title="הפעלת הפעולה המומלצת"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--teal-300)",
                      background: "var(--teal-50)", color: "var(--teal-700)", borderRadius: 999, padding: "7px 13px",
                      cursor: "pointer", fontFamily: "var(--font)", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                    <Icon name="sparkle" size={13} color="var(--teal-600)"/> {c.nba.label}
                  </button>
                ) : (
                  <span style={{ fontSize: 12, color: "var(--ink-400)", fontStyle: "italic" }}>{c.nba.label}</span>
                )}
              </div>
              {/* tasks + open */}
              {c.tasks > 0 && (
                <span title={`${c.tasks} משימות פתוחות`} style={{ display: "inline-flex", alignItems: "center", gap: 4, flex: "none",
                  background: "var(--warn-bg)", color: "var(--warn-fg)", borderRadius: 999, padding: "3px 9px", fontSize: 11.5, fontWeight: 700 }}>
                  <Icon name="notes" size={12} color="var(--warn-fg)"/> {c.tasks}
                </span>
              )}
              <Icon name="chevleft" size={18} color="var(--ink-300)" style={{ flex: "none" }}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// CaseTimeline — vertical process history; `live` events prepend to the seed.
function CaseTimeline({ seed = [], live = [] }) {
  const events = [...live, ...seed];
  const toneColor = { good: "var(--ok-fg)", warn: "var(--warn-fg)", crit: "var(--err-fg)", teal: "var(--teal-600)", gray: "var(--ink-400)" };
  const toneBg = { good: "var(--ok-bg)", warn: "var(--warn-bg)", crit: "var(--err-bg)", teal: "var(--teal-50)", gray: "var(--ink-100)" };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, flex: "none", display: "grid", placeItems: "center",
          background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))", boxShadow: "0 3px 8px rgba(var(--teal-rgb),.32)" }}>
          <Icon name="clock" size={17} color="#fff"/>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--teal-800)" }}>ציר זמן התיק</div>
          <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>היסטוריית התהליך · {events.length} אירועים</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {events.map((ev, i) => (
          <div key={ev.id ?? i} style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
              <span style={{ width: 32, height: 32, borderRadius: 999, display: "grid", placeItems: "center", flex: "none",
                background: toneBg[ev.tone] || "var(--ink-100)" }}>
                <Icon name={ev.icon || "clock"} size={16} color={toneColor[ev.tone] || "var(--ink-500)"}/>
              </span>
              {i < events.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 18, background: "var(--ink-100)" }}/>}
            </div>
            <div style={{ paddingBottom: 16, flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink-800)" }}>{ev.title}</span>
                <span className="num" style={{ fontSize: 11.5, color: "var(--ink-400)", whiteSpace: "nowrap", flex: "none" }}>{ev.time}</span>
              </div>
              {ev.detail && <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 2, lineHeight: 1.5 }}>{ev.detail}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Worklist, CaseTimeline };
