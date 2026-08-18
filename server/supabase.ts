import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseServerClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (supabaseServerClient) return supabaseServerClient;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  try {
    supabaseServerClient = createClient(url, serviceKey);
    return supabaseServerClient;
  } catch (err) {
    console.error("[Supabase Server] Failed to initialize Supabase client:", err);
    return null;
  }
}

export function isSupabaseServerActive(): boolean {
  return Boolean(getSupabaseServerClient());
}
