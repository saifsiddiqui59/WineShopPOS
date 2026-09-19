const TERMINAL_ID_KEY = "wineshop_terminal_id_v1";
const TERMINAL_SEQUENCE_PREFIX = "wineshop_terminal_sequence_v1";

function storage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function getTerminalId() {
  const store = storage();
  const existing = store?.getItem(TERMINAL_ID_KEY);
  if (existing) return existing;

  if (!globalThis.crypto?.randomUUID) {
    throw new Error("This browser cannot create the required terminal identity.");
  }

  const id = globalThis.crypto.randomUUID();
  store?.setItem(TERMINAL_ID_KEY, id);
  return id;
}

function sequenceKey(terminalId = getTerminalId()) {
  return `${TERMINAL_SEQUENCE_PREFIX}:${terminalId}`;
}

export function peekTerminalSequence() {
  const store = storage();
  const value = Number(store?.getItem(sequenceKey()) || 0);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function nextTerminalSequence() {
  const store = storage();
  const next = peekTerminalSequence() + 1;
  if (!Number.isSafeInteger(next)) {
    throw new Error("Terminal sequence is out of range.");
  }
  store?.setItem(sequenceKey(), String(next));
  return next;
}

export function indiaBusinessDate(offsetDays = 0) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const base = new Date(`${values.year}-${values.month}-${values.day}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + Number(offsetDays || 0));
  return base.toISOString().slice(0, 10);
}
