const AI_BASE = String(import.meta.env.VITE_AI_API_URL || "").replace(/\/+$/,"");

export function isAIConfigured() {
  return Boolean(AI_BASE && import.meta.env.VITE_AI_OWNER_ENABLED !== "false");
}

export async function askWineShopPOS({ token, message, selectedShopId, scope="SHOP", history=[] }) {
  if (!isAIConfigured()) {
    throw new Error("AI Owner Assistant is not configured for this deployment.");
  }
  if (!token) throw new Error("Sign in again to use Owner AI.");

  const response = await fetch(`${AI_BASE}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      selected_shop_id: selectedShopId,
      scope,
      history,
    }),
  });

  let payload = {};
  try { payload = await response.json(); } catch {}

  if (!response.ok) {
    throw new Error(payload?.error || "AI insights are temporarily unavailable. POS and business operations are unaffected.");
  }

  return payload;
}
