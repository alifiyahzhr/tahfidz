import { createBrowserClient } from "@supabase/ssr";

/** Browser client used only for admin login (Supabase Auth email+password). */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
