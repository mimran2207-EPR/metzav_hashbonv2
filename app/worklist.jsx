// worklist.jsx — task-centric BPM landing screen (per-clerk task board)
// + CaseQueue (the full payer list, accessible as secondary view)
// + CaseTimeline (process history of the open case).
//
// The primary view is the clerk's daily work queue: tasks sorted by urgency,
// each linked to a payer case and showing a one-click action button.
// The secondary view is the case queue (all payers with debt).
import React, { useState, useMemo } from 'react';
import { Icon } from './icons.jsx';
import { Chip } from './ui.jsx';
import { WORKLIST, STATUS, TASK_TYPES, CLERKS, CURRENT_CLERK, fmt } from './data.jsx';
import { parseDMY, TODAY } from './dates.js';

// ── helpers ────────────────────────────────────────────────────────────────
const PRIO = {
  crit: { rank: 0, color: "var(--red)",   bg: "#FEF2F2", label: "דחוף" },
  high: { rank: 1, color: "var(--amber)", bg: "#FFFBEB", label: "גבוה" },
  med:  { rank: 2, color: "var(--teal-500)", bg: "var(--teal-50)", label: "בינוני" },
  low:  { rank: 3, color: "var(--ink-400)", bg: "var(--ink-50)", label: "נמוך" },
};
const CASE_PRIORITY = {
  crit: { label: "דחוף", color: "var(--red)", bg: "var(--err-bg)" },
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

// ── TaskBoard (primary landing: per-clerk task queue) ──────────────────────
const VIEWS = [
  { id: "mine",   label: "המשימות שלי" },
  { id: "team",   label: "כל הצוות" },
  { id: "cases",  label: "תור תיקים" },
];
const PERIODS = [
  { id: "overdue", label: "חריגות" },
  { id: "today",   label: "היום" },
  { id: "week",    label: "השבוע" },
  { id: "all",     label: "הכל" },
];

function TaskBoard({ tasks, onToggle, onRunFlow, onOpenCase, onOpenTasks }) {
  const [view, setView] = useState("mine");
  const [period, setPeriod] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [clerkFilter, setClerkFilter] = useState(CURRENT_CLERK.id);

  const taskTypes = useMemo(() => ["all", ...new Set(tasks.map(t => t.type))], [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (view === "mine" && t.assignee !== CURRENT_CLERK.id) return false;
      if (view === "team") { /* all */ }
      if (view === "cases") return false; // handled by CaseQueue
      if (period === "overdue" && !t.overdue) return false;
      if (period === "today" && !t.overdue && parseDMY(t.due) > TODAY) return false;
      if (period === "week" && t.done) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (t.done && period !== "all") return false;
      return true;
    }).sort((a, b) => (PRIO[a.priority]?.rank ?? 9) - (PRIO[b.priority]?.rank ?? 9));
  }, [tasks, view, period, typeFilter]);

  const openCount = tasks.filter(t => !t.done && t.assignee === CURRENT_CLERK.id).length;
  const overdueCount = tasks.filter(t => !t.done && t.overdue && t.assignee === CURRENT_CLERK.id).length;
  const teamCount = tasks.filter(t => !t.done).length;

  if (view === "cases") {
    return (
      <div style={{ maxWidth: 1360, margin: "0 auto", width: "100%", padding: "0 24px 40px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {VIEWS.map(v => (
            <button key={v.id} data-focusring onClick={() => setView(v.id)}
              style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "7px 16px", fontFamily: "var(--font)",
                fontSize: 13.5, fontWeight: 600, transition: "all .12s",
                background: view === v.id ? "var(--teal-600)" : "var(--ink-50)", color: view === v.id ? "#fff" : "var(--ink-600)" }}>
              {v.label}
              {v.id === "mine" && openCount > 0 && <span className="num" style={{ marginInlineStart: 6, background: view === v.id ? "rgba(255,255,255,.3)" : "var(--amber)", color: view === v.id ? "#fff" : "#fff", borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{openCount}</span>}
            </button>
          ))}
        </div>
        <CaseQueue onOpenCase={onOpenCase} onRunNba={(c) => { onOpenCase(c); }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1360, margin: "0 auto", width: "100%", padding: "0 24px 40px", boxSizing: "border-box" }}>
      {/* heading */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 17 }}>
              {CURRENT_CLERK.avatar || CURRENT_CLERK.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--teal-800)", letterSpacing: "-.01em" }}>
                {view === "mine" ? `המשימות של ${CURRENT_CLERK.name}` : "משימות הצוות"}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 2 }}>{CURRENT_CLERK.role} · מצב חשבון</div>
            </div>
          </div>
        </div>
        {/* KPI chips */}
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "פתוחות (שלי)", val: openCount, color: "var(--teal-700)" },
            { label: "חריגות SLA", val: overdueCount, color: "var(--red)" },
            { label: "כל הצוות", val: teamCount, color: "var(--ink-600)" },
          ].map(k => (
            <div key={k.label} style={{ background: "var(--white)", border: "1px solid var(--ink-100)", borderRadius: 14,
              padding: "10px 16px", boxShadow: "var(--shadow-card)", minWidth: 80, textAlign: "center" }}>
              <div className="num" style={{ fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1.1 }}>{k.val}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* toolbar: view tabs + period + type filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14,
        background: "var(--white)", border: "1px solid var(--ink-100)", borderRadius: 14, padding: "10px 12px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
          {VIEWS.map(v => (
            <button key={v.id} data-focusring onClick={() => setView(v.id)}
              style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "6px 14px", fontFamily: "var(--font)",
                fontSize: 13, fontWeight: 600, transition: "all .12s",
                background: view === v.id ? "var(--teal-500)" : "var(--ink-50)", color: view === v.id ? "#fff" : "var(--ink-600)" }}>
              {v.label}
              {v.id === "mine" && openCount > 0 && (
                <span className="num" style={{ marginInlineStart: 5, background: view==="mine"?"rgba(255,255,255,.3)":"var(--amber)", color:"#fff", borderRadius:999, padding:"1px 7px", fontSize:11, fontWeight:700 }}>{openCount}</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ width: 1, height: 28, background: "var(--ink-200)", margin: "0 4px" }}/>
        {/* period filter */}
        <div style={{ display: "flex", gap: 3 }}>
          {PERIODS.map(p => (
            <button key={p.id} data-focusring onClick={() => setPeriod(p.id)}
              style={{ border: `1px solid ${period===p.id?"var(--teal-400)":"var(--ink-200)"}`, cursor: "pointer", borderRadius: 999, padding: "5px 12px", fontFamily: "var(--font)",
                fontSize: 12.5, fontWeight: 600, transition: "all .12s",
                background: period === p.id ? "var(--teal-50)" : "transparent", color: period === p.id ? "var(--teal-700)" : "var(--ink-600)" }}>
              {p.label}
              {p.id === "overdue" && overdueCount > 0 && <span className="num" style={{ marginInlineStart:5, background:"var(--red)", color:"#fff", borderRadius:999, padding:"1px 6px", fontSize:10, fontWeight:700 }}>{overdueCount}</span>}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        {/* type filter */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ appearance: "none", border: "1px solid var(--ink-200)", borderRadius: 9, padding: "6px 12px", background: "#fff",
            fontFamily: "var(--font)", fontSize: 13, color: "var(--ink-700)", cursor: "pointer" }}>
          <option value="all">כל הסוגים</option>
          {Object.entries(TASK_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* task list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--ink-400)", fontSize: 15 }}>אין משימות להצגה לפי הסינון 🎉</div>
        )}
        {filtered.map((t, i) => {
          const tt = TASK_TYPES[t.type] || TASK_TYPES.followup;
          const pr = PRIO[t.priority] || PRIO.low;
          const clerk = CLERKS.find(c => c.id === t.assignee) || { name: t.assignee };
          return (
            <div key={t.id} className="mu-rise" style={{ animationDelay: `${i * 28}ms`,
              display: "flex", alignItems: "flex-start", gap: 13, background: t.done ? "var(--ink-50)" : "var(--white)",
              border: "1px solid var(--ink-100)", borderInlineStart: `4px solid ${pr.color}`, borderRadius: 14,
              padding: "13px 16px", boxShadow: "var(--shadow-card)", opacity: t.done ? 0.65 : 1, transition: "opacity .12s" }}>

              {/* task type icon */}
              <div style={{ width: 36, height: 36, borderRadius: 10, flex: "none", display: "grid", placeItems: "center",
                background: t.done ? "var(--ink-100)" : tt.bg }}>
                <Icon name={tt.icon} size={18} color={t.done ? "var(--ink-400)" : tt.color}/>
              </div>

              {/* main content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: t.done ? "var(--ink-400)" : "var(--ink-900)", textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
                  <Chip tone={t.done ? "gray" : "teal"} style={{ fontSize: 10.5, flexShrink: 0 }}>{tt.label}</Chip>
                  {t.overdue && !t.done && <Chip tone="red" style={{ fontSize: 10.5, flexShrink: 0 }}>חריג SLA</Chip>}
                </div>

                {/* case link + balance + note */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                  <button data-focusring onClick={() => onOpenCase(WORKLIST.find(w => w.id === t.caseId) || { id: t.caseId, name: t.caseName, balance: t.balance, status: "active", priority: "med" })}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "none", background: "transparent", cursor: "pointer",
                      fontFamily: "var(--font)", padding: 0, color: "var(--teal-600)" }}>
                    <Icon name="user" size={13} color="var(--teal-500)"/>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{t.caseName}</span>
                  </button>
                  {t.balance > 0 && (
                    <span className="num" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-700)" }}>₪{fmt(t.balance)}</span>
                  )}
                  {t.note && <span style={{ fontSize: 12, color: "var(--ink-muted)", fontStyle: "italic" }}>{t.note}</span>}
                </div>

                {/* meta: due + assignee */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, fontSize: 11.5, color: "var(--ink-muted)" }}>
                  {t.due && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Icon name="clock" size={12} color={t.overdue && !t.done ? "var(--red)" : "var(--ink-400)"}/>
                      <span className="num" style={{ fontWeight: t.overdue && !t.done ? 700 : 500, color: t.overdue && !t.done ? "var(--red)" : "var(--ink-muted)" }}>{t.due}</span>
                    </span>
                  )}
                  <span>·</span>
                  <span>{clerk.name}</span>
                </div>
              </div>

              {/* right: done checkbox + execute flow */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flex: "none" }}>
                {tt.flow && !t.done && (
                  <button data-focusring onClick={() => onRunFlow(tt.flow, t)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer", borderRadius: 999,
                      padding: "7px 14px", fontFamily: "var(--font)", fontSize: 13, fontWeight: 700, color: "#fff",
                      background: `linear-gradient(135deg,${tt.color},${tt.color}cc)`, boxShadow: "0 3px 10px rgba(0,0,0,.15)",
                      whiteSpace: "nowrap" }}>
                    <Icon name={tt.icon} size={14} color="#fff"/> בצע
                  </button>
                )}
                <button data-focusring onClick={() => onToggle(t.id)} aria-pressed={t.done} aria-label="סמן בוצע"
                  style={{ width: 28, height: 28, borderRadius: 8, cursor: "pointer", display: "grid", placeItems: "center",
                    border: `1.5px solid ${t.done ? "var(--ok-fg)" : "var(--ink-300)"}`, background: t.done ? "var(--ok-fg)" : "#fff",
                    transition: "all .15s" }}>
                  {t.done && <Icon name="check" size={14} color="#fff"/>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CaseQueue (secondary: all payer-cases) ─────────────────────────────────
const SORTS = [
  { id: "priority", label: "עדיפות" },
  { id: "sla",      label: "SLA" },
  { id: "balance",  label: "יתרה" },
  { id: "score",    label: "סיכוי גבייה" },
];
const PRIO_RANK = { crit: 0, high: 1, med: 2, low: 3 };
function CaseQueue({ onOpenCase, onRunNba }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const statusTabs = [["all", "הכל"], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])];
  const filtered = useMemo(() => {
    let r = WORKLIST.filter(c => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (q && !`${c.name} ${c.id}`.includes(q)) return false;
      return true;
    });
    const cmp = {
      priority: (a, b) => PRIO_RANK[a.priority] - PRIO_RANK[b.priority],
      sla:      (a, b) => (b.slaOverdue - a.slaOverdue),
      balance:  (a, b) => b.balance - a.balance,
      score:    (a, b) => a.score - b.score,
    }[sortBy];
    return [...r].sort(cmp);
  }, [statusFilter, q, sortBy]);

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--teal-800)", marginBottom: 14 }}>תור תיקים ({WORKLIST.filter(c=>c.status!=="resolved").length} פעילים)</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12,
        background: "var(--white)", border: "1px solid var(--ink-100)", borderRadius: 14, padding: "10px 12px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {statusTabs.map(([k, l]) => (
            <button key={k} data-focusring onClick={() => setStatusFilter(k)}
              style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "5px 11px", fontFamily: "var(--font)",
                fontSize: 12.5, fontWeight: 600, transition: "all .12s",
                background: statusFilter===k?"var(--teal-500)":"var(--ink-50)", color: statusFilter===k?"#fff":"var(--ink-600)" }}>{l}</button>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--ink-50)", border: "1px solid var(--ink-200)", borderRadius: 9, padding: "5px 10px" }}>
          <Icon name="search" size={14} color="var(--ink-400)"/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="חפש תיק…"
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--font)", fontSize: 13, width: 120, color: "var(--ink-800)" }}/>
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ appearance: "none", border: "1px solid var(--ink-200)", borderRadius: 9, padding: "6px 12px", background: "#fff",
            fontFamily: "var(--font)", fontSize: 13, color: "var(--ink-700)", cursor: "pointer" }}>
          {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((c, i) => {
          const prio = CASE_PRIORITY[c.priority];
          const st = STATUS[c.status];
          return (
            <div key={c.id} onClick={() => onOpenCase(c)} data-focusring tabIndex={0}
              role="button"
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenCase(c); } }}
              className="mu-rise" style={{ animationDelay: `${i*28}ms`, display: "flex", alignItems: "center", gap: 12,
                background: "var(--white)", cursor: "pointer", border: "1px solid var(--ink-100)",
                borderInlineStart: `4px solid ${prio.color}`, borderRadius: 12, padding: "11px 14px",
                boxShadow: "var(--shadow-card)", transition: "transform .12s, box-shadow .12s" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="var(--shadow-md)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="var(--shadow-card)"; }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, flex: "none", display: "grid", placeItems: "center",
                background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                {c.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
              </div>
              <div style={{ minWidth: 0, width: 160 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-900)", whiteSpace: "nowrap" }}>{c.name}</span>
                  <Chip tone={st.tone} style={{ fontSize: 10 }}>{st.label}</Chip>
                </div>
                <div className="num" style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 1 }}>{c.id}</div>
              </div>
              <div style={{ flex: "none", width: 110, fontSize: 12.5, fontWeight: 600, color: c.slaOverdue?"var(--err-fg)":"var(--ink-muted)" }}>
                <Icon name={c.slaOverdue?"alert":"clock"} size={12} color={c.slaOverdue?"var(--err-fg)":"var(--ink-400)"}/> {c.sla}
              </div>
              <div style={{ flex: "none" }}><ScoreBar score={c.score}/></div>
              <div className="num" style={{ width: 100, textAlign: "end", flex: "none", fontSize: 15, fontWeight: 800,
                color: c.balance>0?"var(--ink-900)":"var(--ok-fg)" }}>{c.balance>0?`₪${fmt(c.balance)}`:"0 ✓"}</div>
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                {c.nba.flow && (
                  <button data-focusring onClick={e => { e.stopPropagation(); onRunNba(c); }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid var(--teal-300)",
                      background: "var(--teal-50)", color: "var(--teal-700)", borderRadius: 999, padding: "6px 12px",
                      cursor: "pointer", fontFamily: "var(--font)", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                    <Icon name="sparkle" size={12} color="var(--teal-600)"/> {c.nba.label}
                  </button>
                )}
              </div>
              <Icon name="chevleft" size={16} color="var(--ink-300)" style={{ flex: "none" }}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CaseTimeline ───────────────────────────────────────────────────────────
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

export { TaskBoard, CaseQueue, CaseTimeline };
