const THEME_EVENT = "wineshop-theme-change";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function normalizeTheme(value) {
  const theme = String(value || "SYSTEM").toUpperCase();
  return ["SYSTEM", "LIGHT", "DARK"].includes(theme) ? theme : "SYSTEM";
}

export function resolvedTheme(value) {
  const preference = normalizeTheme(value);
  if (preference === "SYSTEM") {
    return typeof window !== "undefined" && window.matchMedia?.(MEDIA_QUERY).matches ? "dark" : "light";
  }
  return preference.toLowerCase();
}

export function applyThemePreference(value) {
  if (typeof document === "undefined") return;
  const preference = normalizeTheme(value);
  document.documentElement.dataset.themePreference = preference.toLowerCase();
  document.documentElement.dataset.theme = resolvedTheme(preference);
}

export function notifyThemePreference(value) {
  applyThemePreference(value);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme: normalizeTheme(value) } }));
  }
}

export function watchThemePreference(getPreference) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia?.(MEDIA_QUERY);
  const sync = () => applyThemePreference(getPreference?.() || "SYSTEM");
  const onSystemChange = () => { if (normalizeTheme(getPreference?.()) === "SYSTEM") sync(); };
  const onCustom = (event) => applyThemePreference(event?.detail?.theme || getPreference?.() || "SYSTEM");
  sync();
  media?.addEventListener?.("change", onSystemChange);
  window.addEventListener(THEME_EVENT, onCustom);
  return () => {
    media?.removeEventListener?.("change", onSystemChange);
    window.removeEventListener(THEME_EVENT, onCustom);
  };
}
