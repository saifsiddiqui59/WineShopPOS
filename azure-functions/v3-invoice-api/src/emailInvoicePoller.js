import { app } from "@azure/functions";
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import crypto from "node:crypto";

const GMAIL_EMAIL = String(process.env.GMAIL_EMAIL || "").trim().toLowerCase();
const GMAIL_APP_PASSWORD = String(process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
const POLL_ENABLED = String(process.env.EMAIL_POLL_ENABLED || "false").toLowerCase() === "true";
const POLL_SECRET = String(process.env.EMAIL_POLL_SECRET || "");
const STORAGE_ACCOUNT = process.env.INVOICE_STORAGE_ACCOUNT;
const STORAGE_CONTAINER = process.env.INVOICE_STORAGE_CONTAINER || "invoice-documents";
const CHECKPOINT_BLOB = process.env.EMAIL_CHECKPOINT_BLOB || "_system/email/gmail-invoice-checkpoint.json";
const OVERSIZE_MARKER_PREFIX = process.env.EMAIL_OVERSIZE_MARKER_PREFIX || "_system/email/oversize-notified";
const SUPABASE_URL = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
const AUTOMATION_SECRET = process.env.WSP_INVOICE_AUTOMATION_SECRET || "";
const DOCINTEL_ENDPOINT = String(process.env.DOCUMENT_INTELLIGENCE_ENDPOINT || "").replace(/\/$/, "");
const DOCINTEL_KEY = process.env.DOCUMENT_INTELLIGENCE_KEY || "";
const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || "Asia/Kolkata";
const MAX_BYTES = Number(process.env.EMAIL_MAX_ATTACHMENT_BYTES || 4 * 1024 * 1024);
const START_UID = Number(process.env.EMAIL_START_UID || 0);
const MIME_ALLOW = new Set(["application/pdf", "image/jpeg", "image/png"]);
const EXT_ALLOW = new Set(["pdf", "jpg", "jpeg", "png"]);

const json = (status, body) => ({
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  jsonBody: body,
});

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");
  return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right);
}
function safeLogSender(address = "") {
  const [local = "", domain = ""] = String(address).split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}
function safeName(name) {
  const raw = String(name || "invoice").trim().replace(/[/\\]/g, "_");
  const dot = raw.lastIndexOf(".");
  const base = (dot > 0 ? raw.slice(0, dot) : raw)
    .replace(/[^a-zA-Z0-9._ -]+/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140) || "invoice";
  const ext = dot > 0 ? raw.slice(dot + 1).replace(/[^a-zA-Z0-9]+/g, "").slice(0, 10).toLowerCase() : "";
  return { base, ext };
}
function mb(bytes) {
  return `${(Number(bytes || 0) / 1024 / 1024).toFixed(2)} MB`;
}
function dateParts(date = new Date()) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
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
  return new BlobServiceClient(
    `https://${STORAGE_ACCOUNT}.blob.core.windows.net`,
    new DefaultAzureCredential(),
  );
}
function checkpointBlob() {
  return storage().getContainerClient(STORAGE_CONTAINER).getBlockBlobClient(CHECKPOINT_BLOB);
}
function oversizeMarker(uid) {
  return storage()
    .getContainerClient(STORAGE_CONTAINER)
    .getBlockBlobClient(`${OVERSIZE_MARKER_PREFIX}/${Number(uid)}.json`);
}
async function loadCheckpoint() {
  const blob = checkpointBlob();
  try {
    const buffer = await blob.downloadToBuffer();
    const payload = JSON.parse(buffer.toString("utf8"));
    const lastUid = Number(payload?.lastUid || 0);
    return Math.max(Number.isFinite(lastUid) ? lastUid : 0, START_UID);
  } catch (error) {
    if (Number(error?.statusCode || error?.status) === 404) return START_UID;
    throw error;
  }
}
async function saveCheckpoint(lastUid) {
  const payload = Buffer.from(JSON.stringify({
    mailbox: GMAIL_EMAIL,
    lastUid: Number(lastUid),
    updatedAt: new Date().toISOString(),
  }), "utf8");
  await checkpointBlob().uploadData(payload, {
    blobHTTPHeaders: { blobContentType: "application/json" },
  });
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
function smtpClient() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });
}
async function automation(action, body) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/invoice-automation-ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wsp-automation-secret": AUTOMATION_SECRET,
    },
    body: JSON.stringify({ action, ...body }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.error || `Automation request failed (${response.status})`);
    error.statusCode = response.status;
    throw error;
  }
  return payload;
}
async function analyzeInvoice(bytes, contentType) {
  const start = await fetch(
    `${DOCINTEL_ENDPOINT}/documentintelligence/documentModels/prebuilt-invoice:analyze?api-version=2024-11-30`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": DOCINTEL_KEY,
        "Content-Type": contentType,
      },
      body: bytes,
    },
  );
  if (!start.ok) {
    throw new Error(`Document Intelligence analyze failed (${start.status}): ${(await start.text()).slice(0, 300)}`);
  }
  const operation = start.headers.get("operation-location");
  if (!operation) throw new Error("Document Intelligence did not return operation-location");

  for (let i = 0; i < 45; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const poll = await fetch(operation, {
      headers: { "Ocp-Apim-Subscription-Key": DOCINTEL_KEY },
    });
    const result = await poll.json().catch(() => ({}));
    if (!poll.ok) throw new Error(`Document Intelligence poll failed (${poll.status})`);
    const status = String(result?.status || "").toLowerCase();
    if (status === "succeeded") return result;
    if (status === "failed" || status === "canceled") return result;
  }
  throw new Error("Document Intelligence timed out while polling invoice result");
}
function invoiceAttachment(attachment) {
  const filename = String(attachment?.filename || "");
  const ext = safeName(filename).ext;
  return (
    attachment?.content?.length > 0 &&
    (
      MIME_ALLOW.has(String(attachment.contentType || "").toLowerCase()) ||
      EXT_ALLOW.has(ext)
    )
  );
}
async function oversizeAlreadyNotified(uid) {
  return oversizeMarker(uid).exists();
}
async function recordOversizeNotification(uid, sender, messageId, attachments) {
  const payload = Buffer.from(JSON.stringify({
    uid: Number(uid),
    senderHash: crypto.createHash("sha256").update(String(sender)).digest("hex"),
    messageIdHash: crypto.createHash("sha256").update(String(messageId)).digest("hex"),
    attachments: attachments.map((a) => ({
      filename: String(a.filename || "invoice"),
      sizeBytes: Number(a.content?.length || 0),
    })),
    sentAt: new Date().toISOString(),
  }), "utf8");
  await oversizeMarker(uid).uploadData(payload, {
    blobHTTPHeaders: { blobContentType: "application/json" },
  });
}
async function sendOversizeFeedback(context, uid, sender, messageId, subject, attachments) {
  if (!attachments.length) return { sent: false, reason: "NONE" };
  if (await oversizeAlreadyNotified(uid)) {
    context.log("Oversize Email feedback already sent", { uid, sender: safeLogSender(sender) });
    return { sent: false, reason: "ALREADY_SENT" };
  }

  const lines = attachments.map((a) =>
    `- ${String(a.filename || "invoice attachment")}: ${mb(a.content?.length || 0)}`
  );
  const allowed = mb(MAX_BYTES);
  const body = [
    "WineShopPOS received your Email, but one or more invoice attachments are too large to process.",
    "",
    ...lines,
    "",
    `Current maximum supported attachment size: ${allowed}.`,
    "Please compress the PDF/image below the limit and resend it.",
    "",
    "No purchase or inventory transaction was created for the oversized attachment.",
    "",
    "This is an automated WineShopPOS message.",
  ].join("\n");

  const transport = smtpClient();
  await transport.sendMail({
    from: `WineShopPOS <${GMAIL_EMAIL}>`,
    to: sender,
    subject: `WineShopPOS – Invoice attachment too large${subject ? ` – ${String(subject).slice(0, 80)}` : ""}`,
    text: body,
    inReplyTo: messageId || undefined,
    references: messageId ? [messageId] : undefined,
  });
  transport.close();

  await recordOversizeNotification(uid, sender, messageId, attachments);
  context.log("Oversize Email feedback sent", {
    uid,
    sender: safeLogSender(sender),
    attachmentCount: attachments.length,
  });
  return { sent: true };
}
async function processAttachment(context, sender, messageId, attachment) {
  const filename = attachment.filename || `invoice-${crypto.randomUUID()}.pdf`;
  const contentType = String(attachment.contentType || "application/octet-stream").toLowerCase();
  const bytes = Buffer.from(attachment.content);
  const base64 = bytes.toString("base64");

  const preflight = await automation("preflight", {
    source: "EMAIL",
    source_identity: sender,
    source_message_id: messageId,
    original_file_name: filename,
    content_base64: base64,
  });

  if (preflight?.duplicate) {
    context.log("Email invoice duplicate skipped", {
      duplicateType: preflight.duplicate_type,
      existingIngestionId: preflight.existing_ingestion_id,
    });
    return { duplicate: true, ingestionId: preflight.existing_ingestion_id };
  }

  const ingestionId = crypto.randomUUID();
  const receivedAt = new Date();
  const parts = dateParts(receivedAt);
  const finalName = storedName(filename, receivedAt);
  const blobPath = `${preflight.shop_id}/${parts.year}/${parts.month}/${ingestionId}/${finalName}`;
  const blob = storage().getContainerClient(STORAGE_CONTAINER).getBlockBlobClient(blobPath);

  await blob.uploadData(bytes, {
    blobHTTPHeaders: {
      blobContentType: contentType,
      blobContentDisposition: `inline; filename="${finalName.replaceAll('"', "")}"`,
    },
  });

  let ocr;
  try {
    ocr = await analyzeInvoice(bytes, contentType);
  } catch (error) {
    ocr = { status: "failed", error: String(error?.message || error) };
  }

  try {
    const recorded = await automation("record_result", {
      ingestion_id: ingestionId,
      source: "EMAIL",
      source_identity: sender,
      source_message_id: messageId,
      shop_id: preflight.shop_id,
      original_file_name: filename,
      stored_file_name: finalName,
      blob_container: STORAGE_CONTAINER,
      blob_path: blobPath,
      content_type: contentType,
      size_bytes: bytes.length,
      sha256: preflight.sha256,
      received_at: receivedAt.toISOString(),
      ocr_result: ocr,
    });

    context.log("Email invoice ingested", {
      ingestionId,
      reviewStatus: recorded?.ingestion?.review_status,
      sender: safeLogSender(sender),
      sizeBytes: bytes.length,
    });

    return {
      duplicate: false,
      ingestionId,
      reviewStatus: recorded?.ingestion?.review_status,
    };
  } catch (error) {
    try { await blob.deleteIfExists(); } catch {}
    throw error;
  }
}
async function pollMailbox(context) {
  requireConfig();
  if (!POLL_ENABLED) return { enabled: false, checked: 0, processed: 0 };

  const client = imapClient();
  let lock;
  let checked = 0;
  let processed = 0;
  let skipped = 0;
  let oversizeReplies = 0;
  let checkpoint = START_UID;

  try {
    await client.connect();
    lock = await client.getMailboxLock("INBOX");

    checkpoint = await loadCheckpoint();
    const allAfterCheckpoint = await client.search(
      { uid: `${Math.max(1, checkpoint + 1)}:*` },
      { uid: true },
    );

    const uids = [...new Set(allAfterCheckpoint.map(Number))]
      .filter((uid) => Number.isFinite(uid) && uid > checkpoint)
      .sort((a, b) => a - b)
      .slice(0, 20);

    for (const uid of uids) {
      checked += 1;
      let advance = false;

      try {
        const msg = await client.fetchOne(uid, { source: true, uid: true }, { uid: true });
        if (!msg?.source) {
          context.warn("Email source unavailable; checkpoint not advanced", { uid });
          break;
        }

        const parsed = await simpleParser(msg.source);
        const sender = String(parsed?.from?.value?.[0]?.address || "").trim().toLowerCase();
        const messageId = String(parsed?.messageId || `gmail-uid-${uid}`).slice(0, 500);
        const invoiceAttachments = (parsed?.attachments || []).filter(invoiceAttachment);
        const accepted = invoiceAttachments.filter((a) => Number(a.content?.length || 0) <= MAX_BYTES);
        const oversized = invoiceAttachments.filter((a) => Number(a.content?.length || 0) > MAX_BYTES);

        if (!sender || invoiceAttachments.length === 0) {
          skipped += 1;
          advance = true;
        } else {
          // Explicitly authorize before sending any feedback mail.
          if (oversized.length) {
            await automation("authorize_sender", {
              source: "EMAIL",
              source_identity: sender,
            });
            const feedback = await sendOversizeFeedback(
              context,
              uid,
              sender,
              messageId,
              parsed?.subject || "",
              oversized,
            );
            if (feedback.sent) oversizeReplies += 1;
          }

          for (const attachment of accepted) {
            await processAttachment(context, sender, messageId, attachment);
            processed += 1;
          }

          if (!accepted.length && oversized.length) skipped += 1;
          advance = true;
        }
      } catch (error) {
        if (Number(error?.statusCode) === 403) {
          context.warn("Email ignored because sender is not registered to a shop", { uid });
          skipped += 1;
          advance = true;
        } else {
          context.error("Email invoice processing failed; checkpoint retained for retry", {
            uid,
            error: String(error?.message || error).slice(0, 240),
          });
        }
      }

      if (!advance) break;

      try {
        await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
      } catch {}

      await saveCheckpoint(uid);
      checkpoint = uid;
    }

    return {
      enabled: true,
      checked,
      processed,
      skipped,
      oversizeReplies,
      checkpoint,
      readUnreadIndependent: true,
    };
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

      const transport = smtpClient();
      await transport.verify();
      transport.close();

      const checkpoint = await loadCheckpoint();

      return json(200, {
        ok: true,
        configured: true,
        imapConnected: true,
        smtpConnected: true,
        pollEnabled: POLL_ENABLED,
        mailboxProvider: "Gmail",
        checkpointMode: "BLOB_UID",
        checkpoint,
        readUnreadIndependent: true,
        schedulerEndpointConfigured: Boolean(POLL_SECRET),
        oversizeReplyEnabled: true,
        maxAttachmentBytes: MAX_BYTES,
        inventoryMutation: false,
      });
    } catch (error) {
      context.error("Email invoice health failed", {
        error: String(error?.message || error).slice(0, 240),
      });
      return json(503, {
        ok: false,
        configured: false,
        imapConnected: false,
        smtpConnected: false,
        error: "Email ingestion is not ready.",
      });
    }
  },
});

app.http("email-invoice-poll-now", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "email/poll",
  handler: async (request, context) => {
    if (!POLL_SECRET || !safeEqual(request.headers.get("x-wsp-email-scheduler-secret"), POLL_SECRET)) {
      return json(401, { ok: false, error: "Unauthorized scheduler caller." });
    }
    try {
      const result = await pollMailbox(context);
      return json(200, { ok: true, ...result });
    } catch (error) {
      context.error("Scheduled Email invoice poll failed", {
        error: String(error?.message || error).slice(0, 240),
      });
      return json(503, { ok: false, error: "Email poll failed." });
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
    } catch (error) {
      context.error("Email invoice poll failed", {
        error: String(error?.message || error).slice(0, 240),
      });
    }
  },
});
