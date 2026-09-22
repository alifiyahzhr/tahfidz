import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { AdminUser } from "@/lib/types";

/** Returns the logged-in admin's profile, or null if not authenticated as an admin. */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createServiceClient();
  const { data } = await service
    .from("admin_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return data as AdminUser | null;
}
