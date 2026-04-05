import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { jsonError, jsonOk } from "../../../../lib/api/errors";
import { getPublicStorageUrl } from "../../../../lib/api/storage";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("company")
    .select("id, name, logo_path, phone, email, address, about")
    .maybeSingle();

  if (error) {
    return jsonError("SERVER_ERROR", "Unable to load company.", 500);
  }

  if (!data) {
    return jsonError("NOT_FOUND", "Company not configured.", 404);
  }

  return jsonOk({
    id: data.id,
    name: data.name,
    logo_url: data.logo_path
      ? getPublicStorageUrl("company-assets", data.logo_path)
      : null,
    phone: data.phone,
    email: data.email,
    address: data.address,
    about: data.about,
  });
}
