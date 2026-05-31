// error-boundary.jsx — catches render errors so one broken component
// shows a recoverable message instead of blanking the whole app.
import React from 'react';

export class ErrorBoundary extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error("UI error:", err, info); }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center",
        fontFamily: "var(--font)", background: "var(--ink-50)", color: "var(--ink-800)" }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: 32, background: "#fff",
          border: "1px solid var(--ink-200)", borderRadius: 16, boxShadow: "var(--shadow-md)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>אירעה שגיאה במסך</div>
          <div style={{ fontSize: 13.5, color: "var(--ink-muted)", marginBottom: 20, lineHeight: 1.6 }}>
            ניתן לרענן את הדף כדי להמשיך. הפרטים נרשמו ביומן.
          </div>
          <button onClick={() => location.reload()} data-focusring
            style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "10px 24px", fontFamily: "var(--font)",
              fontSize: 14, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,var(--teal-500),var(--teal-700))" }}>
            רענון הדף
          </button>
        </div>
      </div>
    );
  }
}
