import { slugify } from "./slug";
import { createSupabaseServerClient } from "../supabase/server";

export async function generateUniqueListingSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  companyId: string,
  title: string,
  excludeId?: string,
) {
  const base = slugify(title) || "listing";
  let slug = base;

  for (let attempt = 2; attempt < 20; attempt += 1) {
    let query = supabase
      .from("listings")
      .select("id")
      .eq("company_id", companyId)
      .eq("slug", slug);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      break;
    }

    if (!data) {
      return slug;
    }

    slug = `${base}-${attempt}`;
  }

  return `${base}-${Date.now()}`;
}
