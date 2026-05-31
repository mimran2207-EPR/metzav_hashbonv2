// storage.js — tiny localStorage-backed preference layer.
// Persists user UI choices (column order, hidden columns, theme, density, …)
// across reloads. All reads/writes are guarded so a disabled/again storage
// (private mode, quota) never throws into render.

const PREFIX = "mh_v2_";

export function loadPref(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function savePref(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore — storage unavailable / full */
  }
}

export function clearPrefs() {
  try {
    Object.keys(window.localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => window.localStorage.removeItem(k));
  } catch {/* ignore */}
}

// React hook: state that auto-persists under `key`.
import { useState, useEffect } from "react";
export function usePersistedState(key, fallback) {
  const [val, setVal] = useState(() => loadPref(key, fallback));
  useEffect(() => { savePref(key, val); }, [key, val]);
  return [val, setVal];
}
