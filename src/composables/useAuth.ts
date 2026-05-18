import { ref, computed, onMounted } from "vue";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export const user = ref<User | null>(null);
export const session = ref<Session | null>(null);
export const authLoading = ref(true);
export const authError = ref<string | null>(null);

export const isAuthenticated = computed(() => !!user.value);

let authInitialized = false;

export const initAuth = async () => {
  if (authInitialized) return;
  authInitialized = true;

  const supabase = getSupabase();
  if (!supabase) {
    authLoading.value = false;
    return;
  }

  const { data } = await supabase.auth.getSession();
  session.value = data.session;
  user.value = data.session?.user ?? null;
  authLoading.value = false;

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession;
    user.value = newSession?.user ?? null;
  });
};

export const signIn = async (email: string, password: string) => {
  authError.value = null;
  const supabase = getSupabase();
  if (!supabase) {
    authError.value =
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.";
    return { error: authError.value };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) authError.value = error.message;
  return { error: error?.message ?? null };
};

export const signOut = async () => {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
  user.value = null;
  session.value = null;
};

export function useAuth() {
  onMounted(() => {
    if (!authInitialized) initAuth();
  });

  return {
    user,
    session,
    authLoading,
    authError,
    isAuthenticated,
    isSupabaseConfigured,
    signIn,
    signOut,
  };
}
