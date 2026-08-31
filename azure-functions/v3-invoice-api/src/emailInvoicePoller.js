import { app } from "@azure/functions";
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import crypto from "node:crypto";

const GMAIL_EMAIL = String(process.env.GMAIL_EMAIL || "").trim().toLowerCase();
const GMAIL_APP_PASSWORD = String(process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
const POLL_ENABLED = String(process.env.EMAIL_POLL_ENABLED || "false").toLowerCase() === "true";
const STORAGE_ACCOUNT = process.env.INVOICE_STORAGE_ACCOUNT;
const STORAGE_CONTAINER = process.env.INVOICE_STORAGE_CONTAINER || "invoice-documents";
const SUPABASE_URL = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
const AUTOMATION_SECRET = process.env.WSP_INVOICE_AUTOMATION_SECRET || "";
const DOCINTEL_ENDPOINT = String(process.env.DOCUMENT_INTELLIGENCE_ENDPOINT || "").replace(/\/$/, "");
const DOCINTEL_KEY = process.env.DOCUMENT_INTELLIGENCE_KEY || "";
const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || "Asia/Kolkata";
const MAX_BYTES = Number(process.env.EMAIL_MAX_ATTACHMENT_BYTES || 4 * 1024 * 1024);
const START_UID = Number(process.env.EMAIL_START_UID || 0);
const MIME_ALLOW = new Set(["application/pdf", "image/jpeg", "image/png"]);
const EXT_ALLOW = new Set(["pdf", "jpg", "jpeg", "png"]);

const json = (status, body) => ({ status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, jsonBody: body });
function safeLogSender(address = "") {
  const [local = "", domain = ""] = String(address).split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}
function safeName(name) {
  const raw = String(name || "invoice").trim().replace(/[/\\]/g, "_");
  const dot = raw.lastIndexOf(".");
  const base = (dot > 0 ? raw.slice(0, dot) : raw).replace(/[^a-zA-Z0-9._ -]+/g, "_").replace(/\s+/g, " ").trim().slice(0, 140) || "invoice";
  const ext = dot > 0 ? raw.slice(dot + 1).replace(/[^a-zA-Z0-9]+/g, "").slice(0, 10).toLowerCase() : "";
  return { base, ext };
}
function dateParts(date = new Date()) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: BUSINESS_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" });
  const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
  return { year: p.year, month: p.month, mmddyyyy: `${p.month}${p.day}${p.year}` };
}
function storedName(name, date) {
  const { base, ext } = safeName(name);
  const { mmddyyyy } = dateParts(date);
  return `${base}_${mmddyyyy}${ext ? `.${ext}` : ""}`;
}
function storage() {
  if (!STORAGE_ACCOUNT) throw new Error("INVOICE_STORAGE_ACCOUNT is not configured");
  return new BlobServiceClient(`https://${STORAGE_ACCOUNT}.blob.core.windows.net`, new DefaultAzureCredential());
}
function requireConfig() {
  const missing = [];
  if (!GMAIL_EMAIL) missing.push("GMAIL_EMAIL");
  if (!GMAIL_APP_PASSWORD) missing.push("GMAIL_APP_PASSWORD");
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!AUTOMATION_SECRET) missing.push("WSP_INVOICE_AUTOMATION_SECRET");
  if (!DOCINTEL_ENDPOINT) missing.push("DOCUMENT_INTELLIGENCE_ENDPOINT");
  if (!DOCINTEL_KEY) missing.push("DOCUMENT_INTELLIGENCE_KEY");
  if (!STORAGE_ACCOUNT) missing.push("INVOICE_STORAGE_ACCOUNT");
  if (missing.length) throw new Error(`Missing Email invoice configuration: ${missing.join(", ")}`);
}
function imapClient() {
  return new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD },
    logger: false,
    socketTimeout: 30000,
  });
}
async function automation(action, body) {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/invoice-automation-ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-wsp-automation-secret": AUTOMATION_SECRET },
    body: JSON.stringify({ action, ...body }),
  });
  const payload = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(payload?.error || `Automation request failed (${r.status})`);
    e.statusCode = r.status;
    throw e;
  }
  return payload;
}
async function analyzeInvoice(bytes, contentType) {
  const start = await fetch(`${DOCINTEL_ENDPOINT}/documentintelligence/documentModels/prebuilt-invoice:analyze?api-version=2024-11-30`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": DOCINTEL_KEY, "Content-Type": contentType },
    body: bytes,
  });
  if (!start.ok) throw new Error(`Document Intelligence analyze failed (${start.status}): ${(await start.text()).slice(0, 300)}`);
  const operation = start.headers.get("operation-location");
  if (!operation) throw new Error("Document Intelligence did not return operation-location");
  for (let i = 0; i < 45; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const poll = await fetch(operation, { headers: { "Ocp-Apim-Subscription-Key": DOCINTEL_KEY } });
    const result = await poll.json().catch(() => ({}));
    if (!poll.ok) throw new Error(`Document Intelligence poll failed (${poll.status})`);
    const status = String(result?.status || "").toLowerCase();
    if (status === "succeeded") return result;
    if (status === "failed" || status === "canceled") return result;
  }
  throw new Error("Document Intelligence timed out while polling invoice result");
}
function acceptedAttachment(a) {
  const filename = String(a?.filename || "");
  const ext = safeName(filename).ext;
  return a?.content?.length > 0 && a.content.length <= MAX_BYTES && (MIME_ALLOW.has(String(a.contentType || "").toLowerCase()) || EXT_ALLOW.has(ext));
}
async function processAttachment(context, sender, messageId, attachment) {
  const filename = attachment.filename || `invoice-${crypto.randomUUID()}.pdf`;
  const contentType = String(attachment.contentType || "application/octet-stream").toLowerCase();
  const bytes = Buffer.from(attachment.content);
  const base64 = bytes.toString("base64");
  const pre = await automation("preflight", {
    source: "EMAIL",
    source_identity: sender,
    source_message_id: messageId,
    original_file_name: filename,
    content_base64: base64,
  });
  if (pre?.duplicate) {
    context.log("Email invoice duplicate skipped", { duplicateType: pre.duplicate_type, existingIngestionId: pre.existing_ingestion_id });
    return { duplicate: true, ingestionId: pre.existing_ingestion_id };
  }
  const ingestionId = crypto.randomUUID();
  const receivedAt = new Date();
  const parts = dateParts(receivedAt);
  const finalName = storedName(filename, receivedAt);
  const blobPath = `${pre.shop_id}/${parts.year}/${parts.month}/${ingestionId}/${finalName}`;
  const blob = storage().getContainerClient(STORAGE_CONTAINER).getBlockBlobClient(blobPath);
  await blob.uploadData(bytes, { blobHTTPHeaders: { blobContentType: contentType, blobContentDisposition: `inline; filename="${finalName.replaceAll('"', "")}"` } });
  let ocr;
  try {
    ocr = await analyzeInvoice(bytes, contentType);
  } catch (e) {
    ocr = { status: "failed", error: String(e?.message || e) };
  }
  try {
    const recorded = await automation("record_result", {
      ingestion_id: ingestionId,
      source: "EMAIL",
      source_identity: sender,
      source_message_id: messageId,
      shop_id: pre.shop_id,
      original_file_name: filename,
      stored_file_name: finalName,
      blob_container: STORAGE_CONTAINER,
      blob_path: blobPath,
      content_type: contentType,
      size_bytes: bytes.length,
      sha256: pre.sha256,
      received_at: receivedAt.toISOString(),
      ocr_result: ocr,
    });
    context.log("Email invoice ingested", { ingestionId, reviewStatus: recorded?.ingestion?.review_status, sender: safeLogSender(sender), sizeBytes: bytes.length });
    return { duplicate: false, ingestionId, reviewStatus: recorded?.ingestion?.review_status };
  } catch (e) {
    try { await blob.deleteIfExists(); } catch {}
    throw e;
  }
}
async function pollMailbox(context) {
  requireConfig();
  if (!POLL_ENABLED) return { enabled: false, checked: 0, processed: 0 };
  const client = imapClient();
  let lock;
  let checked = 0;
  let processed = 0;
  try {
    await client.connect();
    lock = await client.getMailboxLock("INBOX");
    const unseen = await client.search({ seen: false }, { uid: true });
    const uids = unseen.filter((uid) => Number(uid) > START_UID).slice(-10);
    for (const uid of uids) {
      checked += 1;
      let markSeen = false;
      try {
        const msg = await client.fetchOne(uid, { source: true, uid: true }, { uid: true });
        if (!msg?.source) continue;
        const parsed = await simpleParser(msg.source);
        const sender = String(parsed?.from?.value?.[0]?.address || "").trim().toLowerCase();
        const messageId = String(parsed?.messageId || `gmail-uid-${uid}`).slice(0, 500);
        const attachments = (parsed?.attachments || []).filter(acceptedAttachment);
        if (!sender || attachments.length === 0) {
          markSeen = true;
          continue;
        }
        for (const attachment of attachments) {
          await processAttachment(context, sender, messageId, attachment);
          processed += 1;
        }
        markSeen = true;
      } catch (e) {
        if (Number(e?.statusCode) === 403) {
          context.warn("Email ignored because sender is not registered to a shop", { uid });
          markSeen = true;
        } else {
          context.error("Email invoice processing failed; message left unread for retry", { uid, error: String(e?.message || e).slice(0, 240) });
        }
      }
      if (markSeen) await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
    }
    return { enabled: true, checked, processed };
  } finally {
    if (lock) lock.release();
    try { await client.logout(); } catch {}
  }
}

app.http("email-invoice-health", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "email/health",
  handler: async (_request, context) => {
    try {
      requireConfig();
      const client = imapClient();
      await client.connect();
      await client.mailboxOpen("INBOX", { readOnly: true });
      await client.logout();
      return json(200, { ok: true, configured: true, imapConnected: true, pollEnabled: POLL_ENABLED, mailboxProvider: "Gmail", startCheckpointConfigured: START_UID >= 0, maxAttachmentBytes: MAX_BYTES, inventoryMutation: false });
    } catch (e) {
      context.error("Email invoice health failed", { error: String(e?.message || e).slice(0, 240) });
      return json(503, { ok: false, configured: false, imapConnected: false, error: "Email ingestion is not ready." });
    }
  },
});

app.timer("email-invoice-poller", {
  schedule: "0 */5 * * * *",
  runOnStartup: false,
  handler: async (_timer, context) => {
    try {
      const result = await pollMailbox(context);
      context.log("Email invoice poll complete", result);
    } catch (e) {
      context.error("Email invoice poll failed", { error: String(e?.message || e).slice(0, 240) });
    }
  },
});
