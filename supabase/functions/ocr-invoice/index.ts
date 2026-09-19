import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeDocumentIntelligenceResult } from "../_shared/invoiceDocument.js";
import { resolveInvoiceExceptions } from "../_shared/invoiceResolutionFallback.js";
import {
  applySecondaryOcrConsensus,
  buildVisionReadSummary,
} from "../_shared/invoiceSecondaryOcr.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function getSupabasePublicKey() {
  const legacyAnon = Deno.env.get("SUPABASE_ANON_KEY");
  if (legacyAnon) return legacyAnon;

  const raw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.default) return parsed.default;
      const first = Object.values(parsed ?? {}).find((value) => typeof value === "string");
      if (first) return String(first);
    } catch {
      // continue to explicit configuration error
    }
  }

  throw new Error("Supabase publishable key is not available in Edge Function environment");
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function runDocumentIntelligence({
  endpoint,
  key,
  contentBase64,
  correlationId,
}: {
  endpoint: string;
  key: string;
  contentBase64: string;
  correlationId: string;
}) {
  const analyzeUrl = `${endpoint}/documentintelligence/documentModels/prebuilt-invoice:analyze?_overload=analyzeDocument&api-version=2024-11-30&features=keyValuePairs`;
  const analyze = await fetch(analyzeUrl, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/json",
      "x-ms-client-request-id": correlationId,
    },
    body: JSON.stringify({ base64Source: contentBase64 }),
  });

  if (!analyze.ok) {
    throw new Error(`Azure OCR analyze failed: ${analyze.status} ${await analyze.text()}`);
  }

  const operation = analyze.headers.get("operation-location");
  if (!operation) throw new Error("Azure OCR did not return operation-location");

  let result: any = null;
  for (let attempt = 0; attempt < 45; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const poll = await fetch(operation, {
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "x-ms-client-request-id": correlationId,
      },
    });
    if (!poll.ok) throw new Error(`Azure OCR poll failed: ${poll.status}`);
    result = await poll.json();
    if (result.status === "succeeded") return result;
    if (result.status === "failed") {
      throw new Error(`Azure OCR analysis failed: ${JSON.stringify(result?.error || result)}`);
    }
  }
  throw new Error("Azure OCR timed out");
}

async function runVisionRead({
  endpoint,
  key,
  bytes,
  correlationId,
}: {
  endpoint: string;
  key: string;
  bytes: Uint8Array;
  correlationId: string;
}) {
  const submitUrl = `${endpoint}/vision/v3.2/read/analyze?readingOrder=natural`;
  const submit = await fetch(submitUrl, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/octet-stream",
      "x-ms-client-request-id": correlationId,
    },
    body: bytes,
  });

  if (!submit.ok) {
    throw new Error(`Azure Vision Read submit failed: ${submit.status} ${await submit.text()}`);
  }

  const operation = submit.headers.get("operation-location");
  if (!operation) throw new Error("Azure Vision Read did not return operation-location");

  let result: any = null;
  for (let attempt = 0; attempt < 45; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const poll = await fetch(operation, {
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "x-ms-client-request-id": correlationId,
      },
    });
    if (!poll.ok) throw new Error(`Azure Vision Read poll failed: ${poll.status}`);
    result = await poll.json();
    const status = String(result?.status || "").toLowerCase();
    if (status === "succeeded") return result;
    if (status === "failed") {
      throw new Error(`Azure Vision Read failed: ${JSON.stringify(result?.error || result)}`);
    }
  }
  throw new Error("Azure Vision Read timed out");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!supabaseUrl) throw new Error("SUPABASE_URL is not configured");

    const client = createClient(supabaseUrl, getSupabasePublicKey(), {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user) throw new Error("Invalid session");

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("role,active,shop_id")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile?.active ||
      !["ADMIN", "MANAGER"].includes(profile.role)
    ) {
      throw new Error("Manager or Admin role required");
    }

    const diEndpoint = (Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT") || "").replace(/\/$/, "");
    const diKey = Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_KEY") || "";

    if (!diEndpoint || !diKey) {
      return json(
        {
          ok: false,
          code: "OCR_NOT_CONFIGURED",
          message: "Azure Document Intelligence secrets are not configured yet.",
        },
        400,
      );
    }

    const body = await req.json();
    const contentBase64 = String(body?.contentBase64 || "");
    const ingestionId = String(body?.ingestionId || "").trim() || null;
    const correlationId = ingestionId || crypto.randomUUID();
    if (!contentBase64) throw new Error("Document content is required");

    const estimatedBytes = Math.floor((contentBase64.length * 3) / 4);
    if (estimatedBytes > 4 * 1024 * 1024) {
      throw new Error("Document exceeds the current 4 MB invoice OCR safety limit");
    }

    const secondaryEnabled = Deno.env.get("WSP_SECONDARY_OCR_ENABLED") === "true";
    const visionEndpoint = (Deno.env.get("AZURE_VISION_ENDPOINT") || "").replace(/\/$/, "");
    const visionKey = Deno.env.get("AZURE_VISION_KEY") || "";
    const bytes = decodeBase64(contentBase64);

    const primaryPromise = runDocumentIntelligence({
      endpoint: diEndpoint,
      key: diKey,
      contentBase64,
      correlationId,
    });

    const secondaryPromise = secondaryEnabled && visionEndpoint && visionKey
      ? runVisionRead({
          endpoint: visionEndpoint,
          key: visionKey,
          bytes,
          correlationId,
        })
          .then((payload) => ({ ok: true, payload, reason: null }))
          .catch((error) => ({
            ok: false,
            payload: null,
            reason: error instanceof Error ? error.message.slice(0, 180) : "VISION_READ_FAILED",
          }))
      : Promise.resolve({
          ok: false,
          payload: null,
          reason: secondaryEnabled ? "VISION_NOT_CONFIGURED" : "VISION_DISABLED",
        });

    const [primaryResult, secondaryResult] = await Promise.all([
      primaryPromise,
      secondaryPromise,
    ]);

    let invoice = normalizeDocumentIntelligenceResult(primaryResult);

    const secondaryOcr = secondaryResult.ok
      ? buildVisionReadSummary(secondaryResult.payload, invoice, primaryResult)
      : {
          provider: "AZURE_VISION_READ_3_2",
          status: secondaryResult.reason || "UNAVAILABLE",
          lineCount: 0,
          evidence: [],
          dateCandidates: [],
          invoiceNumberCandidates: [],
          totalCandidates: [],
          supplierCandidates: [],
          itemBatches: {},
          chosen: {},
        };

    invoice = applySecondaryOcrConsensus(invoice, secondaryOcr);

    try {
      invoice = await resolveInvoiceExceptions({
        analyzeResult: primaryResult,
        secondaryOcr,
        invoice,
        supabase: client,
        ingestionId,
        config: {
          enabled: Deno.env.get("WSP_INVOICE_AI_ENABLED") === "true",
          baseUrl: Deno.env.get("WSP_INVOICE_AI_BASE_URL") || "",
          apiKey: Deno.env.get("WSP_INVOICE_AI_API_KEY") || "",
          model: Deno.env.get("WSP_INVOICE_AI_MODEL") || "",
          timeoutMs: Number(Deno.env.get("WSP_INVOICE_AI_TIMEOUT_MS") || "18000"),
          correlationId,
        },
      });
    } catch (resolverError) {
      invoice = {
        ...invoice,
        resolutionAssist: {
          attempted: true,
          aiCalled: false,
          reason: "RESOLVER_FAIL_OPEN_TO_MANUAL_REVIEW",
          requiresHumanConfirmation: true,
        },
      };
      console.error(
        "Invoice exception resolver failed safely",
        String(resolverError instanceof Error ? resolverError.message : resolverError).slice(0, 180),
      );
    }

    console.log(JSON.stringify({
      event: "WSP_OCR_TRACE",
      correlationId,
      ingestionId,
      secondaryStatus: secondaryOcr?.status || "UNAVAILABLE",
      crossOcrStatus: invoice?.crossOcr?.status || "UNAVAILABLE",
      reviewTargetCount: invoice?.crossOcr?.reviewTargets?.length || 0,
      aiCalled: Boolean(invoice?.resolutionAssist?.aiCalled),
      aiReason: invoice?.resolutionAssist?.aiReason || null,
      aiProviderStatus: invoice?.resolutionAssist?.aiDiagnostics?.providerStatus || null,
      aiInputTokens: invoice?.resolutionAssist?.aiDiagnostics?.inputTokens ?? null,
      aiReasoningTokens: invoice?.resolutionAssist?.aiDiagnostics?.reasoningTokens ?? null,
      aiOutputTokens: invoice?.resolutionAssist?.aiDiagnostics?.outputTokens ?? null,
    }));

    return json({
      ok: true,
      correlationId,
      invoice,
      rawConfidence: invoice?.ocrQuality?.documentConfidence ?? null,
      model: "prebuilt-invoice+semantic-table+azure-vision-read-3.2",
      apiVersion: "DI:2024-11-30|Vision:3.2",
      features: ["keyValuePairs", "parallelSecondaryRead", "crossOcrConsensus"],
      secondaryOcr: {
        provider: secondaryOcr.provider,
        status: secondaryOcr.status,
        lineCount: secondaryOcr.lineCount,
        crossOcrStatus: invoice?.crossOcr?.status || "UNAVAILABLE",
        reviewTargetCount: invoice?.crossOcr?.reviewTargets?.length || 0,
      },
    });
  } catch (error) {
    return json(
      {
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      },
      400,
    );
  }
});
