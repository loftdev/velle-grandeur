import { createSupabaseServerClient } from "../supabase/server";
import { getPublicStorageUrl } from "./storage";

export type PublicCompany = {
  id: string;
  name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  about: string | null;
  latitude: number | null;
  longitude: number | null;
  business_hours: string | null;
};

const extendedSelect =
  "id, name, logo_path, phone, email, address, about, latitude, longitude, business_hours";
const legacySelect = "id, name, logo_path, phone, email, address, about";

export async function getPublicCompany(): Promise<PublicCompany | null> {
  const supabase = await createSupabaseServerClient();
  let result = await supabase.from("company").select(extendedSelect).maybeSingle();

  // Keep public pages available until the location migration is applied.
  if (result.error?.code === "42703") {
    result = await supabase.from("company").select(legacySelect).maybeSingle();
  }

  if (result.error || !result.data) {
    return null;
  }

  const data = result.data as {
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
  };

  return {
    id: data.id,
    name: data.name,
    logo_url: data.logo_path
      ? getPublicStorageUrl("company-assets", data.logo_path)
      : null,
    phone: data.phone,
    email: data.email,
    address: data.address,
    about: data.about,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    business_hours: data.business_hours ?? null,
  };
}
