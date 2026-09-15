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
