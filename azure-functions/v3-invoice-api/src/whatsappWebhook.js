import { app } from "@azure/functions";
import crypto from "node:crypto";

const VERIFY_TOKEN = process.env.META_WHATSAPP_VERIFY_TOKEN || "";
const APP_SECRET = process.env.META_APP_SECRET || "";
const PHONE_NUMBER_ID = process.env.META_WHATSAPP_PHONE_NUMBER_ID || "";
const WABA_ID = process.env.META_WHATSAPP_WABA_ID || "";
const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v25.0";

function json(status, body) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    jsonBody: body,
  };
}

function text(status, body) {
  return {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: String(body),
  };
}

function safeEqualText(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function validMetaSignature(rawBody, signatureHeader) {
  if (!APP_SECRET || !signatureHeader?.startsWith("sha256=")) return false;
  const suppliedHex = signatureHeader.slice("sha256=".length).trim();
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false;

  const expected = crypto
    .createHmac("sha256", APP_SECRET)
    .update(rawBody, "utf8")
    .digest("hex");

  return safeEqualText(expected.toLowerCase(), suppliedHex.toLowerCase());
}

function last4(value) {
  const raw = String(value || "");
  return raw.length <= 4 ? raw : raw.slice(-4);
}

function extractInboundMessages(payload) {
  const rows = [];

  for (const entry of payload?.entry || []) {
    for (const change of entry?.changes || []) {
      const value = change?.value || {};
      const metadataPhoneId = String(value?.metadata?.phone_number_id || "");

      for (const message of value?.messages || []) {
        rows.push({
          id: String(message?.id || ""),
          from: String(message?.from || ""),
          type: String(message?.type || "unknown"),
          timestamp: String(message?.timestamp || ""),
          metadataPhoneId,
          mediaId:
            message?.document?.id ||
            message?.image?.id ||
            message?.audio?.id ||
            message?.video?.id ||
            null,
          fileName: message?.document?.filename || null,
          mimeType:
            message?.document?.mime_type ||
            message?.image?.mime_type ||
            message?.audio?.mime_type ||
            message?.video?.mime_type ||
            null,
        });
      }
    }
  }

  return rows;
}

app.http("whatsapp-webhook", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "whatsapp/webhook",
  handler: async (request, context) => {
    if (request.method === "GET") {
      const mode = request.query.get("hub.mode") || "";
      const token = request.query.get("hub.verify_token") || "";
      const challenge = request.query.get("hub.challenge") || "";

      if (
        mode === "subscribe" &&
        VERIFY_TOKEN &&
        safeEqualText(token, VERIFY_TOKEN)
      ) {
        context.log("WhatsApp webhook verification accepted");
        return text(200, challenge);
      }

      context.warn("WhatsApp webhook verification rejected", {
        mode,
        tokenPresent: Boolean(token),
      });
      return text(403, "Forbidden");
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256") || "";

    if (!validMetaSignature(rawBody, signature)) {
      context.warn("WhatsApp webhook signature rejected");
      return json(401, { ok: false, error: "Invalid Meta webhook signature." });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody || "{}");
    } catch {
      return json(400, { ok: false, error: "Invalid webhook JSON." });
    }

    const messages = extractInboundMessages(payload);
    let accepted = 0;

    for (const message of messages) {
      if (PHONE_NUMBER_ID && message.metadataPhoneId !== PHONE_NUMBER_ID) {
        context.warn("WhatsApp webhook ignored unexpected phone_number_id", {
          receivedPhoneNumberId: message.metadataPhoneId,
        });
        continue;
      }

      accepted += 1;
      context.log("WhatsApp inbound accepted", {
        messageId: message.id,
        senderLast4: last4(message.from),
        type: message.type,
        timestamp: message.timestamp,
        hasMedia: Boolean(message.mediaId),
        mediaIdLast4: last4(message.mediaId),
        fileName: message.fileName,
        mimeType: message.mimeType,
      });
    }

    return json(200, {
      ok: true,
      accepted,
    });
  },
});

app.http("whatsapp-webhook-health", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "whatsapp/health",
  handler: async () =>
    json(200, {
      ok: true,
      service: "WineShopPOS V3 WhatsApp Webhook",
      verifyTokenConfigured: Boolean(VERIFY_TOKEN),
      appSecretConfigured: Boolean(APP_SECRET),
      accessTokenRequiredForWebhookStep1: false,
      phoneNumberIdConfigured: Boolean(PHONE_NUMBER_ID),
      wabaIdConfigured: Boolean(WABA_ID),
      graphVersion: GRAPH_VERSION,
      mediaIngestionEnabled: false,
      inventoryMutationEnabled: false,
    }),
});
