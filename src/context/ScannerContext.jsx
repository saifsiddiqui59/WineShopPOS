import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { normalizeBarcode, scannerSequenceLooksValid } from "../lib/barcode";

const ScannerContext = createContext(null);
const SETTINGS_KEY = "wineshop_scanner_settings_v1";

const defaults = {
  enabled: true,
  minLength: 6,
  maxAverageGapMs: 100,
  resetGapMs: 400,
  successFrequency: 1046,
  errorFrequency: 220,
};

function loadSettings() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return defaults;
  }
}

function isEditable(el) {
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}

function snapshotEditable(el) {
  if (!isEditable(el)) return null;
  return {
    element: el,
    value: "value" in el ? el.value : el.textContent,
    start: typeof el.selectionStart === "number" ? el.selectionStart : null,
    end: typeof el.selectionEnd === "number" ? el.selectionEnd : null,
  };
}

function restoreEditable(snapshot) {
  if (!snapshot?.element?.isConnected) return;
  const el = snapshot.element;
  if ("value" in el) {
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")?.set;
    if (setter) setter.call(el, snapshot.value);
    else el.value = snapshot.value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    el.textContent = snapshot.value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
  try {
    if (snapshot.start !== null) el.setSelectionRange(snapshot.start, snapshot.end);
  } catch {}
}

function tone(frequency, duration = 90, volume = 0.08) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, duration);
  } catch {}
}

export function ScannerProvider({ children }) {
  const [settings, setSettingsState] = useState(loadSettings);
  const [lastScan, setLastScan] = useState(null);
  const buffer = useRef([]);
  const times = useRef([]);
  const initialFocusSnapshot = useRef(null);
  const lastKeyAt = useRef(0);

  function saveSettings(next) {
    const merged = { ...settings, ...next };
    setSettingsState(merged);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  }

  function successBeep() {
    tone(settings.successFrequency, 80, 0.06);
  }

  function errorBeep() {
    tone(settings.errorFrequency, 180, 0.1);
  }

  useEffect(() => {
    function reset() {
      buffer.current = [];
      times.current = [];
      initialFocusSnapshot.current = null;
      lastKeyAt.current = 0;
    }

    function onKeyDown(event) {
      if (!settings.enabled || event.ctrlKey || event.altKey || event.metaKey) return;
      const now = performance.now();
      const gap = lastKeyAt.current ? now - lastKeyAt.current : 0;

      if (lastKeyAt.current && gap > settings.resetGapMs) reset();

      if (event.key === "Enter" || event.key === "Tab") {
        if (!buffer.current.length) return;
        const rawChars = buffer.current.join("");
        const chars = normalizeBarcode(rawChars);
        const gaps = times.current.slice(1).map((t, i) => t - times.current[i]);
        const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 999;
        const scannerLike = scannerSequenceLooksValid(rawChars, times.current, settings);

        if (scannerLike) {
          event.preventDefault();
          event.stopPropagation();

          const snapshot = initialFocusSnapshot.current;
          const directCapture =
            snapshot?.element?.dataset?.scannerCapture === "barcode";

          if (directCapture && snapshot?.element?.isConnected) {
            const el = snapshot.element;
            const setter = Object.getOwnPropertyDescriptor(
              Object.getPrototypeOf(el),
              "value",
            )?.set;
            if (setter) setter.call(el, chars);
            else el.value = chars;
            el.dispatchEvent(new Event("input", { bubbles: true }));
          } else {
            restoreEditable(snapshot);
          }

          setLastScan({
            id: crypto.randomUUID(),
            barcode: chars,
            at: new Date().toISOString(),
            averageGapMs: Math.round(avgGap),
            length: chars.length,
          });
          requestAnimationFrame(() => snapshot?.element?.focus?.());
        }
        reset();
        return;
      }

      if (event.key.length !== 1) return;

      if (!buffer.current.length) initialFocusSnapshot.current = snapshotEditable(document.activeElement);
      buffer.current.push(event.key);
      times.current.push(now);
      lastKeyAt.current = now;

      // Once a rapid sequence is confidently scanner-like, block subsequent characters.
      // The first few characters are restored on Enter from the saved field snapshot.
      if (buffer.current.length >= 4) {
        const recent = times.current.slice(-4);
        const recentAvg = (recent[3] - recent[0]) / 3;
        if (recentAvg <= settings.maxAverageGapMs) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [settings]);

  const value = useMemo(
    () => ({ settings, saveSettings, lastScan, successBeep, errorBeep }),
    [settings, lastScan]
  );

  return <ScannerContext.Provider value={value}>{children}</ScannerContext.Provider>;
}

export function useScanner() {
  const value = useContext(ScannerContext);
  if (!value) throw new Error("useScanner must be inside ScannerProvider");
  return value;
}
