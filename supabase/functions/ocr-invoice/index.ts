import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeDocumentIntelligenceResult } from "../_shared/invoiceDocument.js";
import { resolveInvoiceExceptions } from "../_shared/invoiceResolutionFallback.js";
import { buildShopAiFieldMatrix, estimatePdfPageCount, runShopAiReview } from "../_shared/invoiceShopAiReview.js";
import {
  applySecondaryOcrConsensus,
  buildVisionReadSummary,
} from "../_shared/invoiceSecondaryOcr.js";
import {
  analyzeAdaptiveRescueGroup,
  buildAdaptiveOcrPlan,
  mergeAdaptiveRescueResults,
} from "../_shared/invoiceAdaptiveOcr.js";

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

function encodeBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(bytes.length, offset + chunkSize));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function sha256Hex(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function persistAuthoritativeShopAiReview(
  serviceClient: any,
  ingestionId: string,
  shopId: string,
  review: any,
) {
  const { data, error } = await serviceClient
    .from("invoice_ingestions")
    .update({
      shopai_review: review,
      shopai_review_updated_at: new Date().toISOString(),
    })
    .eq("id", ingestionId)
    .eq("shop_id", shopId)
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error("SHOPAI_AUTHORITATIVE_PERSIST_FAILED");
  }
}

async function resolveCanonicalInvoiceDocument({
  client,
  ingestionId,
  requestContentBase64,
  requestContentType,
  authHeader,
  shopId,
}: {
  client: any;
  ingestionId: string;
  requestContentBase64: string;
  requestContentType: string;
  authHeader: string;
  shopId: string;
}) {
  const { data: stored, error: storedError } = await client
    .from("invoice_ingestions")
    .select("id,sha256,content_type,size_bytes,original_file_name")
    .eq("id", ingestionId)
    .eq("shop_id", shopId)
    .single();

  if (storedError || !stored) {
    throw new Error("Stored invoice audit record is unavailable");
  }

  const expectedHash = String(stored.sha256 || "").trim().toLowerCase();
  if (!expectedHash) throw new Error("Stored invoice SHA-256 is unavailable");

  const requestBytes = requestContentBase64
    ? decodeBase64(requestContentBase64)
    : new Uint8Array();

  if (requestBytes.length) {
    if (requestBytes.length > 4 * 1024 * 1024) {
      throw new Error("Document exceeds the current 4 MB invoice OCR safety limit");
    }
    const requestHash = await sha256Hex(requestBytes);
    if (requestHash === expectedHash) {
      return {
        bytes: requestBytes,
        contentBase64: requestContentBase64,
        contentType: String(stored.content_type || requestContentType || "application/octet-stream"),
        fileName: String(stored.original_file_name || "invoice"),
        sha256: expectedHash,
        source: "REQUEST_HASH_MATCH",
      };
    }
  }

  const storageApi = String(Deno.env.get("WSP_INVOICE_STORAGE_API_URL") || "")
    .replace(/\/+$/, "");
  if (!storageApi) {
    throw new Error("Canonical Blob fallback is not configured");
  }

  const readUrlResponse = await fetch(`${storageApi}/api/invoice/read-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({ ingestion_id: ingestionId }),
  });
  if (!readUrlResponse.ok) {
    throw new Error(`Stored invoice read authorization failed: ${readUrlResponse.status}`);
  }

  const readPayload = await readUrlResponse.json();
  const privateReadUrl = String(readPayload?.url || "");
  if (!privateReadUrl) throw new Error("Stored invoice read URL was not returned");

  const blobResponse = await fetch(privateReadUrl);
  if (!blobResponse.ok) {
    throw new Error(`Stored invoice Blob fetch failed: ${blobResponse.status}`);
  }

  const bytes = new Uint8Array(await blobResponse.arrayBuffer());
  if (!bytes.length || bytes.length > 4 * 1024 * 1024) {
    throw new Error("Stored invoice Blob size is outside the OCR safety limit");
  }
  const blobHash = await sha256Hex(bytes);
  if (blobHash !== expectedHash) {
    throw new Error("Stored invoice Blob hash verification failed");
  }

  return {
    bytes,
    contentBase64: encodeBase64(bytes),
    contentType: String(stored.content_type || requestContentType || "application/octet-stream"),
    fileName: String(stored.original_file_name || "invoice"),
    sha256: expectedHash,
    source: "AZURE_BLOB_HASH_VERIFIED",
  };
}

async function runDocumentIntelligence({
  endpoint,
  key,
  contentBase64,
  correlationId,
  modelId = "prebuilt-invoice",
  features = ["keyValuePairs"],
}: {
  endpoint: string;
  key: string;
  contentBase64: string;
  correlationId: string;
  modelId?: string;
  features?: string[];
}) {
  const enabledFeatures = [...new Set((features || []).filter(Boolean))];
  const featureQuery = enabledFeatures.length
    ? `&features=${enabledFeatures.join(",")}`
    : "";
  const analyzeUrl =
    `${endpoint}/documentintelligence/documentModels/${modelId}:analyze` +
    `?_overload=analyzeDocument&api-version=2024-11-30${featureQuery}`;

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
    const body = await analyze.text();
    throw new Error(
      `Azure OCR analyze failed (${modelId}): ${analyze.status} ${body}`,
    );
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
    if (result.status === "succeeded") {
      return {
        ...result,
        wspDocumentModel: modelId,
        wspDocumentFeatures: enabledFeatures,
        wspHighResolution: enabledFeatures.includes("ocrHighResolution"),
      };
    }
    if (result.status === "failed") {
      throw new Error(
        `Azure OCR analysis failed (${modelId}): ${JSON.stringify(result?.error || result)}`,
      );
    }
  }
  throw new Error(`Azure OCR timed out (${modelId})`);
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

async function runAdaptiveOcrRescue({
  derivatives,
  diEndpoint,
  diKey,
  visionEndpoint,
  visionKey,
  secondaryEnabled,
  correlationId,
}: {
  derivatives: any[];
  diEndpoint: string;
  diKey: string;
  visionEndpoint: string;
  visionKey: string;
  secondaryEnabled: boolean;
  correlationId: string;
}) {
  const safeDerivatives = Array.isArray(derivatives)
    ? derivatives.slice(0, 6)
    : [];
  const standardGroups: any[] = [];
  const highResolutionGroups: any[] = [];
  let visionRequestCount = 0;
  let highResolutionRequestCount = 0;

  for (const [index, derivative] of safeDerivatives.entries()) {
    const group = derivative?.group;
    const contentBase64 = String(derivative?.contentBase64 || "");
    const contentType = String(derivative?.contentType || "").toLowerCase();
    if (!group?.groupId || !Array.isArray(group?.fields) || !group.fields.length) continue;
    if (!/^image\/(jpeg|jpg|png|webp)$/.test(contentType)) continue;
    if (!contentBase64 || contentBase64.length > 1_900_000) continue;

    const derivativeBytes = decodeBase64(contentBase64);
    if (!derivativeBytes.length || derivativeBytes.length > 1_350_000) continue;
    const groupCorrelationId = `${correlationId}-adaptive-${index + 1}`;

    let standard = {
      groupId: group.groupId,
      source: "VISION_DERIVATIVE",
      lineCount: 0,
      fieldResults: (group.fields || []).map((field: any) => ({
        fieldId: field.fieldId,
        label: field.label,
        scope: field.scope,
        kind: field.kind,
        source: "VISION_DERIVATIVE",
        suggestedValue: "",
        confidence: "LOW",
        reason: "VISION_DERIVATIVE_UNAVAILABLE",
        requiresHumanConfirmation: true,
      })),
      unresolvedFieldIds: (group.fields || []).map((field: any) => field.fieldId),
    };

    if (secondaryEnabled && visionEndpoint && visionKey) {
      try {
        visionRequestCount += 1;
        const visionPayload = await runVisionRead({
          endpoint: visionEndpoint,
          key: visionKey,
          bytes: derivativeBytes,
          correlationId: groupCorrelationId,
        });
        standard = analyzeAdaptiveRescueGroup({
          payload: visionPayload,
          group,
          source: "VISION_DERIVATIVE",
        });
      } catch (error) {
        console.warn(
          "Adaptive derivative Vision failed safely",
          String(error instanceof Error ? error.message : error).slice(0, 180),
        );
      }
    }
    standardGroups.push(standard);

    if (!standard.unresolvedFieldIds?.length) continue;
    if (highResolutionRequestCount >= 3) continue;

    const highGroup = {
      ...group,
      fields: (group.fields || []).filter((field: any) =>
        standard.unresolvedFieldIds.includes(field.fieldId)
      ),
    };
    if (!highGroup.fields.length) continue;

    try {
      highResolutionRequestCount += 1;
      const highResult = await runDocumentIntelligence({
        endpoint: diEndpoint,
        key: diKey,
        contentBase64,
        correlationId: `${groupCorrelationId}-highres`,
        modelId: "prebuilt-layout",
        features: ["ocrHighResolution"],
      });
      highResolutionGroups.push(
        analyzeAdaptiveRescueGroup({
          payload: highResult,
          group: highGroup,
          source: "HIGH_RES_LAYOUT_DERIVATIVE",
        }),
      );
    } catch (error) {
      console.warn(
        "Adaptive high-resolution Layout failed safely",
        String(error instanceof Error ? error.message : error).slice(0, 180),
      );
    }
  }

  return {
    ...mergeAdaptiveRescueResults(standardGroups, highResolutionGroups),
    visionRequestCount,
    highResolutionRequestCount,
    highResolutionRequestLimit: 3,
    derivativeCount: safeDerivatives.length,
    derivativeStored: false,
    highResolutionModel: "prebuilt-layout",
    highResolutionFeature: "ocrHighResolution",
  };
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

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: currentShop } = await serviceClient
      .from("shops")
      .select("name")
      .eq("id", profile.shop_id)
      .maybeSingle();
    const receivingShopName = String(currentShop?.name || "").trim();

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
    const mode = String(body?.mode || "standard");
    const rescueDerivatives = Array.isArray(body?.rescueDerivatives)
      ? body.rescueDerivatives
      : [];
    const requestContentBase64 = String(body?.contentBase64 || "");
    const requestContentType = String(body?.contentType || "application/octet-stream");
    const ingestionId = String(body?.ingestionId || "").trim();
    if (!ingestionId) throw new Error("Stored invoice ingestion ID is required");
    const correlationId = ingestionId;

    const canonicalDocument = await resolveCanonicalInvoiceDocument({
      client,
      ingestionId,
      requestContentBase64,
      requestContentType,
      authHeader,
      shopId: profile.shop_id,
    });
    const contentBase64 = canonicalDocument.contentBase64;
    const contentType = canonicalDocument.contentType;
    const fileName = canonicalDocument.fileName;
    const bytes = canonicalDocument.bytes;

    const secondaryEnabled = Deno.env.get("WSP_SECONDARY_OCR_ENABLED") === "true";
    const visionEndpoint = (Deno.env.get("AZURE_VISION_ENDPOINT") || "").replace(/\/$/, "");
    const visionKey = Deno.env.get("AZURE_VISION_KEY") || "";

    if (mode === "adaptive_rescue") {
      const rescue = await runAdaptiveOcrRescue({
        derivatives: rescueDerivatives,
        diEndpoint,
        diKey,
        visionEndpoint,
        visionKey,
        secondaryEnabled,
        correlationId,
      });
      return json({
        ok: true,
        mode: "ADAPTIVE_RESCUE",
        correlationId,
        canonicalDocumentSha256: canonicalDocument.sha256,
        rescue,
      });
    }

    await persistAuthoritativeShopAiReview(
      serviceClient,
      ingestionId,
      profile.shop_id,
      {
        version: 1,
        status: "PROCESSING",
        generatedAt: new Date().toISOString(),
        correlationId,
        documentSha256: canonicalDocument.sha256,
        canonicalDocumentSource: canonicalDocument.source,
      },
    );

    const primaryPromise = runDocumentIntelligence({
      endpoint: diEndpoint,
      key: diKey,
      contentBase64,
      correlationId,
      modelId: "prebuilt-invoice",
      features: ["keyValuePairs"],
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

    const primaryInvoice = normalizeDocumentIntelligenceResult(primaryResult);
    let invoice = structuredClone(primaryInvoice);

    const secondaryOcr = secondaryResult.ok
      ? buildVisionReadSummary(
          secondaryResult.payload,
          invoice,
          primaryResult,
          { currentShopName: receivingShopName },
        )
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
          textLines: [],
          chosen: {},
        };

    invoice = applySecondaryOcrConsensus(
      invoice,
      secondaryOcr,
      { currentShopName: receivingShopName },
    );

    invoice.adaptiveOcr = buildAdaptiveOcrPlan({
      primaryResult,
      primaryInvoice,
      secondaryOcr,
      invoice,
      receivingShopName,
    });

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
          skipAi: true,
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

    let shopAiReview: any;
    try {
      shopAiReview = await runShopAiReview({
        config: {
          enabled: Deno.env.get("WSP_INVOICE_AI_ENABLED") === "true",
          baseUrl: Deno.env.get("WSP_INVOICE_AI_BASE_URL") || "",
          apiKey: Deno.env.get("WSP_INVOICE_AI_API_KEY") || "",
          model: Deno.env.get("WSP_INVOICE_AI_MODEL") || "",
          timeoutMs: Math.max(
            60000,
            Number(Deno.env.get("WSP_INVOICE_AI_VISUAL_TIMEOUT_MS") || "60000") || 60000,
          ),
          correlationId,
        },
        contentBase64,
        contentType,
        fileName,
        primaryInvoice,
        secondaryOcr,
        invoice,
        documentPageCount: estimatePdfPageCount({ bytes, contentType, fileName, diPageCount: Number(primaryResult?.analyzeResult?.pages?.length || 1) }),
        receivingShopName,
      });
    } catch (shopAiError) {
      const fallbackFields = buildShopAiFieldMatrix({ primaryInvoice, secondaryOcr, invoice })
        .map((field) => ({
          ...field,
          verdict: "NOT_JUDGED",
          suggestedValue: "",
          confidence: "LOW",
          reason: "ShopAI visual review failed safely; verify manually.",
          ownerConfirmationRequired: true,
        }));
      shopAiReview = {
        version: 1,
        status: "UNAVAILABLE",
        reason: "SHOP_AI_FAIL_OPEN_TO_MANUAL_REVIEW",
        requiresOwnerConfirmation: true,
        fields: fallbackFields,
        fieldCount: fallbackFields.length,
        matchedCount: 0,
        findingCount: fallbackFields.length,
        visualEvidenceUsed: false,
      };
      console.error(
        "ShopAI multimodal judge failed safely",
        String(shopAiError instanceof Error ? shopAiError.message : shopAiError).slice(0, 180),
      );
    }

    const authoritativeShopAiReview = {
      ...shopAiReview,
      version: Number(shopAiReview?.version || 1),
      generatedAt: String(shopAiReview?.generatedAt || new Date().toISOString()),
      correlationId,
      documentSha256: canonicalDocument.sha256,
      canonicalDocumentSource: canonicalDocument.source,
    };

    await persistAuthoritativeShopAiReview(
      serviceClient,
      ingestionId,
      profile.shop_id,
      authoritativeShopAiReview,
    );
    invoice = { ...invoice, shopAiReview: authoritativeShopAiReview };

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
      shopAiStatus: invoice?.shopAiReview?.status || "UNAVAILABLE",
      shopAiRecommendation: invoice?.shopAiReview?.recommendation || null,
      shopAiFieldCount: invoice?.shopAiReview?.fieldCount ?? null,
      shopAiFindingCount: invoice?.shopAiReview?.findingCount ?? null,
      shopAiInputTokens: invoice?.shopAiReview?.diagnostics?.inputTokens ?? null,
      shopAiOutputTokens: invoice?.shopAiReview?.diagnostics?.outputTokens ?? null,
      canonicalDocumentSource: canonicalDocument.source,
      documentIntelligenceFeatures: primaryResult?.wspDocumentFeatures || [],
      highResolutionOcr: Boolean(primaryResult?.wspHighResolution),
      adaptiveFieldCheckCount: invoice?.adaptiveOcr?.fieldCheckCount || 0,
      adaptiveRescueFieldCount: invoice?.adaptiveOcr?.rescueFieldCount || 0,
      adaptiveRescueGroupCount: invoice?.adaptiveOcr?.rescueGroupCount || 0,
      adaptiveHighResolutionPolicy: invoice?.adaptiveOcr?.highResolutionPolicy || null,
      receivingShopContext: Boolean(receivingShopName),
    }));

    return json({
      ok: true,
      correlationId,
      invoice,
      rawConfidence: invoice?.ocrQuality?.documentConfidence ?? null,
      model: "prebuilt-invoice+semantic-table+azure-vision-read-3.2",
      apiVersion: "DI:2024-11-30|Vision:3.2",
      features: [
        "keyValuePairs",
        "parallelSecondaryRead",
        "crossOcrConsensus",
        "canonicalBlobHash",
        "multimodalShopAiJudge",
        "semanticPartyDateResolver",
        "fieldLevelAdaptiveOcr",
        "browserMemoryDerivative",
        "conditionalHighResolutionLayoutRescue",
      ],
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
