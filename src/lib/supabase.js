import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Missing Supabase VITE environment variables.");
}

const actualRef = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co\/?/i)?.[1] ?? "";
const expectedRef = typeof __EXPECTED_SUPABASE_REF__ !== "undefined" ? __EXPECTED_SUPABASE_REF__ : "";

if (!actualRef || (expectedRef && actualRef !== expectedRef)) {
  throw new Error(
    `ENVIRONMENT_ISOLATION_BLOCKED: runtime Supabase project ${actualRef || "unknown"} does not match expected ${expectedRef || "unknown"}.`
  );
}

export const supabase = createClient(url, anonKey);
