import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

const anonKey = () =>
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const getAnonSupabase = (): SupabaseClient | null => {
  const key = anonKey();
  if (!supabaseUrl || !key) return null;
  try {
    return createClient(supabaseUrl, key);
  } catch (err) {
    console.error("[supabase] anon client init failed", err);
    return null;
  }
};

export const getServiceSupabase = (): SupabaseClient | null => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) return null;
  try {
    return createClient(supabaseUrl, key, { auth: { persistSession: false } });
  } catch (err) {
    console.error("[supabase] service client init failed", err);
    return null;
  }
};
