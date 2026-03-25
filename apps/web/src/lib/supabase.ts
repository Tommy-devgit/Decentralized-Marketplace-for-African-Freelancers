import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseDebugInfo = {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey ? `${supabaseAnonKey.slice(0, 12)}...` : "",
};

if (!isSupabaseConfigured) {
  console.warn("Missing Supabase environment variables.");
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;