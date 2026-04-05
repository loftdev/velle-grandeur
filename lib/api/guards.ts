import type { SupabaseClient } from "@supabase/supabase-js";
import { jsonError } from "./errors";

export async function requireUser(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { response: jsonError("UNAUTHENTICATED", "Not authenticated", 401) };
  }
  return { user: data.user };
}

export async function requireAdmin(supabase: SupabaseClient) {
  const userResult = await requireUser(supabase);
  if ("response" in userResult) {
    return userResult;
  }

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", userResult.user.id)
    .maybeSingle();

  if (error || !adminUser) {
    return { response: jsonError("FORBIDDEN", "Not authorized", 403) };
  }

  return { user: userResult.user };
}
