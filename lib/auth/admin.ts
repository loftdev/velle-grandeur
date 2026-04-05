import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../supabase/server";

export async function requireAdminSession() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/admin/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminUser) {
    redirect("/admin/login");
  }

  return { user: data.user };
}
