import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) throw new Error("Missing authorization");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const caller = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const admin = createClient(url, serviceKey);

    const {
      data: { user },
      error: userError,
    } = await caller.auth.getUser();

    if (userError || !user) throw new Error("Invalid session");

    const { data: callerProfile, error: profileError } = await admin
      .from("profiles")
      .select("id,shop_id,role,active")
      .eq("id", user.id)
      .single();

    if (profileError || !callerProfile) throw new Error("Profile not found");
    if (!callerProfile.active) throw new Error("Account disabled");
    if (callerProfile.role !== "ADMIN") throw new Error("Admin role required");

    const { data: shop, error: shopError } = await admin
      .from("shops")
      .select("id,access_enabled,subscription_status,subscription_end_date,max_users")
      .eq("id", callerProfile.shop_id)
      .single();

    if (shopError || !shop) throw new Error("Shop not found");

    const today = new Date().toISOString().slice(0, 10);
    const allowed =
      shop.access_enabled === true &&
      ["TRIAL", "ACTIVE"].includes(shop.subscription_status) &&
      (!shop.subscription_end_date || shop.subscription_end_date >= today);

    if (!allowed) throw new Error("SHOP_ACCESS_DISABLED");

    const body = await req.json();
    const action = body.action;

    if (action === "list") {
      const { data, error } = await admin
        .from("profiles")
        .select("id,full_name,email,role,active,created_at")
        .eq("shop_id", callerProfile.shop_id)
        .order("created_at");

      if (error) throw error;

      return Response.json({ ok: true, users: data }, { headers: corsHeaders });
    }

    if (action === "create") {
      const role = String(body.role || "").toUpperCase();

      // Shop ADMIN cannot create another ADMIN.
      if (!["MANAGER", "CASHIER"].includes(role)) {
        throw new Error("Shop Admin can create only MANAGER or CASHIER");
      }

      const fullName = String(body.fullName || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");

      if (!fullName || !email || password.length < 8) {
        throw new Error("Name, email and password (8+ chars) are required");
      }

      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", callerProfile.shop_id);

      if ((count ?? 0) >= shop.max_users) {
        throw new Error(`Shop user limit reached (${shop.max_users})`);
      }

      const { data: created, error: createError } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });

      if (createError) throw createError;

      const { error: insertError } = await admin.from("profiles").insert({
        id: created.user.id,
        shop_id: callerProfile.shop_id,
        full_name: fullName,
        email,
        role,
        active: true,
      });

      if (insertError) {
        await admin.auth.admin.deleteUser(created.user.id);
        throw insertError;
      }

      return Response.json(
        { ok: true, userId: created.user.id },
        { headers: corsHeaders }
      );
    }

    if (action === "set_active") {
      const targetId = String(body.userId || "");
      const active = body.active === true;

      const { data: target, error: targetError } = await admin
        .from("profiles")
        .select("id,shop_id,role")
        .eq("id", targetId)
        .eq("shop_id", callerProfile.shop_id)
        .single();

      if (targetError || !target) throw new Error("User not found");
      if (target.role === "ADMIN") throw new Error("Shop ADMIN is platform controlled");

      const { error } = await admin
        .from("profiles")
        .update({ active })
        .eq("id", targetId)
        .eq("shop_id", callerProfile.shop_id);

      if (error) throw error;

      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    throw new Error("Unsupported action");
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : String(error) },
      { status: 400, headers: corsHeaders }
    );
  }
});
