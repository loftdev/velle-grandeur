import { z } from "zod";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";
import { jsonError, jsonOk } from "../../../../../lib/api/errors";
import { requireAdmin } from "../../../../../lib/api/guards";
import { generateUniqueListingSlug } from "../../../../../lib/api/listingSlug";
import { mapListingForApi, type ListingRow } from "../../../../../lib/api/listings";
import { listingCategories, listingStatuses } from "../../../../../lib/api/constants";

const listingSelect =
  "id, company_id, slug, category, status, title, description, price_cents, province, city, contact_phone, published_at, created_at, updated_at, listing_images(id, storage_path, sort_order)";

const patchSchema = z.object({
  category: z.enum(listingCategories).optional(),
  status: z.enum(listingStatuses).optional(),
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  price_cents: z.number().int().nonnegative().optional(),
  province: z.string().trim().min(1).optional(),
  city: z.string().trim().nullable().optional(),
  contact_phone: z.string().trim().nullable().optional(),
  images: z
    .array(
      z.object({
        storage_path: z.string().trim().min(1),
        sort_order: z.number().int().nonnegative(),
      }),
    )
    .optional(),
});

async function getListing(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  id: string,
) {
  return supabase.from("listings").select(listingSelect).eq("id", id).maybeSingle();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const guard = await requireAdmin(supabase);
  if ("response" in guard) return guard.response;

  const { data, error } = await getListing(supabase, id);

  if (error) {
    return jsonError("SERVER_ERROR", "Unable to load listing.", 500);
  }

  if (!data) {
    return jsonError("NOT_FOUND", "Listing not found.", 404);
  }

  return jsonOk(mapListingForApi(data as ListingRow));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const guard = await requireAdmin(supabase);
  if ("response" in guard) return guard.response;

  const { data: existing, error: existingError } = await getListing(supabase, id);

  if (existingError) {
    return jsonError("SERVER_ERROR", "Unable to load listing.", 500);
  }

  if (!existing) {
    return jsonError("NOT_FOUND", "Listing not found.", 404);
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid listing data.", 400);
  }

  const updates = { ...parsed.data } as Record<string, unknown>;

  if (parsed.data.title && parsed.data.title !== existing.title) {
    updates.slug = await generateUniqueListingSlug(
      supabase,
      existing.company_id,
      parsed.data.title,
      existing.id,
    );
  }

  if (parsed.data.status === "published" && !existing.published_at) {
    updates.published_at = new Date().toISOString();
  }

  if (parsed.data.status && parsed.data.status !== "published") {
    updates.published_at = null;
  }

  delete updates.images;

  if (Object.keys(updates).length > 0) {
    const update = await supabase
      .from("listings")
      .update(updates)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (update.error) {
      return jsonError("SERVER_ERROR", "Unable to update listing.", 500);
    }
  }

  if (parsed.data.images) {
    const deleteImages = await supabase
      .from("listing_images")
      .delete()
      .eq("listing_id", existing.id);

    if (deleteImages.error) {
      return jsonError("SERVER_ERROR", "Unable to update listing images.", 500);
    }

    if (parsed.data.images.length > 0) {
      const insertImages = await supabase.from("listing_images").insert(
        parsed.data.images.map((image) => ({
          listing_id: existing.id,
          storage_path: image.storage_path,
          sort_order: image.sort_order,
        })),
      );

      if (insertImages.error) {
        return jsonError("SERVER_ERROR", "Unable to update listing images.", 500);
      }
    }
  }

  const { data: updated, error: updatedError } = await getListing(supabase, existing.id);

  if (updatedError || !updated) {
    return jsonError("SERVER_ERROR", "Unable to load updated listing.", 500);
  }

  return jsonOk(mapListingForApi(updated as ListingRow));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const guard = await requireAdmin(supabase);
  if ("response" in guard) return guard.response;

  const { data: existing, error: existingError } = await supabase
    .from("listings")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return jsonError("SERVER_ERROR", "Unable to delete listing.", 500);
  }

  if (!existing) {
    return jsonError("NOT_FOUND", "Listing not found.", 404);
  }

  const deleteImages = await supabase.from("listing_images").delete().eq("listing_id", id);
  if (deleteImages.error) {
    return jsonError("SERVER_ERROR", "Unable to delete listing images.", 500);
  }

  const removeListing = await supabase.from("listings").delete().eq("id", id);
  if (removeListing.error) {
    if (removeListing.error.code === "23503") {
      return jsonError(
        "CONFLICT",
        "Cannot delete listing with existing inquiries.",
        409,
      );
    }
    return jsonError("SERVER_ERROR", "Unable to delete listing.", 500);
  }

  return jsonOk({ id });
}
