const PERIODS = new Set(["TODAY","YESTERDAY","LAST_7_DAYS","LAST_30_DAYS","THIS_WEEK","LAST_WEEK"]);
const SCOPES = new Set(["SHOP","ALL"]);
const FORBIDDEN_CONTEXT_KEYS = new Set([
  "shop_id","selected_shop_id","organization_id","user_id","role",
  "authorized_shop_ids","sql","query","table"
]);

export function bearerToken(header) {
  const value = String(header || "");
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

export function normalizeChatBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw Object.assign(new Error("Request body must be an object."), { statusCode: 400 });
  }

  const message = String(body.message || "").trim();
  if (!message) throw Object.assign(new Error("Ask WineShopPOS a question."), { statusCode: 400 });
  if (message.length > 2000) throw Object.assign(new Error("Question is too long."), { statusCode: 400 });

  const selectedShopId = String(body.selected_shop_id || "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(selectedShopId)) {
    throw Object.assign(new Error("A valid shop context is required."), { statusCode: 400 });
  }

  const scope = String(body.scope || "SHOP").toUpperCase();
  if (!SCOPES.has(scope)) throw Object.assign(new Error("Invalid AI shop scope."), { statusCode: 400 });

  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
  const cleanedHistory = history.map((item) => ({
    role: item?.role === "assistant" ? "assistant" : "user",
    content: String(item?.content || "").slice(0, 1200),
  })).filter((item) => item.content.trim());

  const historyChars = cleanedHistory.reduce((sum, item) => sum + item.content.length, 0);
  if (historyChars > 5000) {
    throw Object.assign(new Error("Conversation context is too large. Start a new AI conversation."), { statusCode: 400 });
  }

  return { message, selectedShopId, scope, history: cleanedHistory };
}

export function clampInt(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export function normalizePeriod(value, fallback="LAST_7_DAYS") {
  const v = String(value || fallback).toUpperCase();
  return PERIODS.has(v) ? v : fallback;
}

export function sanitizeToolArgs(toolName, input) {
  const args = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  for (const key of Object.keys(args)) {
    if (FORBIDDEN_CONTEXT_KEYS.has(key.toLowerCase())) {
      throw new Error(`Forbidden tool argument: ${key}`);
    }
  }

  switch (toolName) {
    case "get_sales_summary":
    case "get_profit_summary":
      return { period: normalizePeriod(args.period) };
    case "get_inventory_health":
      return {
        history_days: clampInt(args.history_days,30,7,180),
        dead_days: clampInt(args.dead_days,45,14,365),
      };
    case "get_reorder_recommendations":
      return {
        history_days: clampInt(args.history_days,30,7,180),
        target_days: clampInt(args.target_days,7,1,60),
      };
    case "get_supplier_price_history":
      return {
        product_query: String(args.product_query || "").trim().slice(0,120),
        days: clampInt(args.days,180,7,730),
      };
    case "get_product_stock_history": {
      const q = String(args.product_query || "").trim().slice(0,120);
      if (!q) throw new Error("A product name, SKU or barcode is required.");
      return { product_query: q, days: clampInt(args.days,90,1,730) };
    }
    case "get_shift_variances":
    case "get_audit_exceptions":
      return { days: clampInt(args.days,30,1,365) };
    case "get_expense_summary":
      return { period: normalizePeriod(args.period,"LAST_30_DAYS") };
    default:
      throw new Error("Unknown AI tool.");
  }
}

export function classifyQuestion(tools=[]) {
  const first = tools[0] || "";
  if (first.includes("sales")) return "SALES";
  if (first.includes("profit")) return "PROFIT";
  if (first.includes("inventory") || first.includes("stock") || first.includes("reorder")) return "INVENTORY";
  if (first.includes("supplier")) return "SUPPLIER";
  if (first.includes("shift")) return "SHIFT";
  if (first.includes("audit")) return "AUDIT";
  if (first.includes("expense")) return "EXPENSE";
  return "GENERAL";
}
