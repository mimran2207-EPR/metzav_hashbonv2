// hooks.js — small, self-contained UI hooks extracted from App so the root component
// stays a thin composition shell (separation of concerns). No coupling to account state.
import { useEffect } from 'react';
import { usePersistedState, loadPref, savePref } from './storage.js';
import { THEMES, generateThemeFromColor } from './table-utils.jsx';

/**
 * Color-theme state: persists the chosen theme id and applies its CSS variables.
 * Handles preset themes and a custom (color-picker) theme.
 * @returns {{ themeId: string, setThemeId: (id: string) => void, handleCustomTheme: (hex: string) => void }}
 */
export function useTheme() {
  const [themeId, setThemeId] = usePersistedState("themeId", "teal");

  useEffect(() => {
    if (themeId === "custom") {
      const hex = loadPref("customHex", "#2AA7B8");
      Object.entries(generateThemeFromColor(hex)).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
      return;
    }
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    Object.entries(theme.vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [themeId]);

  const handleCustomTheme = (hex) => {
    savePref("customHex", hex);
    Object.entries(generateThemeFromColor(hex)).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  };

  return { themeId, setThemeId, handleCustomTheme };
}

/**
 * Global keyboard shortcuts: ⌘/Ctrl+K toggles the command bar, ⌘/Ctrl+J the copilot.
 * (We deliberately do NOT hijack ⌘/Ctrl+P — overriding native print is hostile to a11y.)
 * The setters are stable (from useState), so the listener is bound once.
 * @param {(updater: (open: boolean) => boolean) => void} setCmdOpen
 * @param {(updater: (open: boolean) => boolean) => void} setCopilot
 */
export function useGlobalShortcuts(setCmdOpen, setCopilot) {
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") { e.preventDefault(); setCmdOpen(o => !o); }
      else if ((e.metaKey || e.ctrlKey) && k === "j") { e.preventDefault(); setCopilot(o => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCmdOpen, setCopilot]);
}
