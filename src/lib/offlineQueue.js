const DB_NAME = "wineshoppos_offline_v1";
const DB_VERSION = 1;
const QUEUE_STORE = "sale_queue";
const KEY_STORE = "crypto_keys";
const KEY_ID = "queue-aes-key";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
        store.createIndex("status", "status");
        store.createIndex("createdAt", "createdAt");
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
  const db = await openDb();
  try {
    const tx = db.transaction(KEY_STORE, "readwrite");
    const store = tx.objectStore(KEY_STORE);
    const existing = await reqPromise(store.get(KEY_ID));
    if (existing?.key) return existing.key;

    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
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
    base64ToBytes(record.cipher)
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

export async function queueOfflineSale(payload) {
  if (!crypto?.subtle || !indexedDB) {
    throw new Error("Secure offline storage is not available in this browser.");
  }
  const encrypted = await encryptPayload(payload);
  const db = await openDb();
  try {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    tx.objectStore(QUEUE_STORE).put({
      id: payload.clientSaleId,
      createdAt: payload.offlineCreatedAt,
      status: "PENDING",
      attempts: 0,
      lastError: null,
      ...encrypted,
    });
  } finally {
    db.close();
  }
  return payload.clientSaleId;
}

export async function listOfflineSales() {
  const db = await openDb();
  try {
    const tx = db.transaction(QUEUE_STORE, "readonly");
    const rows = await reqPromise(tx.objectStore(QUEUE_STORE).getAll());
    const output = [];
    for (const row of rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      try {
        output.push({ ...row, payload: await decryptPayload(row) });
      } catch (error) {
        output.push({ ...row, payload: null, decryptError: error.message });
      }
    }
    return output;
  } finally {
    db.close();
  }
}

export async function setOfflineSaleStatus(id, status, lastError = null) {
  const db = await openDb();
  try {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    const store = tx.objectStore(QUEUE_STORE);
    const row = await reqPromise(store.get(id));
    if (!row) return;
    store.put({
      ...row,
      status,
      attempts: Number(row.attempts || 0) + 1,
      lastError,
      updatedAt: new Date().toISOString(),
    });
  } finally {
    db.close();
  }
}

export async function removeOfflineSale(id) {
  const db = await openDb();
  try {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    tx.objectStore(QUEUE_STORE).delete(id);
  } finally {
    db.close();
  }
}

export async function offlineQueueCounts() {
  const rows = await listOfflineSales();
  return rows.reduce(
    (acc, row) => {
      acc.total += 1;
      if (row.status === "PENDING") acc.pending += 1;
      if (row.status === "CONFLICT") acc.conflict += 1;
      return acc;
    },
    { total: 0, pending: 0, conflict: 0 }
  );
}
