const DB_NAME = "wineshoppos_checkout_journal_v1";
const DB_VERSION = 1;
const ATTEMPT_STORE = "attempts";
const KEY_STORE = "crypto_keys";
const KEY_ID = "checkout-aes-key";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(ATTEMPT_STORE)) {
        const store = db.createObjectStore(ATTEMPT_STORE, { keyPath: "id" });
        store.createIndex("shopUser", "shopUser");
        store.createIndex("updatedAt", "updatedAt");
      }
      if (!db.objectStoreNames.contains(KEY_STORE)) {
        db.createObjectStore(KEY_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function reqPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCryptoKey() {
  if (!crypto?.subtle || !indexedDB) {
    throw new Error("Secure checkout recovery storage is unavailable in this browser.");
  }

  const db = await openDb();
  try {
    const tx = db.transaction(KEY_STORE, "readwrite");
    const store = tx.objectStore(KEY_STORE);
    const existing = await reqPromise(store.get(KEY_ID));
    if (existing?.key) return existing.key;

    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    store.put({ id: KEY_ID, key });
    return key;
  } finally {
    db.close();
  }
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function encryptPayload(payload) {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(payload));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain);
  return {
    iv: bytesToBase64(iv),
    cipher: bytesToBase64(new Uint8Array(cipher)),
  };
}

async function decryptPayload(record) {
  const key = await getCryptoKey();
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(record.iv) },
    key,
    base64ToBytes(record.cipher),
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

export async function saveCheckoutAttempt({ id, shopId, userId, payload }) {
  if (!id || !shopId || !userId) throw new Error("Checkout recovery identity is incomplete.");

  const encrypted = await encryptPayload(payload);
  const now = new Date().toISOString();
  const row = {
    id,
    shopId,
    userId,
    shopUser: `${shopId}:${userId}`,
    status: "SUBMITTING",
    saleId: null,
    autoPrintRequested: false,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    ...encrypted,
  };

  const db = await openDb();
  try {
    const tx = db.transaction(ATTEMPT_STORE, "readwrite");
    tx.objectStore(ATTEMPT_STORE).put(row);
  } finally {
    db.close();
  }

  return { ...row, payload };
}

export async function loadActiveCheckoutAttempt(shopId, userId) {
  if (!shopId || !userId) return null;

  const db = await openDb();
  try {
    const tx = db.transaction(ATTEMPT_STORE, "readonly");
    const rows = await reqPromise(tx.objectStore(ATTEMPT_STORE).getAll());
    const matching = rows
      .filter((row) => row.shopUser === `${shopId}:${userId}`)
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

    const row = matching[0];
    if (!row) return null;

    try {
      return { ...row, payload: await decryptPayload(row) };
    } catch (error) {
      return { ...row, payload: null, decryptError: error?.message || String(error) };
    }
  } finally {
    db.close();
  }
}

export async function updateCheckoutAttempt(id, updates = {}) {
  const db = await openDb();
  try {
    const tx = db.transaction(ATTEMPT_STORE, "readwrite");
    const store = tx.objectStore(ATTEMPT_STORE);
    const current = await reqPromise(store.get(id));
    if (!current) return null;
    const next = { ...current, ...updates, updatedAt: new Date().toISOString() };
    store.put(next);
    return next;
  } finally {
    db.close();
  }
}

export async function removeCheckoutAttempt(id) {
  if (!id) return;
  const db = await openDb();
  try {
    const tx = db.transaction(ATTEMPT_STORE, "readwrite");
    tx.objectStore(ATTEMPT_STORE).delete(id);
  } finally {
    db.close();
  }
}
