// App.jsx — composes the מצב חשבון workspace + state management
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { TopBar, FooterBand } from './chrome.jsx';
import { HeroZone, ActionBar } from './hero.jsx';
import { SubjectStrip, AllEntitiesView } from './content.jsx';
import { TaskBoard, CaseTimeline } from './worklist.jsx';
import { FloatingCopilot, CommandBar } from './panels.jsx';
// Heavy, open-on-demand overlays — code-split so they don't bloat initial load.
const CopilotPanel  = lazy(() => import('./panels2.jsx').then(m => ({ default: m.CopilotPanel })));
const NotesDrawer   = lazy(() => import('./panels2.jsx').then(m => ({ default: m.NotesDrawer })));
const DocsDrawer    = lazy(() => import('./panels2.jsx').then(m => ({ default: m.DocsDrawer })));
const InterestCalc  = lazy(() => import('./panels2.jsx').then(m => ({ default: m.InterestCalc })));
const TasksDrawer   = lazy(() => import('./panels2.jsx').then(m => ({ default: m.TasksDrawer })));
const WideTxnScreen = lazy(() => import('./wide-txns.jsx').then(m => ({ default: m.WideTxnScreen })));
const FlowHost      = lazy(() => import('./flows.jsx').then(m => ({ default: m.FlowHost })));
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle } from './tweaks-panel.jsx';
import { SectionHead, Card, Segmented, ToastHost, useMediaQuery } from './ui.jsx';
import { Icon } from './icons.jsx';
import { PAYER, TOTALS, SERVICES, TXNS, TXN_TYPES, SUBJECTS, DOCUMENTS, AI_INSIGHTS, QUICK_ACTIONS, NOTES, WORKLIST, STATUS, CASE_TIMELINE, TASKS, TASK_TYPES, CURRENT_CLERK, buildCaseData, HOLDER_EXTRA, YEAR_BALANCES, CURRENT_YEAR } from './data.jsx';
import { THEMES, generateThemeFromColor } from './table-utils.jsx';
import { usePersistedState, loadPref, savePref } from './storage.js';
import { toast } from './toast.js';

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
  const [view, setView] = useState("case");         // "case" (account status) | "worklist" (tasks)
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

  const isDemoCase = activeCase.id === PAYER.payerNo;
  const caseData = useMemo(() => buildCaseData(activeCase, year), [activeCase, year]);
  const caseSubjects = caseData.subjects;
  const activeSubject = caseSubjects.find(s => s.id === entity) || null;
  // case-aware payer identity + totals (demo case = full data; others = proportional split)
  const activePayer = isDemoCase ? PAYER : { ...PAYER, name: activeCase.name, payerNo: activeCase.id, status: STATUS[activeCase.status].label };
  // year-aware totals: the demo payer's open year shows the real figures; a closed year shows
  // that year's closing balance. Other cases keep their single balance regardless of year.
  const totals = (isDemoCase && year === CURRENT_YEAR) ? TOTALS : (() => {
    const b = isDemoCase ? (YEAR_BALANCES[year] ?? 0) : activeCase.balance;
    const nominal = Math.round(b * 0.82), indexation = Math.round(b * 0.05);
    return { nominal, indexation, interest: b - nominal - indexation, get balance() { return b; } };
  })();
  const openCase = (c) => { setActiveCase(c); setEntity("all"); setView("case"); window.scrollTo(0, 0); };
  // open a holder's card. The demo payer keeps their full multi-subject account (home); every
  // other holder opens the SAME real property — same id, data and holder chain — under their name,
  // so the chain (and who is historical) stays identical from either side.
  const openHolder = (h, entity, propBalance) => {
    if (!h) return;
    if (h.payerNo === PAYER.payerNo || !entity?.subItem)
      openCase(WORKLIST.find(c => c.id === h.payerNo) || { id: h.payerNo, name: h.name, balance: propBalance ?? h.balance ?? 0, status: "active" });
    else
      openCase({ id: h.payerNo, name: h.name, balance: propBalance ?? h.balance ?? 0, status: "active", realSubject: entity.subject, realSubItem: entity.subItem, extraSubItems: HOLDER_EXTRA[h.payerNo] });
  };
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
    toast(ev.title, ev.icon, ev.tone === "crit" ? "error" : ev.tone === "warn" ? "warn" : "success");
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
    // payer/property search results open that payer's account status
    if (item.group === "משלמים" || item.group === "היסטוריה") {
      const match = WORKLIST.find(c => item.label.includes(c.name)) || WORKLIST[0];
      return openCase(match);
    }
    const map = {
      pay: () => openFlow("payment"), calc: () => setCalcOpen(true), print: () => toast("מכין הדפסת מצב חשבון…", "print"),
      enforce: () => openFlow("enforce"), notes: () => setNotesOpen(true), docs: () => setDocsOpen(true),
      letter: () => openFlow("letter"), arrangement: () => openFlow("arrangement"),
    };
    if (map[item.id]) map[item.id]();
    else toast("נבחר: " + item.label);
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
    if (a.id === "summary" || a.id === "sigma") return toast("נפתח סיכום כספי למשלם", "sigma");
    if (a.id === "print") return toast("מכין הדפסה…", "print");
    if (a.id === "scan") return toast("נפתח חלון סריקת מסמכים", "scan");
    toast(a.label || "פעולה", a.icon);
  };

  const addNote = (text) => setNotes(n => [{ id: Date.now(), author: "שמעון עמר", role: "פקיד גבייה", date: new Date().toLocaleDateString("he-IL") + " " + new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }), text }, ...n]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar onCommand={() => setCmdOpen(true)}
          onNav={(id) => { if (id === "back") { if (view === "case") setCmdOpen(true); else setView("case"); } }}
          view={view} onSwitchView={setView} taskCount={openTaskCount}
          themeId={themeId} onThemeChange={setThemeId} onCustomTheme={handleCustomTheme}
          breadcrumb={view === "worklist"
            ? { name: "משימות שלי", no: `${openTaskCount} פתוחות` }
            : { name: activePayer.name, no: activePayer.payerNo }}/>

      {view === "worklist" ? (
        <main id="main" style={{ flex: 1, paddingTop: 20 }}>
          <TaskBoard
            tasks={tasks}
            onToggle={toggleTask}
            onRunFlow={(flowId, task) => {
              // open the payer's case first, then run the flow
              const matchedCase = WORKLIST.find(c => c.id === task.caseId) || { id: task.caseId, name: task.caseName, balance: task.balance, status: "active", priority: "med", nba: {} };
              openCase(matchedCase);
              setTimeout(() => openFlow(flowId, { balance: task.balance, payerName: task.caseName, subtitle: `${task.caseName} · ${task.caseId}` }), 80);
            }}
            onOpenCase={openCase}
            onOpenTasks={() => setTasksOpen(true)}/>
          <FloatingCopilot onOpen={() => setCopilot(true)} insights={AI_INSIGHTS}/>
        </main>
      ) : (
      <>
      {/* hero atmosphere wash */}
      <div style={{ background: "var(--wash-hero)", borderBottom: "1px solid var(--ink-100)",
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginTop: 10 }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "20px 24px 24px" }}>
          <HeroZone p={activePayer} totals={totals} year={year} notesCount={notes.length} docsCount={DOCUMENTS.length} insights={AI_INSIGHTS} handlers={handlers} showStrip={ai !== "subtle"} narrow={narrow} onYear={setYear}/>
        </div>
      </div>

      <div style={{ maxWidth: 1360, margin: "0 auto", width: "100%", padding: "16px 24px 0", boxSizing: "border-box" }}>
        <ActionBar notesCount={notes.length} handlers={handlers}/>
      </div>

      {/* main — full width, sidebar removed; AI is floating */}
      <main id="main" style={{ flex: 1, maxWidth: 1360, margin: "0 auto", width: "100%", padding: "18px 24px 0", boxSizing: "border-box", scrollMarginTop: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <SectionHead title="ישויות ונושאים" sub={`מס׳ משלם ${activePayer.payerNo} · ת.ז ${PAYER.taz}`}/>
            <SubjectStrip subjects={caseSubjects} selected={entity} onSelect={selectSubject}/>
          </div>
          <Card pad={0} style={{ overflow: "visible" }}>
            <div style={{ padding: "18px 20px 0" }}>
              <SectionHead
                title={entity === "all" ? "כל הישויות" : activeSubject ? activeSubject.name : "ישויות"}
                icon="sigma"
                sub={entity === "all"
                  ? `${caseSubjects.reduce((a, s) => a + s.count, 0)} ישויות · לחץ ישות לפעולות ותנועות`
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
                subjects={caseSubjects}
                detailsMap={caseData.details}
                filterSubject={activeSubject}
                density={density}
                txnTypes={TXN_TYPES}
                onAction={runAction}
                onOpenHolder={openHolder}
                activePayerNo={activePayer.payerNo}
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

      {/* overlays — lazy-loaded; only mounted (and their chunk fetched) when open */}
      <CommandBar open={cmdOpen} onClose={() => setCmdOpen(false)} onRun={runCommand}/>
      <Suspense fallback={null}>
        {copilot   && <CopilotPanel open onClose={() => setCopilot(false)} onRunFlow={(id) => openFlow(id)}/>}
        {notesOpen && <NotesDrawer open onClose={() => setNotesOpen(false)} notes={notes} onAdd={addNote}/>}
        {docsOpen  && <DocsDrawer open onClose={() => setDocsOpen(false)} docs={DOCUMENTS}/>}
        {tasksOpen && <TasksDrawer open onClose={() => setTasksOpen(false)} tasks={tasks} onToggle={toggleTask} onAdd={addTask}/>}
        {calcOpen  && <InterestCalc open onClose={() => setCalcOpen(false)} baseNominal={TOTALS.nominal}/>}
        {wideOpen  && <WideTxnScreen open onClose={() => { setWideOpen(false); setWideNaxas(null); }} payer={PAYER} filterNaxas={wideNaxas}/>}
        {flow      && <FlowHost flow={flow} onClose={() => setFlow(null)} onComplete={completeFlow}/>}
      </Suspense>
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
