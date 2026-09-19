import { supabase } from "./supabase";
import { loadActiveCheckoutAttempt } from "./checkoutJournal";

const UNRESOLVED = new Set(["SUBMITTING", "UNKNOWN", "RECOVERING"]);

export async function assertSessionChangeSafe({ shopId, userId }) {
  if (shopId && userId) {
    const local = await loadActiveCheckoutAttempt(shopId, userId).catch(() => null);
    if (local && UNRESOLVED.has(String(local.status || "").toUpperCase())) {
      throw new Error(
        "Resolve the current checkout before logging out or switching shop. Do not repeat payment.",
      );
    }
  }

  const { data, error } = await supabase.rpc("checkout_session_guard_v1");
  if (error) {
    throw new Error(
      "Checkout safety could not be verified. Stay in this shop/account until connectivity is restored.",
    );
  }

  if (data?.blocked) {
    throw new Error(
      "An online checkout is still SUBMITTING/UNKNOWN. Resolve it before logging out or switching shop.",
    );
  }

  return true;
}
