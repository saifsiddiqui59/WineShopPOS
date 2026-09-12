import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEV_REF = "juhcypzoacauzmtzqnwd";
const PROD_REF = "uiurgplnsgmawvxhjzzp";

function readEnv() {
  const out = {};
  for (const file of [".env", ".env.local"]) {
    if (!fs.existsSync(file)) continue;
    for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 1) continue;
      const key = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
      out[key] = value;
    }
  }
  return out;
}

function decodeJwtExp(token) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    );
    return Number(payload?.exp || 0);
  } catch {
    return 0;
  }
}

function findSession(value) {
  if (!value) return null;
  if (typeof value === "string") {
    try { return findSession(JSON.parse(value)); } catch { return null; }
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findSession(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === "object") {
    if (value.access_token) {
      return {
        access_token: String(value.access_token),
        refresh_token: value.refresh_token ? String(value.refresh_token) : "",
      };
    }
    for (const nested of Object.values(value)) {
      const found = findSession(nested);
      if (found) return found;
    }
  }
  return null;
}

function sessionFromPlaywrightState(authFile) {
  if (!fs.existsSync(authFile)) return null;
  const state = JSON.parse(fs.readFileSync(authFile, "utf8"));
  for (const origin of state.origins || []) {
    for (const entry of origin.localStorage || []) {
      if (!String(entry.name || "").includes(`sb-${DEV_REF}-auth-token`)) continue;
      const found = findSession(entry.value);
      if (found) return found;
    }
  }
  return findSession(state);
}

async function authRequest(url, anon, grant, body) {
  const response = await fetch(`${url}/auth/v1/token?grant_type=${grant}`, {
    method: "POST",
    headers: {
      apikey: anon,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`DEV auth ${grant} failed HTTP ${response.status}: ${text.slice(0, 500)}`);
  }
  return JSON.parse(text);
}

async function validSession(url, anon) {
  const authFile = process.env.AUTH_FILE ||
    path.join(os.homedir(), ".wineshoppos-v5-uat", "auth.json");

  let session = sessionFromPlaywrightState(authFile);
  const now = Math.floor(Date.now() / 1000);

  if (session?.access_token && decodeJwtExp(session.access_token) > now + 90) {
    return session.access_token;
  }

  if (session?.refresh_token) {
    const refreshed = await authRequest(
      url,
      anon,
      "refresh_token",
      { refresh_token: session.refresh_token },
    );
    if (refreshed?.access_token) return refreshed.access_token;
  }

  const email = process.env.E2E_EMAIL || "";
  const password = process.env.E2E_PASSWORD || "";
  if (email && password) {
    const signedIn = await authRequest(url, anon, "password", { email, password });
    if (signedIn?.access_token) return signedIn.access_token;
  }

  throw new Error(
    `No valid DEV session. Expected saved Playwright auth at ${authFile}, ` +
    `or E2E_EMAIL/E2E_PASSWORD.`,
  );
}

function embeddedInvoices(r11Text) {
  const result = [];
  const pattern =
    /node\s+"\$RUNTIME\/decode-b64\.mjs"\s+"\$INVOICE_DIR\/([^"]+)"\s+<<'([A-Za-z0-9_]+)'\r?\n([\s\S]*?)\r?\n\2/g;

  for (const match of r11Text.matchAll(pattern)) {
    result.push({
      fileName: match[1],
      marker: match[2],
      contentBase64: match[3].replace(/\s+/g, ""),
    });
  }
  return result;
}

function identity(fileName) {
  return String(fileName || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function callForensic(url, anon, accessToken, invoice) {
  const endpoint = `${url}/functions/v1/ocr-invoice-forensic`;
  const retryable = new Set([429, 500, 502, 503, 504]);

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentBase64: invoice.contentBase64,
        sourceFileName: invoice.fileName,
      }),
    });

    const text = await response.text();
    let payload = null;
    try { payload = JSON.parse(text); } catch { payload = null; }

    if (response.ok && payload?.ok) return payload;

    const azureStatus = Number(payload?.status || 0);
    const isRateLimit = response.status === 429 || azureStatus === 429;
    const canRetry =
      retryable.has(response.status) ||
      retryable.has(azureStatus);

    if (!canRetry || attempt === 6) {
      throw new Error(
        `${invoice.fileName}: forensic OCR failed HTTP ${response.status}: ` +
        `${text.slice(0, 1200)}`,
      );
    }

    let waitSeconds;
    if (isRateLimit) {
      const explicit = Number(payload?.retryAfterSeconds || 0);
      const messageMatch = String(payload?.message || text)
        .match(/retry after\s+(\d+)\s+seconds?/i);
      const fromMessage = Number(messageMatch?.[1] || 0);

      // Azure DI F0 commonly reports ~28 seconds. Give it a full safety
      // margin so a retry cannot immediately consume another failed attempt.
      waitSeconds = Math.max(35, explicit + 5, fromMessage + 5);
      console.log(
        `${invoice.fileName}: Azure Document Intelligence F0 rate limit; ` +
        `waiting ${waitSeconds}s before retry ${attempt + 1}/6...`,
      );
    } else {
      waitSeconds = Math.min(30, 4 * (2 ** (attempt - 1)));
      console.log(
        `${invoice.fileName}: transient HTTP ${response.status}` +
        `${azureStatus ? `/Azure ${azureStatus}` : ""}; ` +
        `waiting ${waitSeconds}s before retry ${attempt + 1}/6...`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
  }

  throw new Error(`${invoice.fileName}: forensic OCR failed unexpectedly`);
}

function fixtureLooksReusable(file, expectedFileName) {
  if (!fs.existsSync(file)) return false;
  try {
    const fixture = JSON.parse(fs.readFileSync(file, "utf8"));
    const ar = fixture?.azureEvidence?.analyzeResult || {};
    const lineCount = (ar.pages || []).reduce(
      (sum, page) => sum + (page.lines || []).length,
      0,
    );
    const cellCount = (ar.tables || []).reduce(
      (sum, table) => sum + (table.cells || []).length,
      0,
    );

    return (
      fixture?.fixtureSchema === "WSP_AZURE_FINANCE_EVIDENCE_V1" &&
      fixture?.synthetic === false &&
      fixture?.devRef === DEV_REF &&
      fixture?.sourceFileName === expectedFileName &&
      /^[a-f0-9]{64}$/.test(String(fixture?.rawResultSha256 || "")) &&
      lineCount > 20 &&
      cellCount > 20 &&
      (ar.documents || []).length >= 1
    );
  } catch {
    return false;
  }
}

const env = readEnv();
const supabaseUrl = String(env.VITE_SUPABASE_URL || "");
const anon = String(env.VITE_SUPABASE_ANON_KEY || "");
if (!supabaseUrl.includes(DEV_REF) || supabaseUrl.includes(PROD_REF)) {
  throw new Error(`Safety stop: expected DEV Supabase URL, got ${supabaseUrl}`);
}
if (!anon) throw new Error("VITE_SUPABASE_ANON_KEY missing.");

const r11 = process.argv[2];
const outputDir = process.argv[3];
if (!r11 || !outputDir) {
  throw new Error("Usage: node capture-v5-azure-finance-fixtures.mjs <R11> <output-dir>");
}

const blocks = embeddedInvoices(fs.readFileSync(r11, "utf8"));
if (blocks.length < 3) {
  throw new Error(`Expected at least 3 embedded invoice image blocks; found ${blocks.length}.`);
}

const wanted = [
  { key: "16845", output: "16845.azure-finance-raw.json" },
  { key: "B3339", output: "B-3339.azure-finance-raw.json" },
  { key: "16805", output: "16805.azure-finance-raw.json" },
];

const selected = wanted.map((target) => {
  const invoice = blocks.find((candidate) => identity(candidate.fileName).includes(target.key));
  if (!invoice) {
    throw new Error(
      `Could not find embedded invoice ${target.key}. Embedded files: ` +
      blocks.map((x) => x.fileName).join(", "),
    );
  }
  return { ...target, invoice };
});

const accessToken = await validSession(supabaseUrl, anon);
fs.mkdirSync(outputDir, { recursive: true });

const pending = selected.filter((target) => {
  const file = path.join(outputDir, target.output);
  if (fixtureLooksReusable(file, target.invoice.fileName)) {
    const fixture = JSON.parse(fs.readFileSync(file, "utf8"));
    const ar = fixture.azureEvidence?.analyzeResult || {};
    const lineCount = (ar.pages || []).reduce(
      (sum, page) => sum + (page.lines || []).length,
      0,
    );
    const cellCount = (ar.tables || []).reduce(
      (sum, table) => sum + (table.cells || []).length,
      0,
    );
    console.log(
      `Reusing already captured real fixture: ${target.output} ` +
      `sha=${fixture.rawResultSha256.slice(0, 12)} ` +
      `lines=${lineCount} cells=${cellCount}`,
    );
    return false;
  }
  return true;
});

if (pending.length) {
  // The prior failed capture can leave Azure DI F0's per-minute quota hot.
  // Waiting once here makes the run deterministic instead of racing the quota.
  console.log(
    `Azure DI F0 pacing: ${pending.length} fixture(s) still need capture. ` +
    `Waiting 35s before the first new analyze request...`,
  );
  await new Promise((resolve) => setTimeout(resolve, 35_000));
}

for (let i = 0; i < pending.length; i += 1) {
  const target = pending[i];
  console.log(`Capturing Azure evidence: ${target.invoice.fileName}`);
  const payload = await callForensic(supabaseUrl, anon, accessToken, target.invoice);

  const fixture = {
    fixtureSchema: "WSP_AZURE_FINANCE_EVIDENCE_V1",
    capturedAt: new Date().toISOString(),
    devRef: DEV_REF,
    sourceFileName: target.invoice.fileName,
    sourceImageMarker: target.invoice.marker,
    model: "prebuilt-invoice",
    apiVersion: payload.apiVersion,
    features: payload.features,
    rawResultSha256: payload.rawResultSha256,
    synthetic: false,
    azureEvidence: payload.azureEvidence,
  };

  fs.writeFileSync(
    path.join(outputDir, target.output),
    JSON.stringify(fixture, null, 2) + "\n",
  );

  const ar = fixture.azureEvidence?.analyzeResult || {};
  const lineCount = (ar.pages || []).reduce(
    (sum, page) => sum + (page.lines || []).length,
    0,
  );
  const cellCount = (ar.tables || []).reduce(
    (sum, table) => sum + (table.cells || []).length,
    0,
  );

  console.log(
    `  ${target.output}: sha=${fixture.rawResultSha256.slice(0, 12)} ` +
    `lines=${lineCount} cells=${cellCount} kv=${(ar.keyValuePairs || []).length}`,
  );

  if (i < pending.length - 1) {
    console.log(
      `Azure DI F0 pacing: waiting 35s before the next physical invoice...`,
    );
    await new Promise((resolve) => setTimeout(resolve, 35_000));
  }
}
