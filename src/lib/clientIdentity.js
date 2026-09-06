const DEVICE_KEY = "wsp_device_id_v1";
const SESSION_KEY = "wsp_session_id_v1";

function safeUuid(storage, key) {
  try {
    const existing = storage.getItem(key);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
    const next = crypto.randomUUID();
    storage.setItem(key, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

export function getDeviceId() {
  return safeUuid(localStorage, DEVICE_KEY);
}

export function getSessionId() {
  return safeUuid(sessionStorage, SESSION_KEY);
}
