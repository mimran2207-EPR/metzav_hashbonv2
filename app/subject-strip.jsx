// subject-strip.jsx — the horizontal subjects carousel ("נושאים") above the entities table.
import React, { useState, useRef } from 'react';
import { Icon } from './icons.jsx';
import { Chip } from './ui.jsx';
import { fmt } from './data.jsx';

// shared card chrome (also used for the "כל הנושאים" card)
function entityCardStyle(active) {
  return { display: "flex", alignItems: "center", cursor: "pointer", textAlign: "start",
    background: active ? "var(--teal-50)" : "var(--white)", border: `1.5px solid ${active ? "var(--teal-500)" : "var(--ink-200)"}`,
    borderRadius: 14, padding: "11px 14px", transition: "all .14s ease", fontFamily: "var(--font)",
    boxShadow: active ? "0 0 0 4px rgba(var(--teal-rgb),.16), 0 4px 12px rgba(var(--teal-rgb),.18)" : "var(--shadow-card)" };
}
function entityIcon(active) {
  return { width: 36, height: 36, borderRadius: 10, flex: "none", display: "grid", placeItems: "center",
    background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))",
    boxShadow: "0 3px 8px rgba(var(--teal-rgb),.30)" };
}

// SubjectCard — one subject in the carousel.
function SubjectCard({ sub, active, onSelect }) {
  const paid = (sub.balance || 0) <= 0;
  return (
    <button data-focusring onClick={() => onSelect(sub.id)} style={{ ...entityCardStyle(active), minWidth: 178, flex: "0 0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
        <div style={entityIcon(active)}><Icon name={sub.icon} size={19} color="#fff"/></div>
        <div style={{ textAlign: "start", minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-800)", whiteSpace: "nowrap" }}>{sub.name}</span>
            <Chip tone="teal" style={{ fontSize: 10 }}><span className="num">{sub.count}</span> {sub.unit}</Chip>
          </div>
          <div className="num" style={{ fontSize: 11.5, marginTop: 2, fontWeight: 600, color: paid ? "var(--green)" : "var(--ink-700)" }}>
            {paid ? "0 ✓ ללא חוב" : `₪${fmt(sub.balance)}`}
          </div>
        </div>
      </div>
    </button>
  );
}

// SubjectStrip — horizontal CAROUSEL of subjects. Scroll with the arrows (or
// native swipe/wheel); the pin button keeps the strip docked while you scroll.
function SubjectStrip({ subjects, selected, onSelect }) {
  const scroller = useRef(null);
  const [pinned, setPinned] = useState(false);
  const nudge = (dir) => scroller.current && scroller.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  const arrowBtn = { width: 32, height: 32, borderRadius: 9, border: "1px solid var(--ink-200)", background: "var(--white)",
    cursor: "pointer", display: "grid", placeItems: "center", flex: "none", boxShadow: "var(--shadow-card)" };
  return (
    <div style={{ position: pinned ? "sticky" : "static", top: 118, zIndex: 30,
      background: pinned ? "var(--ink-50)" : "transparent", borderRadius: 14, padding: pinned ? "8px 0" : 0,
      boxShadow: pinned ? "0 6px 16px rgba(18,48,60,.08)" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button data-focusring aria-label="גלול ימינה" onClick={() => nudge(1)} style={arrowBtn}>
          <Icon name="chevright" size={18} color="var(--ink-600)"/>
        </button>
        <div ref={scroller} style={{ display: "flex", gap: 12, overflowX: "auto", flex: 1, padding: "4px 2px",
          scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <button data-focusring onClick={() => onSelect("all")} style={{ ...entityCardStyle(selected === "all"), minWidth: 152, flex: "0 0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={entityIcon(selected === "all")}><Icon name="wallet" size={18} color="#fff"/></div>
              <div style={{ textAlign: "start" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-800)" }}>כל הנושאים</div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)" }}><span className="num">{subjects.length}</span> נושאים פעילים</div>
              </div>
            </div>
          </button>
          {subjects.map(sub => <SubjectCard key={sub.id} sub={sub} active={selected === sub.id} onSelect={onSelect}/>)}
        </div>
        <button data-focusring aria-label="גלול שמאלה" onClick={() => nudge(-1)} style={arrowBtn}>
          <Icon name="chevleft" size={18} color="var(--ink-600)"/>
        </button>
        <button data-focusring aria-pressed={pinned} title={pinned ? "שחרר רצועה" : "קבע רצועה"} onClick={() => setPinned(p => !p)}
          style={{ ...arrowBtn, background: pinned ? "var(--teal-500)" : "var(--white)", border: pinned ? "1px solid var(--teal-500)" : arrowBtn.border }}>
          <Icon name="pin" size={17} color={pinned ? "#fff" : "var(--ink-600)"}/>
        </button>
      </div>
    </div>
  );
}

export { SubjectStrip };
