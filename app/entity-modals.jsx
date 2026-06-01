// entity-modals.jsx — modals opened from an entity row: its property-type breakdown,
// and its holder chain (with per-holder balance + navigate-to-card).
import React from 'react';
import { Icon } from './icons.jsx';
import { Chip } from './ui.jsx';
import { fmt } from './data.jsx';
import { chargeBalance } from './entity-helpers.js';

// PropertyTypesModal — shows the property-type breakdown for a single entity.
function PropertyTypesModal({ entity, onClose }) {
  if (!entity) return null;
  const types = entity.propertyTypes || [];
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,38,50,.42)", zIndex: 7000 }}/>
      <div className="mu-rise" role="dialog" aria-modal="true" aria-labelledby="pt-modal-title"
        onClick={e => e.stopPropagation()}
        style={{ position: "fixed", inset: 0, zIndex: 7001, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 480, overflow: "hidden" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", background: "linear-gradient(135deg,var(--teal-700),var(--teal-600))", color: "#fff" }}>
            <div>
              <div id="pt-modal-title" style={{ fontSize: 16, fontWeight: 700 }}>סוגי נכס — {entity.name}</div>
              <div className="num" style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 2 }}>פיזי {entity.id}</div>
            </div>
            <button data-focusring onClick={onClose} aria-label="סגור"
              style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: "none",
                background: "rgba(255,255,255,.18)", borderRadius: 8, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
          {/* content */}
          <div style={{ padding: 20 }}>
            {types.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--ink-400)", padding: "24px 0", fontSize: 13 }}>
                אין נתוני סיווג לנכס זה
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--ink-50)" }}>
                    {["קוד", "תיאור", "שטח / כמות"].map((h, i) => (
                      <th key={i} style={{ padding: "8px 12px", fontWeight: 600, color: "var(--ink-muted)",
                        textAlign: i === 2 ? "end" : "start", borderBottom: "1px solid var(--ink-200)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {types.map((t, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--ink-100)", background: i % 2 === 0 ? "#fff" : "var(--ink-50)" }}>
                      <td className="num" style={{ padding: "10px 12px", fontWeight: 700, color: "var(--teal-700)" }}>{t.code}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--ink-800)" }}>{t.desc}</td>
                      <td className="num" style={{ padding: "10px 12px", textAlign: "end", color: "var(--ink-700)", fontWeight: 600 }}>
                        {t.area != null ? `${t.area} ${t.unit}` : t.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {types.length > 1 && (() => {
                  const totalArea = types.filter(t => t.area != null).reduce((a, t) => a + t.area, 0);
                  return totalArea > 0 ? (
                    <tfoot>
                      <tr style={{ background: "var(--teal-50)" }}>
                        <td colSpan={2} style={{ padding: "9px 12px", fontWeight: 700, color: "var(--teal-700)" }}>סה"כ שטח</td>
                        <td className="num" style={{ padding: "9px 12px", textAlign: "end", fontWeight: 700, color: "var(--teal-700)" }}>
                          {totalArea} מ"ר
                        </td>
                      </tr>
                    </tfoot>
                  ) : null;
                })()}
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// HoldersHistoryModal — shows all historical holders for an entity.
// Each holder has a "פתח כרטיס יתרה" button to navigate to their account.
function HoldersHistoryModal({ entity, onClose, onOpenHolder }) {
  if (!entity) return null;
  const holders = entity.holders || [];
  const propBalance = (entity.charges || []).reduce((a, c) => a + chargeBalance(c), 0);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,38,50,.42)", zIndex: 7000 }}/>
      <div className="mu-rise" role="dialog" aria-modal="true" aria-labelledby="hh-modal-title"
        onClick={e => e.stopPropagation()}
        style={{ position: "fixed", inset: 0, zIndex: 7001, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 540, overflow: "hidden" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", background: "linear-gradient(135deg,var(--teal-700),var(--teal-600))", color: "#fff" }}>
            <div>
              <div id="hh-modal-title" style={{ fontSize: 16, fontWeight: 700 }}>מחזיקים — {entity.name}</div>
              <div className="num" style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 2 }}>
                פיזי {entity.id} · {holders.length} מחזיקים
              </div>
            </div>
            <button data-focusring onClick={onClose} aria-label="סגור"
              style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: "none",
                background: "rgba(255,255,255,.18)", borderRadius: 8, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
          {/* holder list */}
          <div style={{ padding: "12px 0" }}>
            {holders.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--ink-400)", padding: "24px", fontSize: 13 }}>אין נתוני מחזיקים</div>
            ) : holders.map((h, i) => {
              const bal = h.balance || 0;
              return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
                background: h.current ? "var(--teal-50)" : "#fff",
                borderBottom: i < holders.length - 1 ? "1px solid var(--ink-100)" : "none" }}>
                {/* avatar */}
                <div style={{ width: 40, height: 40, borderRadius: 999, flex: "none", display: "grid", placeItems: "center",
                  fontSize: 13, fontWeight: 700,
                  background: h.current ? "var(--teal-500)" : "var(--ink-100)",
                  color: h.current ? "#fff" : "var(--ink-muted)" }}>
                  {h.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                {/* info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-800)" }}>{h.name}</span>
                    {h.current
                      ? <Chip tone="green" style={{ fontSize: 10 }}>מחזיק נוכחי</Chip>
                      : <Chip tone="gray" style={{ fontSize: 10 }}>מחזיק היסטורי</Chip>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                    משלם <span className="num">{h.payerNo}</span>
                    {" · "}{h.from} – {h.to || "היום"}
                  </div>
                </div>
                {/* balance */}
                <div style={{ flex: "none", textAlign: "end" }}>
                  <div className="num" style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.1,
                    color: bal > 0 ? "var(--ink-900)" : "var(--ok-fg)" }}>
                    {bal > 0 ? `₪${fmt(bal)}` : "0 ✓"}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-muted)" }}>יתרה</div>
                </div>
                {/* action */}
                <button data-focusring onClick={() => { onOpenHolder && onOpenHolder(h, entity, propBalance); onClose(); }}
                  title={`פתח כרטיס יתרה של ${h.name}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, flex: "none",
                    border: "1px solid var(--teal-300)", background: h.current ? "var(--teal-600)" : "var(--white)",
                    color: h.current ? "#fff" : "var(--teal-700)", borderRadius: 999,
                    padding: "6px 12px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 12, fontWeight: 600,
                    transition: "all .13s" }}>
                  <Icon name="user" size={13} color={h.current ? "#fff" : "var(--teal-600)"}/>
                  כרטיס יתרה
                </button>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export { PropertyTypesModal, HoldersHistoryModal };
