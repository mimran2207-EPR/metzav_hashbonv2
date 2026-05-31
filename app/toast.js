// toast.js — importable toast dispatcher (replaces the window.muToast global).
// Pattern mirrors react-hot-toast: components call `toast(text, icon, tone)`;
// the mounted <ToastHost/> registers the actual emitter. No window pollution,
// testable, and calls fired before mount are queued.

let _emit = null;
const _queue = [];

export function toast(text, icon = "check", tone = "default") {
  if (_emit) _emit(text, icon, tone);
  else _queue.push([text, icon, tone]);
}

// ToastHost calls this on mount; returns an unregister fn for cleanup.
export function registerToast(fn) {
  _emit = fn;
  _queue.splice(0).forEach(args => fn(...args));
  return () => { if (_emit === fn) _emit = null; };
}
