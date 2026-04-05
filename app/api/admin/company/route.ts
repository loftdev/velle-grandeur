import { z } from "zod";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { jsonError, jsonOk } from "../../../../lib/api/errors";
import { requireAdmin } from "../../../../lib/api/guards";
import { getPublicStorageUrl } from "../../../../lib/api/storage";

const schema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
  address: z.string().trim().nullable().optional(),
  about: z.string().trim().nullable().optional(),
  logo_path: z.string().trim().nullable().optional(),
  logo_url: z.string().trim().url().nullable().optional(),
});

function urlToStoragePath(url: string) {
  const marker = "/storage/v1/object/public/company-assets/";
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;
  return url.slice(markerIndex + marker.length);
}

function mapCompany(data: {
  id: string;
  name: string;
  logo_path: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  about: string | null;
}) {
  return {
    ...data,
    logo_url: data.logo_path
      ? getPublicStorageUrl("company-assets", data.logo_path)
      : null,
  };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const guard = await requireAdmin(supabase);
  if ("response" in guard) return guard.response;

  const { data, error } = await supabase
    .from("company")
    .select("id, name, logo_path, phone, email, address, about")
    .maybeSingle();

  if (error) {
    return jsonError("SERVER_ERROR", "Unable to load company.", 500);
  }

  if (!data) {
    return jsonOk({
      id: "",
      name: "",
      logo_path: null,
      logo_url: null,
      phone: null,
      email: null,
      address: null,
      about: null,
    });
  }

  return jsonOk(mapCompany(data));
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const guard = await requireAdmin(supabase);
  if ("response" in guard) return guard.response;

  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return jsonError("VALIDATION_ERROR", "Invalid company data.", 400);
  }

  const logoPathFromUrl = result.data.logo_url
    ? urlToStoragePath(result.data.logo_url)
    : null;

  const payload = {
    name: result.data.name,
    phone: result.data.phone ?? null,
    email: result.data.email ?? null,
    address: result.data.address ?? null,
    about: result.data.about ?? null,
    logo_path: result.data.logo_path ?? logoPathFromUrl ?? null,
  };

  const { data: existing, error: existingError } = await supabase
    .from("company")
    .select("id")
    .maybeSingle();

  if (existingError) {
    return jsonError("SERVER_ERROR", "Unable to load company.", 500);
  }

  if (!existing) {
    const insert = await supabase
      .from("company")
      .insert(payload)
      .select("id, name, logo_path, phone, email, address, about")
      .single();

    if (insert.error) {
      return jsonError("SERVER_ERROR", "Unable to save company.", 500);
    }

    return jsonOk(mapCompany(insert.data));
  }

  const update = await supabase
    .from("company")
    .update(payload)
    .eq("id", existing.id)
    .select("id, name, logo_path, phone, email, address, about")
    .single();

  if (update.error) {
    return jsonError("SERVER_ERROR", "Unable to save company.", 500);
  }

  return jsonOk(mapCompany(update.data));
}
