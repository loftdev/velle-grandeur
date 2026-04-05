import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";
import { buildSlugId, parseSlugOrId } from "../../../../../lib/api/slug";
import { jsonError, jsonOk } from "../../../../../lib/api/errors";
import { mapListingForApi, type ListingRow } from "../../../../../lib/api/listings";

const listingSelect =
  "id, company_id, slug, category, status, title, description, price_cents, province, city, contact_phone, published_at, created_at, updated_at, listing_images(id, storage_path, sort_order)";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slugOrId: string }> },
) {
  const { slugOrId } = await params;
  const { id, slug } = parseSlugOrId(slugOrId);

  if (!id) {
    return jsonError("NOT_FOUND", "Listing not found.", 404);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select(listingSelect)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return jsonError("NOT_FOUND", "Listing not found.", 404);
  }

  const listing = data as ListingRow;

  if (slug && slug !== listing.slug) {
    const canonical = buildSlugId(listing.slug, listing.id);
    return NextResponse.redirect(
      new URL(`/api/public/listings/${canonical}`, request.url),
      301,
    );
  }

  return jsonOk(mapListingForApi(listing));
}
