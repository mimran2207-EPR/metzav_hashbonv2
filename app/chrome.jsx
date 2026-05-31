import React from 'react';
import { Icon } from './icons.jsx';
import { Tip } from './ui.jsx';
import s from './ui.module.css';

function TopBar({ onCommand, onNav, year, breadcrumb, view, onSwitchView, taskCount = 0 }) {
  const NavTab = ({ id, label, badge }) => {
    const active = view === id;
    return (
      <button data-focusring onClick={() => onSwitchView && onSwitchView(id)}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer",
          borderRadius: 999, padding: "7px 16px", fontFamily: "var(--font)", fontSize: 13.5, fontWeight: 700,
          background: active ? "var(--teal-500)" : "transparent", color: active ? "#fff" : "var(--ink-600)",
          transition: "all .13s" }}>
        {label}
        {badge > 0 && <span className="num" style={{ background: active ? "rgba(255,255,255,.28)" : "var(--amber)", color: "#fff",
          borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{badge}</span>}
      </button>
    );
  };
  // Only keep functional nav buttons; forward/history/fav were dead placeholders
  const navBtns = [
    { id: "back", icon: "back", label: "אחורה" },
  ];

  return (
    <header style={{ height: 56, background: "var(--white)", borderBottom: "1px solid var(--ink-200)",
      display: "flex", alignItems: "center", gap: 16, padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
      <a href="#main" className="skip-link">דלג לתוכן הראשי</a>
      <div style={{ display: "flex", alignItems: "center", gap: 11, flex: "none" }}>
        <img src="/assets/municipality-crest.png" alt="מועצה אזורית שדות נגב" style={{ width: 36, height: 36, objectFit: "contain" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, whiteSpace: "nowrap" }}>
          <span style={{ color: "var(--teal-600)", fontWeight: 600 }}>מצב חשבון</span>
          <Icon name="chevleft" size={14} color="var(--ink-400)" />
          <span style={{ color: "var(--ink-800)", fontWeight: 600 }}>{breadcrumb.name}</span>
          <span className="num" style={{ color: "var(--ink-muted)", fontWeight: 500 }}>{breadcrumb.no}</span>
        </div>
      </div>

      {/* primary view switch — prominent pill tabs */}
      {onSwitchView && (
        <nav aria-label="ניווט ראשי" style={{ display: "flex", alignItems: "center", gap: 3, flex: "none",
          background: "var(--ink-100)", borderRadius: 999, padding: 4 }}>
          <NavTab id="case"     label="מצב חשבון"/>
          <NavTab id="worklist" label="משימות שלי" badge={taskCount}/>
        </nav>
      )}

      <button data-focusring onClick={onCommand} className={s.searchTrigger}>
        <Icon name="search" size={17} color="var(--teal-500)" />
        <span style={{ flex: 1, textAlign: "start" }}>חפש משלם, פיזי, פעולה או מסך…</span>
        <kbd style={{ fontFamily: "var(--font)", fontSize: 11.5, fontWeight: 600, color: "var(--ink-500)",
          background: "var(--white)", border: "1px solid var(--ink-300)", borderRadius: 6, padding: "2px 7px" }}>⌘K</kbd>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 2, flex: "none" }}>
        {navBtns.map((b) =>
        <Tip key={b.id} label={b.label}>
            <button data-focusring onClick={() => onNav && onNav(b.id)} aria-label={b.label} className={s.iconNav}>
              <Icon name={b.icon} size={19} color="currentColor" />
            </button>
          </Tip>
        )}
      </div>

      <div style={{ width: 1, height: 26, background: "var(--ink-200)", flex: "none" }} />

      <div data-focusring tabIndex={0} style={{ display: "flex", alignItems: "center", gap: 9, flex: "none", cursor: "pointer",
        padding: "5px 6px 5px 10px", borderRadius: 999, border: "1px solid var(--ink-200)" }}>
        <div style={{ width: 30, height: 30, borderRadius: 999, background: "var(--teal-100)", color: "var(--teal-700)",
          display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12.5 }}>שע</div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)" }}>ישראל ישראלי</div>
          <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>פקיד גבייה</div>
        </div>
        <Icon name="chevdown" size={15} color="var(--ink-400)" />
      </div>

      <img src="/assets/muni-wordmark.svg" alt="muni" style={{ height: 30, flex: "none" }} />
    </header>
  );
}

function FooterBand() {
  return (
    <footer style={{ marginTop: 40 }}>
      <div style={{ position: "relative", background: "linear-gradient(180deg,#FFFFFF 0%,#E8F4F6 100%)" }}>
        <img src="/assets/footer-cityscape.svg" alt="" style={{ display: "block", width: "100%", height: 120, objectFit: "cover", objectPosition: "bottom" }} />
      </div>
      <div style={{ background: "var(--white)", borderTop: "1px solid var(--ink-200)", padding: "14px 32px",
        display: "flex", alignItems: "center", gap: 24 }}>
        <img src="/assets/epr-systems.svg" alt="EPR Systems" style={{ height: 24 }} />
        <img src="/assets/tsg.svg" alt="TSG" style={{ height: 22, opacity: .9 }} />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 22, fontSize: 13, color: "var(--ink-500)" }}>
          <span style={{ cursor: "pointer" }}>נגישות</span>
          <span style={{ cursor: "pointer" }}>מדיניות פרטיות</span>
          <span style={{ cursor: "pointer" }}>תמיכה</span>
        </div>
      </div>
    </footer>
  );
}

export { TopBar, FooterBand };
