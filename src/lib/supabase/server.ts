import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server client bound to the current request's admin auth session (RLS
 * applies as that user). Used to check "is this caller logged in as an
 * admin" — actual data reads/writes for admin pages still go through the
 * service-role client after that check passes, scoped by admin_users.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render; middleware refreshes
            // the session cookie instead. Safe to ignore.
          }
        },
      },
    },
  );
}
