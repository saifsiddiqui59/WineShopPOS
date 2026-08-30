import { useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { notifyThemePreference, normalizeTheme } from "../lib/theme";

const ORDER = ["LIGHT", "DARK", "SYSTEM"];
const ICONS = { LIGHT: Sun, DARK: Moon, SYSTEM: Laptop };
const LABELS = { LIGHT: "Light theme", DARK: "Dark theme", SYSTEM: "System theme" };

export default function ThemeToggle() {
  const { profile, refreshAccess } = useAuth();
  const [busy, setBusy] = useState(false);
  const current = normalizeTheme(profile?.theme);
  const Icon = ICONS[current];

  async function cycleTheme() {
    if (busy) return;
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    notifyThemePreference(next);
    setBusy(true);
    const { error } = await supabase.rpc("update_my_theme", { p_theme: next });
    if (!error) await refreshAccess();
    else notifyThemePreference(current);
    setBusy(false);
  }

  return <button className="theme-toggle" type="button" onClick={cycleTheme} disabled={busy} title={`${LABELS[current]} · click to change`} aria-label={`${LABELS[current]}. Click to change theme.`}>
    <Icon size={17}/><span>{current === "SYSTEM" ? "Auto" : current[0] + current.slice(1).toLowerCase()}</span>
  </button>;
}
