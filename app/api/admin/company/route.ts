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
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  business_hours: z.string().trim().nullable().optional(),
  logo_path: z.string().trim().nullable().optional(),
  logo_url: z.string().trim().url().nullable().optional(),
});

const companySelect =
  "id, name, logo_path, phone, email, address, about, latitude, longitude, business_hours";
const legacyCompanySelect =
  "id, name, logo_path, phone, email, address, about";

function isMissingLocationColumn(error: {
  code?: string;
  message?: string;
} | null) {
  if (!error) return false;
  if (error.code === "42703") return true;

  return (
    error.code === "PGRST204" &&
    ["latitude", "longitude", "business_hours"].some((column) =>
      error.message?.includes(column),
    )
  );
}

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
  latitude?: number | null;
  longitude?: number | null;
  business_hours?: string | null;
}) {
  return {
    ...data,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    business_hours: data.business_hours ?? null,
    logo_url: data.logo_path
      ? getPublicStorageUrl("company-assets", data.logo_path)
      : null,
  };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const guard = await requireAdmin(supabase);
  if ("response" in guard) return guard.response;

  let result = await supabase
    .from("company")
    .select(companySelect)
    .maybeSingle();

  if (result.error?.code === "42703") {
    result = await supabase
      .from("company")
      .select("id, name, logo_path, phone, email, address, about")
      .maybeSingle();
  }

  if (result.error) {
    return jsonError("SERVER_ERROR", "Unable to load company.", 500);
  }

  if (!result.data) {
    return jsonOk({
      id: "",
      name: "",
      logo_path: null,
      logo_url: null,
      phone: null,
      email: null,
      address: null,
      about: null,
      latitude: null,
      longitude: null,
      business_hours: null,
    });
  }

  return jsonOk(mapCompany(result.data));
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
    latitude: result.data.latitude ?? null,
    longitude: result.data.longitude ?? null,
    business_hours: result.data.business_hours ?? null,
    logo_path: result.data.logo_path ?? logoPathFromUrl ?? null,
  };
  const legacyPayload = {
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
    about: payload.about,
    logo_path: payload.logo_path,
  };
  const requiresLocationMigration =
    payload.latitude !== null ||
    payload.longitude !== null ||
    payload.business_hours !== null;

  const { data: existing, error: existingError } = await supabase
    .from("company")
    .select("id")
    .maybeSingle();

  if (existingError) {
    console.error("Unable to load company before save.", existingError);
    return jsonError("SERVER_ERROR", "Unable to load company.", 500);
  }

  if (!existing) {
    let insert = await supabase
      .from("company")
      .insert(payload)
      .select(companySelect)
      .single();

    if (isMissingLocationColumn(insert.error)) {
      if (requiresLocationMigration) {
        return jsonError(
          "MIGRATION_REQUIRED",
          "Apply the company location migration before saving coordinates or business hours.",
          503,
        );
      }

      insert = await supabase
        .from("company")
        .insert(legacyPayload)
        .select(legacyCompanySelect)
        .single();
    }

    if (insert.error) {
      console.error("Unable to insert company.", insert.error);
      return jsonError("SERVER_ERROR", "Unable to save company.", 500);
    }

    return jsonOk(mapCompany(insert.data));
  }

  let update = await supabase
    .from("company")
    .update(payload)
    .eq("id", existing.id)
    .select(companySelect)
    .single();

  if (isMissingLocationColumn(update.error)) {
    if (requiresLocationMigration) {
      return jsonError(
        "MIGRATION_REQUIRED",
        "Apply the company location migration before saving coordinates or business hours.",
        503,
      );
    }

    update = await supabase
      .from("company")
      .update(legacyPayload)
      .eq("id", existing.id)
      .select(legacyCompanySelect)
      .single();
  }

  if (update.error) {
    console.error("Unable to update company.", update.error);
    return jsonError("SERVER_ERROR", "Unable to save company.", 500);
  }

  return jsonOk(mapCompany(update.data));
}
