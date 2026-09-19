const INDIA_TIME_ZONE = "Asia/Kolkata";

function parts(date = new Date()) {
  const values = {};
  for (const part of new Intl.DateTimeFormat("en-GB", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)) {
    if (part.type !== "literal") values[part.type] = part.value;
  }
  return values;
}

export function indiaDateKey(date = new Date()) {
  const p = parts(date);
  return `${p.year}-${p.month}-${p.day}`;
}

export function indiaMonthStartKey(date = new Date()) {
  const p = parts(date);
  return `${p.year}-${p.month}-01`;
}

export const PERIOD_PRESETS = [
  { id: "TODAY", label: "Today" },
  { id: "YESTERDAY", label: "Yesterday" },
  { id: "D7", label: "7D" },
  { id: "D30", label: "30D" },
  { id: "MTD", label: "MTD" },
  { id: "CUSTOM", label: "Custom" },
];

export function shiftDateKey(key, days) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

export function indiaPeriodRange(preset = "TODAY", current = {}) {
  const today = indiaDateKey();

  switch (preset) {
    case "YESTERDAY": {
      const day = shiftDateKey(today, -1);
      return { from: day, to: day };
    }
    case "D7":
      return { from: shiftDateKey(today, -6), to: today };
    case "D30":
      return { from: shiftDateKey(today, -29), to: today };
    case "MTD":
      return { from: indiaMonthStartKey(), to: today };
    case "CUSTOM":
      return {
        from: current.from || today,
        to: current.to || today,
      };
    case "TODAY":
    default:
      return { from: today, to: today };
  }
}

export function indiaPeriodLabel(preset, from, to) {
  switch (preset) {
    case "TODAY": return "Today";
    case "YESTERDAY": return "Yesterday";
    case "D7": return "Last 7 Days";
    case "D30": return "Last 30 Days";
    case "MTD": return "Month to Date";
    default:
      return from === to ? String(from || "") : `${from || ""} → ${to || ""}`;
  }
}
