// App.jsx — composes the מצב חשבון workspace + state management
import React, { useState, useEffect } from 'react';
import { TopBar, FooterBand } from './chrome.jsx';
import { HeroZone, ActionBar } from './hero.jsx';
import { SubjectStrip, AllEntitiesView } from './content.jsx';
import { Worklist, CaseTimeline } from './worklist.jsx';
import { FloatingCopilot, CommandBar } from './panels.jsx';
import { CopilotPanel, NotesDrawer, DocsDrawer, InterestCalc, TasksDrawer } from './panels2.jsx';
import { WideTxnScreen } from './wide-txns.jsx';
import { FlowHost } from './flows.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle } from './tweaks-panel.jsx';
import { SectionHead, Card, Segmented, ToastHost, useMediaQuery } from './ui.jsx';
import { Icon } from './icons.jsx';
import { PAYER, TOTALS, SERVICES, TXNS, TXN_TYPES, SUBJECTS, DOCUMENTS, AI_INSIGHTS, QUICK_ACTIONS, NOTES, WORKLIST, STATUS, CASE_TIMELINE, TASKS } from './data.jsx';
import { ThemePicker, THEMES, generateThemeFromColor } from './table-utils.jsx';
import { usePersistedState, loadPref, savePref } from './storage.js';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2AA7B8",
  "aiProminence": "balanced",
  "density": "comfortable",
  "showCityscape": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const narrow = useMediaQuery("(max-width: 900px)"); // tablet / mobile breakpoint
  const [year, setYear] = useState(2026);
  const [entity, setEntity] = useState("all");      // selected subject filter
  const [density, setDensity] = usePersistedState("density", t.density);
  const selectSubject = (id) => setEntity(id);
  const [notes, setNotes] = useState(NOTES);

  // tweak: accent override (stays in the teal family)
  useEffect(() => {
    document.documentElement.style.setProperty("--teal-500", t.accent);
  }, [t.accent]);
  const ai = t.aiProminence; // subtle | balanced | bold

  const [cmdOpen, setCmdOpen] = useState(false);
  const [copilot, setCopilot] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [wideOpen, setWideOpen] = useState(false);
  const [wideNaxas, setWideNaxas] = useState(null);
  const [themeId, setThemeId] = usePersistedState("themeId", "teal");
  const [flow, setFlow] = useState(null);          // {id, ctx} active action flow
  const [caseEvents, setCaseEvents] = useState([]); // live case timeline events
  const [view, setView] = useState("worklist");    // "worklist" (queue) | "case"
  const [activeCase, setActiveCase] = useState(WORKLIST[0]);
  const [tasks, setTasks] = useState(TASKS);
  const [tasksOpen, setTasksOpen] = useState(false);
  const openTaskCount = tasks.filter(t => !t.done).length;
  const toggleTask = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addTask = (title, due) => setTasks(ts => [{ id: Date.now(), title, due: due || "", overdue: false, assignee: "שמעון עמר", priority: "med", caseName: activeCase.name, caseId: activeCase.id, done: false }, ...ts]);

  // Apply color theme dynamically (preset themes); custom handled below
  useEffect(() => {
    if (themeId === "custom") {
      const hex = loadPref("customHex", "#2AA7B8");
      Object.entries(generateThemeFromColor(hex)).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
      return;
    }
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    Object.entries(theme.vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [themeId]);

  // Apply custom color theme from full color picker (and remember it)
  const handleCustomTheme = (hex) => {
    savePref("customHex", hex);
    Object.entries(generateThemeFromColor(hex)).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  };

  // ⌘K / Ctrl+K + shortcuts
  // NOTE: we intentionally do NOT hijack Ctrl/⌘+P — overriding the browser's
  // native print is hostile to users (and screen-reader / a11y workflows).
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") { e.preventDefault(); setCmdOpen(o => !o); }
      else if ((e.metaKey || e.ctrlKey) && k === "j") { e.preventDefault(); setCopilot(o => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeSubject = SUBJECTS.find(s => s.id === entity) || null;
  const isDemoCase = activeCase.id === PAYER.payerNo;
  // case-aware payer identity + totals (demo case = full data; others = proportional split)
  const activePayer = isDemoCase ? PAYER : { ...PAYER, name: activeCase.name, payerNo: activeCase.id, status: STATUS[activeCase.status].label };
  const totals = isDemoCase ? TOTALS : (() => {
    const b = activeCase.balance, nominal = Math.round(b * 0.82), indexation = Math.round(b * 0.05);
    return { nominal, indexation, interest: b - nominal - indexation, get balance() { return b; } };
  })();
  const openCase = (c) => { setActiveCase(c); setEntity("all"); setView("case"); window.scrollTo(0, 0); };
  const runNba = (c) => { setActiveCase(c); openFlow(c.nba.flow, { balance: c.balance, payerName: c.name, subtitle: `${c.name} · ${c.id}` }); };

  // open a guided action flow with payer context
  const openFlow = (id, extra = {}) => setFlow({ id, ctx: {
    balance: totals.balance, payerName: PAYER.name,
    subtitle: `${PAYER.name} · ${PAYER.payerNo}`, ...extra } });

  // a flow finished → record a case-timeline event + note + toast
  const completeFlow = (ev) => {
    const now = new Date();
    const stamp = now.toLocaleDateString("he-IL") + " " + now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    setCaseEvents(prev => [{ ...ev, id: now.getTime(), time: stamp }, ...prev]);
    addNote(`${ev.title} — ${ev.detail}`);
    window.muToast(ev.title, ev.icon, ev.tone === "crit" ? "error" : ev.tone === "warn" ? "warn" : "success");
    // flows that need follow-up auto-create a task
    const followUp = { arrangement: "מעקב תשלום ראשון בהסדר", letter: "מעקב תגובת המשלם למכתב", enforce: "מעקב הליך אכיפה" }[ev.type];
    if (followUp) setTasks(ts => [{ id: now.getTime() + 1, title: followUp, due: "", overdue: false, assignee: "שמעון עמר", priority: "med", caseName: activeCase.name, caseId: activeCase.id, done: false }, ...ts]);
  };

  const handlers = {
    onPay: () => openFlow("payment"),
    onNotes: () => setNotesOpen(true),
    onDocs: () => setDocsOpen(true),
    onEnforce: () => openFlow("enforce"),
    onCopilot: () => setCopilot(true),
    onCalc: () => setCalcOpen(true),
    onFlow: (id) => id && openFlow(id),   // agentic: AI insight / copilot → run a flow
  };

  const runCommand = (item) => {
    setCmdOpen(false);
    const map = {
      pay: () => openFlow("payment"), calc: () => setCalcOpen(true), print: () => window.muToast("מכין הדפסת מצב חשבון…", "print"),
      enforce: () => openFlow("enforce"), notes: () => setNotesOpen(true), docs: () => setDocsOpen(true),
      letter: () => openFlow("letter"), arrangement: () => openFlow("arrangement"),
    };
    if (map[item.id]) map[item.id]();
    else window.muToast("נבחר: " + item.label);
  };

  // route every action id (quick-actions + L2 toolbar icons) to a real flow
  const ACTION_TO_FLOW = {
    update_arrangement: "arrangement", arrangement: "arrangement", card: "arrangement",
    credit_charge: "credit", receipt: "credit",
    discounts: "discount", wallet: "discount",
    swap_holders: "holder", user: "holder",
    letter: "letter", send: "letter",
    enforce: "enforce", shield: "enforce", pay: "payment",
  };
  const runAction = (a) => {
    const flowId = ACTION_TO_FLOW[a.id];
    if (flowId) return openFlow(flowId);
    if (a.id === "view_refs" || a.id === "docs") return setDocsOpen(true);
    if (a.id === "interest" || a.id === "calc") return setCalcOpen(true);
    if (a.id === "notes") return setNotesOpen(true);
    if (a.id === "summary" || a.id === "sigma") return window.muToast("נפתח סיכום כספי למשלם", "sigma");
    if (a.id === "print") return window.muToast("מכין הדפסה…", "print");
    if (a.id === "scan") return window.muToast("נפתח חלון סריקת מסמכים", "scan");
    window.muToast(a.label || "פעולה", a.icon);
  };

  const addNote = (text) => setNotes(n => [{ id: Date.now(), author: "שמעון עמר", role: "פקיד גבייה", date: new Date().toLocaleDateString("he-IL") + " " + new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }), text }, ...n]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar onCommand={() => setCmdOpen(true)}
          onNav={(id) => { if (id === "home" || id === "back") { setView("worklist"); return; } window.muToast({ forward: "ניווט קדימה", history: "היסטוריית מסכים", fav: "נוסף למועדפים" }[id] || "ניווט", id === "fav" ? "star" : "home"); }}
          year={year} breadcrumb={view === "worklist"
            ? { name: "תור עבודה", no: `${WORKLIST.filter(c => c.status !== "resolved").length} תיקים` }
            : { name: activePayer.name, no: activePayer.payerNo }}/>

      {view === "worklist" ? (
        <main id="main" style={{ flex: 1 }}>
          <Worklist onOpenCase={openCase} onRunNba={runNba} onOpenTasks={() => setTasksOpen(true)} taskCount={openTaskCount}/>
          <FloatingCopilot onOpen={() => setCopilot(true)} insights={AI_INSIGHTS}/>
        </main>
      ) : (
      <>
      {/* back-to-queue ribbon */}
      <div style={{ maxWidth: 1360, margin: "0 auto", width: "100%", padding: "12px 24px 0", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 12 }}>
        <button data-focusring onClick={() => setView("worklist")}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--ink-200)", background: "var(--white)",
            borderRadius: 999, padding: "6px 14px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, color: "var(--teal-700)" }}>
          <Icon name="chevright" size={15} color="var(--teal-600)"/> חזרה לתור העבודה
        </button>
        <span style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>
          תיק <b className="num" style={{ color: "var(--ink-700)" }}>{activePayer.payerNo}</b>
          {!isDemoCase && <span style={{ marginInlineStart: 8, fontSize: 11, background: "var(--warn-bg)", color: "var(--warn-fg)", borderRadius: 999, padding: "2px 9px", fontWeight: 600 }}>נתוני דמו מוצגים למבנה התיק</span>}
        </span>
      </div>

      {/* Next-Best-Action banner for the open case */}
      {activeCase.nba && activeCase.nba.flow && (
        <div style={{ maxWidth: 1360, margin: "10px auto 0", width: "100%", padding: "0 24px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 14,
            background: "linear-gradient(135deg,rgba(var(--teal-rgb),.10),rgba(var(--teal-rgb),.03))",
            border: "1px solid var(--teal-200)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, flex: "none", display: "grid", placeItems: "center",
              background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))", boxShadow: "0 3px 8px rgba(var(--teal-rgb),.32)" }}>
              <Icon name="sparkle" size={17} color="#fff"/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--teal-600)", letterSpacing: ".02em" }}>פעולה מומלצת ע״י AI</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-800)" }}>{activeCase.nba.label}</div>
            </div>
            <button data-focusring onClick={() => openFlow(activeCase.nba.flow, { balance: activeCase.balance, payerName: activePayer.name, subtitle: `${activePayer.name} · ${activePayer.payerNo}` })}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, flex: "none", border: "none", cursor: "pointer",
                borderRadius: 999, padding: "9px 18px", fontFamily: "var(--font)", fontSize: 13.5, fontWeight: 700, color: "#fff",
                background: "linear-gradient(135deg,var(--teal-500),var(--teal-700))", boxShadow: "0 4px 12px rgba(var(--teal-rgb),.32)" }}>
              הפעל <Icon name="chevleft" size={15} color="#fff"/>
            </button>
          </div>
        </div>
      )}

      {/* hero atmosphere wash */}
      <div style={{ background: "var(--wash-hero)", borderBottom: "1px solid var(--ink-100)",
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginTop: 10 }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "20px 24px 24px" }}>
          <HeroZone p={activePayer} totals={totals} year={year} notesCount={notes.length} docsCount={DOCUMENTS.length} insights={AI_INSIGHTS} handlers={handlers} showStrip={ai !== "subtle"} narrow={narrow} onYear={setYear}/>
        </div>
      </div>

      <div style={{ maxWidth: 1360, margin: "0 auto", width: "100%", padding: "16px 24px 0", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1 }}><ActionBar notesCount={notes.length} year={year} onYear={setYear} handlers={handlers}/></div>
        <button data-focusring onClick={() => setTasksOpen(true)} title="משימות"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid var(--ink-200)", background: "var(--white)",
            borderRadius: 999, padding: "6px 13px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, color: "var(--ink-700)" }}>
          <Icon name="notes" size={15} color="var(--teal-600)"/> משימות
          {openTaskCount > 0 && <span className="num" style={{ background: "var(--amber)", color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "1px 7px" }}>{openTaskCount}</span>}
        </button>
        <ThemePicker activeId={themeId} onChange={setThemeId} onCustom={handleCustomTheme}/>
      </div>

      {/* main — full width, sidebar removed; AI is floating */}
      <main id="main" style={{ flex: 1, maxWidth: 1360, margin: "0 auto", width: "100%", padding: "18px 24px 0", boxSizing: "border-box", scrollMarginTop: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <SectionHead title="ישויות ונושאים" sub={`מס׳ משלם ${activePayer.payerNo} · ת.ז ${PAYER.taz}`}/>
            <SubjectStrip subjects={SUBJECTS} selected={entity} onSelect={selectSubject}/>
          </div>
          <Card pad={0} style={{ overflow: "visible" }}>
            <div style={{ padding: "18px 20px 0" }}>
              <SectionHead
                title={entity === "all" ? "כל הישויות" : activeSubject ? activeSubject.name : "ישויות"}
                icon="sigma"
                sub={entity === "all"
                  ? `${SUBJECTS.reduce((a, s) => a + s.count, 0)} ישויות · לחץ ישות לפעולות ותנועות`
                  : activeSubject ? `${activeSubject.count} ${activeSubject.unit} · לחץ ישות לפרטים` : ""}
                right={
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button data-focusring onClick={() => setWideOpen(true)} title="פתח מסך תנועות מלא"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--teal-500)",
                        background: "var(--teal-50)", color: "var(--teal-700)", borderRadius: 999, padding: "6px 13px",
                        cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600 }}>
                      <Icon name="receipt" size={15} color="var(--teal-600)"/> תנועות למשלם
                    </button>
                    <Segmented size="sm" value={density} onChange={setDensity}
                      options={[{ value: "comfortable", label: "מרווח" }, { value: "compact", label: "צפוף" }]}/>
                  </div>
                }/>
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              <AllEntitiesView
                subjects={SUBJECTS}
                filterSubject={activeSubject}
                density={density}
                txnTypes={TXN_TYPES}
                onAction={runAction}
                onOpenWide={(naxas) => { setWideNaxas(naxas || null); setWideOpen(true); }}/>
            </div>
          </Card>

          {/* case process timeline (live flow events prepend) */}
          <Card pad={20} style={{ overflow: "visible" }}>
            <CaseTimeline seed={CASE_TIMELINE} live={caseEvents}/>
          </Card>
        </div>

        {/* floating AI copilot trigger — bottom-left corner */}
        <FloatingCopilot onOpen={() => setCopilot(true)} insights={AI_INSIGHTS}/>
      </main>
      </>
      )}

      {t.showCityscape ? <FooterBand/> : <div style={{ height: 40 }}/>}

      {/* overlays */}
      <CommandBar open={cmdOpen} onClose={() => setCmdOpen(false)} onRun={runCommand}/>
      <CopilotPanel open={copilot} onClose={() => setCopilot(false)} onRunFlow={(id) => openFlow(id)}/>
      <NotesDrawer open={notesOpen} onClose={() => setNotesOpen(false)} notes={notes} onAdd={addNote}/>
      <DocsDrawer open={docsOpen} onClose={() => setDocsOpen(false)} docs={DOCUMENTS}/>
      <TasksDrawer open={tasksOpen} onClose={() => setTasksOpen(false)} tasks={tasks} onToggle={toggleTask} onAdd={addTask}/>
      <InterestCalc open={calcOpen} onClose={() => setCalcOpen(false)} baseNominal={TOTALS.nominal}/>
      <WideTxnScreen open={wideOpen} onClose={() => { setWideOpen(false); setWideNaxas(null); }} payer={PAYER} filterNaxas={wideNaxas}/>
      <FlowHost flow={flow} onClose={() => setFlow(null)} onComplete={completeFlow}/>
      <ToastHost/>

      <TweaksPanel>
        <TweakSection label="שכבת ה-AI"/>
        <TweakRadio label="בולטות AI" value={t.aiProminence}
          options={[{ value: "subtle", label: "מינימלי" }, { value: "balanced", label: "מאוזן" }, { value: "bold", label: "בולט" }]}
          onChange={v => setTweak("aiProminence", v)}/>
        <TweakSection label="נתונים"/>
        <TweakRadio label="צפיפות טבלה" value={t.density}
          options={[{ value: "comfortable", label: "מרווח" }, { value: "compact", label: "צפוף" }]}
          onChange={v => setTweak("density", v)}/>
        <TweakSection label="מיתוג"/>
        <TweakColor label="גוון ראשי" value={t.accent}
          options={["#2AA7B8", "#1D8F9F", "#2E9CC4", "#1aa0a0"]}
          onChange={v => setTweak("accent", v)}/>
        <TweakToggle label="קו רקיע בתחתית" value={t.showCityscape} onChange={v => setTweak("showCityscape", v)}/>
      </TweaksPanel>
    </div>
  );
}

export default App;
