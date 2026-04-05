import { z } from "zod";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { jsonError, jsonOk } from "../../../../lib/api/errors";
import { requireAdmin } from "../../../../lib/api/guards";
import {
  listingCategories,
  listingStatuses,
  MAX_LISTING_LIMIT,
} from "../../../../lib/api/constants";
import { generateUniqueListingSlug } from "../../../../lib/api/listingSlug";
import { mapListingForApi, type ListingRow } from "../../../../lib/api/listings";

const querySchema = z.object({
  category: z.enum(listingCategories).optional(),
  status: z.enum(listingStatuses).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LISTING_LIMIT).optional(),
});

const bodySchema = z.object({
  category: z.enum(listingCategories),
  status: z.enum(listingStatuses),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price_cents: z.number().int().nonnegative(),
  province: z.string().trim().min(1),
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

const listingSelect =
  "id, company_id, slug, category, status, title, description, price_cents, province, city, contact_phone, published_at, created_at, updated_at, listing_images(id, storage_path, sort_order)";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const guard = await requireAdmin(supabase);
  if ("response" in guard) return guard.response;

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    category: searchParams.get("category") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid query parameters.", 400);
  }

  let query = supabase
    .from("listings")
    .select(listingSelect)
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit ?? MAX_LISTING_LIMIT);

  if (parsed.data.category) query = query.eq("category", parsed.data.category);
  if (parsed.data.status) query = query.eq("status", parsed.data.status);

  const { data, error } = await query;
  if (error) {
    return jsonError("SERVER_ERROR", "Unable to load listings.", 500);
  }

  const items = ((data ?? []) as ListingRow[]).map(mapListingForApi);
  return jsonOk({ items });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const guard = await requireAdmin(supabase);
  if ("response" in guard) return guard.response;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid listing data.", 400);
  }

  const { data: company, error: companyError } = await supabase
    .from("company")
    .select("id")
    .maybeSingle();

  if (companyError || !company) {
    return jsonError("VALIDATION_ERROR", "Company must be configured first.", 400);
  }

  const slug = await generateUniqueListingSlug(supabase, company.id, parsed.data.title);
  const publishedAt = parsed.data.status === "published" ? new Date().toISOString() : null;

  const { images, ...rest } = parsed.data;

  const insertListing = await supabase
    .from("listings")
    .insert({
      company_id: company.id,
      slug,
      ...rest,
      published_at: publishedAt,
    })
    .select("id")
    .single();

  if (insertListing.error) {
    return jsonError("SERVER_ERROR", "Unable to create listing.", 500);
  }

  if (images && images.length > 0) {
    const insertImages = await supabase.from("listing_images").insert(
      images.map((image) => ({
        listing_id: insertListing.data.id,
        storage_path: image.storage_path,
        sort_order: image.sort_order,
      })),
    );

    if (insertImages.error) {
      return jsonError("SERVER_ERROR", "Unable to attach listing images.", 500);
    }
  }

  return jsonOk({ id: insertListing.data.id }, 201);
}
