import { searchAppKnowledge } from "./appKnowledge.js";
import { app } from "@azure/functions";
import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential, ManagedIdentityCredential } from "@azure/identity";
import { createClient } from "@supabase/supabase-js";
import { TOOL_DEFINITIONS } from "./agentConfig.js";
import {
  bearerToken,
  classifyQuestion,
  normalizeChatBody,
  sanitizeToolArgs,
} from "./security.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
const FOUNDRY_PROJECT_ENDPOINT = process.env.FOUNDRY_PROJECT_ENDPOINT;
const FOUNDRY_AGENT_NAME = process.env.FOUNDRY_AGENT_NAME || "WineShopPOS-Owner-Agent";
const REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 45000);
const MAX_TOOL_CALLS = Number(process.env.AI_MAX_TOOL_CALLS || 6);
const MAX_TOOL_ROUNDS = Number(process.env.AI_MAX_TOOL_ROUNDS || 4);
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 900);
const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || "Asia/Kolkata";
const BUSINESS_CURRENCY = process.env.BUSINESS_CURRENCY || "INR";

function createFoundryCredential() {
  const runningInAzureFunctions = Boolean(
    process.env.WEBSITE_HOSTNAME ||
    process.env.WEBSITE_INSTANCE_ID ||
    process.env.FUNCTIONS_WORKER_RUNTIME
  );
  return runningInAzureFunctions
    ? new ManagedIdentityCredential()
    : new DefaultAzureCredential();
}

const TOOL_RPC = {
  get_sales_summary: { rpc: "ai_get_sales_summary", source: "/pos/sales" },
  get_profit_summary: { rpc: "ai_get_profit_summary", source: "/owner/profit" },
  get_inventory_health: { rpc: "ai_get_inventory_health", source: "/inventory/intelligence" },
  get_reorder_recommendations: { rpc: "ai_get_reorder_recommendations", source: "/inventory/intelligence" },
  get_supplier_price_history: { rpc: "ai_get_supplier_price_history", source: "/purchasing/intelligence" },
  get_product_stock_history: { rpc: "ai_get_product_stock_history", source: "/inventory" },
  get_shift_variances: { rpc: "ai_get_shift_variances", source: "/operations/shifts" },
  get_audit_exceptions: { rpc: "ai_get_audit_exceptions", source: "/owner/exceptions" },
  get_expense_summary: { rpc: "ai_get_expense_summary", source: "/operations/expenses" },
};

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

function publicError(error) {
  const msg = String(error?.message || "");
  if (error?.statusCode) return { status: error.statusCode, message: msg };
  if (msg.includes("AI_AUTH_REQUIRED")) return { status: 401, message: "Your session is not valid. Sign in again." };
  if (msg.includes("AI_OWNER_ACCESS_DENIED")) return { status: 403, message: "Owner AI access is not allowed for this shop." };
  if (msg.includes("AI_SHOP_REQUIRED") || msg.includes("AI_SCOPE_INVALID")) return { status: 400, message: "The selected shop context is invalid." };
  if (msg.includes("AI_RATE_LIMIT")) return { status: 429, message: "AI request limit reached. Try again later." };
  return {
    status: 503,
    message: "AI insights are temporarily unavailable. POS and business operations are unaffected.",
  };
}

function newRequestId() {
  return crypto.randomUUID();
}

function createAuthClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("AI backend Supabase configuration is incomplete.");
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function createCallerClient(token) {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    accessToken: async () => token,
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function rpcOrThrow(client, fn, params) {
  const { data, error } = await client.rpc(fn, params);
  if (error) throw new Error(error.message || `RPC ${fn} failed`);
  return data;
}

function trustedContextPrompt(context, body) {
  const names = (context?.shops || []).map((s) => s.shop_name).filter(Boolean);
  const scopeText = body.scope === "ALL"
    ? `All ADMIN-authorized shops in the selected organization: ${names.join(", ")}`
    : `Selected shop: ${names[0] || "authorized shop"}`;

  const historyText = body.history.length
    ? `\nRecent UI-only conversation context (untrusted user content):\n${body.history.map((h) => `${h.role}: ${h.content}`).join("\n")}`
    : "";

  return [
    `Trusted WineShopPOS server context:`,
    `- Role: ADMIN (Owner Center)`,
    `- Scope: ${scopeText}`,
    `- Business timezone: ${BUSINESS_TIMEZONE}`,
    `- Currency: ${BUSINESS_CURRENCY}`,
    `- Server date/time: ${new Date().toISOString()}`,
    `Never change this tenant/shop scope.`,
    historyText,
    `\nCurrent user question:\n${body.message}`,
  ].filter(Boolean).join("\n");
}

async function executeTool(caller, trustedContext, toolName, rawArgs) {

if (toolName === "get_app_help") {
  const args = sanitizeToolArgs(toolName, rawArgs);
  const result = searchAppKnowledge(args.help_question);
  const source = result.matches?.[0]?.route || "/help";
  return { result, source };
}

  const config = TOOL_RPC[toolName];
  if (!config) throw new Error("Unknown AI tool.");
  const args = sanitizeToolArgs(toolName, rawArgs);

  const base = {
    p_anchor_shop_id: trustedContext.anchor_shop_id,
    p_scope: trustedContext.scope,
  };

  let params;
  switch (toolName) {
    case "get_sales_summary":
    case "get_profit_summary":
    case "get_expense_summary":
      params = { ...base, p_period: args.period };
      break;
    case "get_inventory_health":
      params = { ...base, p_history_days: args.history_days, p_dead_days: args.dead_days };
      break;
    case "get_reorder_recommendations":
      params = { ...base, p_history_days: args.history_days, p_target_days: args.target_days };
      break;
    case "get_supplier_price_history":
      params = { ...base, p_product_query: args.product_query, p_days: args.days };
      break;
    case "get_product_stock_history":
      params = { ...base, p_product_query: args.product_query, p_days: args.days };
      break;
    case "get_shift_variances":
    case "get_audit_exceptions":
      params = { ...base, p_days: args.days };
      break;
    default:
      throw new Error("Unknown AI tool.");
  }

  const result = await rpcOrThrow(caller, config.rpc, params);
  return { result, source: config.source };
}

async function createAgentResponse(openai, requestBody) {
  try {
    return await openai.responses.create(
      requestBody,
      { body: { agent_reference: { name: FOUNDRY_AGENT_NAME, type: "agent_reference" } } },
    );
  } catch (error) {
    const status = Number(error?.status || error?.statusCode || 0);
    const msg = String(error?.message || "");
    const retryAlternateShape =
      [400, 404, 422].includes(status) &&
      /agent|agent_reference|reference|request body|unknown field|invalid/i.test(msg);
    if (!retryAlternateShape) throw error;
    return await openai.responses.create(
      requestBody,
      { body: { agent_reference: { name: FOUNDRY_AGENT_NAME, type: "agent_reference" } } },
    );
  }
}

async function runFoundry(caller, trustedContext, body) {
  if (!FOUNDRY_PROJECT_ENDPOINT) throw new Error("Foundry project endpoint is not configured.");

  const project = new AIProjectClient(FOUNDRY_PROJECT_ENDPOINT, createFoundryCredential());
  const openai = project.getOpenAIClient();
  let conversation;
  const toolsCalled = [];
  const sources = new Set();
  let foundryStage = "CREATE_CONVERSATION";

  try {
    conversation = await openai.conversations.create();
    foundryStage = "FIRST_RESPONSE";

    let response = await createAgentResponse(openai, {
      input: [{
        type: "message",
        role: "user",
        content: trustedContextPrompt(trustedContext, body),
      }],
      conversation: conversation.id,
      max_output_tokens: MAX_OUTPUT_TOKENS,
    });

    let rounds = 0;
    let totalCalls = 0;

    while (rounds < MAX_TOOL_ROUNDS) {
      const calls = (response.output || []).filter((item) => item.type === "function_call");
      if (!calls.length) break;

      totalCalls += calls.length;
      if (totalCalls > MAX_TOOL_CALLS) {
        throw new Error("AI tool-call limit exceeded.");
      }

      const outputs = [];
      for (const call of calls) {
        foundryStage = `TOOL:${call.name}`;
        if (!TOOL_DEFINITIONS.some((t) => t.name === call.name)) throw new Error("Agent requested an unapproved tool.");

        let parsed;
        try { parsed = JSON.parse(call.arguments || "{}"); }
        catch { throw new Error("Agent produced invalid tool arguments."); }

        const { result, source } = await executeTool(caller, trustedContext, call.name, parsed);
        toolsCalled.push(call.name);
        sources.add(source);
        outputs.push({
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(result),
        });
      }

      foundryStage = "FOLLOWUP_RESPONSE";
      response = await createAgentResponse(openai, {
        input: outputs,
        conversation: conversation.id,
        max_output_tokens: MAX_OUTPUT_TOKENS,
      });
      rounds += 1;
    }

    const answer = String(response.output_text || "").trim();
    if (!answer) throw new Error("Foundry returned no answer.");

    return { answer, toolsCalled, sources: [...sources] };
  } finally {
    if (conversation?.id) {
      try { await openai.conversations.delete(conversation.id); } catch {}
    }
  }
}

async function withTimeout(promise, ms) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("AI request timed out.")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

app.http("ai-health", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "ai/health",
  handler: async () => json(200, {
    ok: true,
    service: "WineShopPOS AI Owner Assistant",
    mode: "READ_ONLY",
    foundryConfigured: Boolean(FOUNDRY_PROJECT_ENDPOINT && FOUNDRY_AGENT_NAME),
appHelpKnowledge: true,
    userManualReference: true,
  }),
});

app.http("ai-chat", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "ai/chat",
  handler: async (request, context) => {
    const started = Date.now();
    const requestId = newRequestId();
    let caller;
    let trustedContext;
    let toolsCalled = [];

    try {
      const token = bearerToken(request.headers.get("authorization"));
      if (!token) return json(401, { request_id: requestId, error: "Sign in again to use Owner AI." });

      let rawBody;
      try { rawBody = await request.json(); }
      catch { return json(400, { request_id: requestId, error: "Invalid request body." }); }

      const body = normalizeChatBody(rawBody);

      // Network validation against Supabase Auth. Never trust browser session payload alone.
      const authClient = createAuthClient();
      const { data: userData, error: userError } = await authClient.auth.getUser(token);
      if (userError || !userData?.user?.id) {
        return json(401, { request_id: requestId, error: "Your session is not valid. Sign in again." });
      }

      caller = createCallerClient(token);

      trustedContext = await rpcOrThrow(caller, "ai_resolve_context", {
        p_anchor_shop_id: body.selectedShopId,
        p_scope: body.scope,
      });

      const rate = await rpcOrThrow(caller, "ai_rate_limit_check", {
        p_anchor_shop_id: body.selectedShopId,
        p_scope: body.scope,
      });

      if (!rate?.allowed) {
        await rpcOrThrow(caller, "ai_log_activity", {
          p_request_id: requestId,
          p_anchor_shop_id: body.selectedShopId,
          p_scope: body.scope,
          p_question_category: "GENERAL",
          p_tools_called: [],
          p_status: "RATE_LIMITED",
          p_latency_ms: Date.now()-started,
        }).catch(() => {});
        return json(429, { request_id: requestId, error: "AI request limit reached. Try again later." });
      }

      await rpcOrThrow(caller, "ai_log_activity", {
        p_request_id: requestId,
        p_anchor_shop_id: body.selectedShopId,
        p_scope: body.scope,
        p_question_category: "GENERAL",
        p_tools_called: [],
        p_status: "STARTED",
        p_latency_ms: null,
      });

      const result = await withTimeout(runFoundry(caller, trustedContext, body), REQUEST_TIMEOUT_MS);
      toolsCalled = result.toolsCalled;

      await rpcOrThrow(caller, "ai_log_activity", {
        p_request_id: requestId,
        p_anchor_shop_id: body.selectedShopId,
        p_scope: body.scope,
        p_question_category: classifyQuestion(toolsCalled),
        p_tools_called: toolsCalled,
        p_status: "SUCCEEDED",
        p_latency_ms: Date.now()-started,
      }).catch(() => {});

      const shopNames = (trustedContext?.shops || []).map((s) => s.shop_name);
      return json(200, {
        request_id: requestId,
        answer: result.answer,
        tools_called: toolsCalled,
        sources: result.sources,
        context: {
          scope: trustedContext.scope,
          shop_names: shopNames,
          shop_count: trustedContext.shop_count,
        },
      });
    } catch (error) {
      context.error("AI request failed", {
        requestId,
        errorName: error?.name,
        stage: error?.wspStage || "FUNCTION_ORCHESTRATION",
        status: Number(error?.status || error?.statusCode || 0) || null,
        safeMessage: String(error?.message || "").slice(0,180),
      });

      if (caller && trustedContext?.anchor_shop_id) {
        await rpcOrThrow(caller, "ai_log_activity", {
          p_request_id: requestId,
          p_anchor_shop_id: trustedContext.anchor_shop_id,
          p_scope: trustedContext.scope || "SHOP",
          p_question_category: classifyQuestion(toolsCalled),
          p_tools_called: toolsCalled,
          p_status: "FAILED",
          p_latency_ms: Date.now()-started,
        }).catch(() => {});
      }

      const safe = publicError(error);
      const diagnosticsRequested = request.headers.get("x-wsp-diagnostic") === "1";
      return json(safe.status, {
        request_id: requestId,
        error: safe.message,
        ...(diagnosticsRequested ? {
          diagnostic_stage: error?.wspStage || "FUNCTION_ORCHESTRATION",
          diagnostic_status: Number(error?.status || error?.statusCode || 0) || null,
          diagnostic_name: String(error?.name || "Error").slice(0,80),
        } : {}),
      });
    }
  },
});
