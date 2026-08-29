import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function fieldContent(field: any) {
  return (
    field?.content ??
    field?.valueString ??
    field?.valueNumber ??
    field?.valueDate ??
    null
  );
}

function numberValue(field: any) {
  const value = field?.valueNumber ?? field?.valueCurrency?.amount ?? field?.content;
  const number = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : null;
}

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
      // continue to the explicit error below
    }
  }

  throw new Error("Supabase publishable key is not available in Edge Function environment");
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

    const endpoint = (Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT") || "").replace(/\/$/, "");
    const key = Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_KEY");

    if (!endpoint || !key) {
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
    if (!contentBase64) throw new Error("Document content is required");

    // F0 supports up to 4 MB input. Base64 is larger than the binary input,
    // so enforce an approximate decoded-size guard here as well as in React.
    const estimatedBytes = Math.floor((contentBase64.length * 3) / 4);
    if (estimatedBytes > 4 * 1024 * 1024) {
      throw new Error("Document exceeds Azure Document Intelligence F0 4 MB limit");
    }

    const analyzeUrl = `${endpoint}/documentintelligence/documentModels/prebuilt-invoice:analyze?_overload=analyzeDocument&api-version=2024-11-30`;

    const analyze = await fetch(analyzeUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/json",
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
        headers: { "Ocp-Apim-Subscription-Key": key },
      });

      if (!poll.ok) throw new Error(`Azure OCR poll failed: ${poll.status}`);

      result = await poll.json();
      if (result.status === "succeeded") break;
      if (result.status === "failed") {
        throw new Error(
          `Azure OCR analysis failed: ${JSON.stringify(result?.error || result)}`,
        );
      }
    }

    if (result?.status !== "succeeded") throw new Error("Azure OCR timed out");

    const document = result.analyzeResult?.documents?.[0];
    const fields = document?.fields || {};

    const items = (fields.Items?.valueArray || []).map((row: any) => {
      const item = row.valueObject || {};
      return {
        description: String(fieldContent(item.Description) || fieldContent(item.ProductCode) || ""),
        quantity: numberValue(item.Quantity) ?? 1,
        unitPrice: numberValue(item.UnitPrice),
        amount: numberValue(item.Amount),
        confidence: row.confidence ?? item.Description?.confidence ?? null,
      };
    });

    return json({
      ok: true,
      invoice: {
        supplierName: String(fieldContent(fields.VendorName) || ""),
        invoiceNumber: String(fieldContent(fields.InvoiceId) || ""),
        invoiceDate: String(fieldContent(fields.InvoiceDate) || ""),
        total: numberValue(fields.InvoiceTotal),
        items,
      },
      rawConfidence: document?.confidence ?? null,
      model: "prebuilt-invoice",
      apiVersion: "2024-11-30",
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
