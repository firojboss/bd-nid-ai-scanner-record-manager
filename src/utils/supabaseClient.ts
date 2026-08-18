import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NIDRecord, DataSheetAccount } from "../types.js";

// Client-side helper for Supabase
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url =
    (import.meta as any).env?.VITE_SUPABASE_URL ||
    (typeof window !== "undefined" ? (window as any).__SUPABASE_URL__ : "");
  const anonKey =
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    (typeof window !== "undefined" ? (window as any).__SUPABASE_ANON_KEY__ : "");

  if (!url || !anonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, anonKey);
    return supabaseInstance;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL;
  const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey);
}
