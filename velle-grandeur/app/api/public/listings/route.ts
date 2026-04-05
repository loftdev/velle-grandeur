import { z } from "zod";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { decodeCursor, encodeCursor } from "../../../../lib/api/pagination";
import { jsonError, jsonOk } from "../../../../lib/api/errors";
import {
  DEFAULT_LISTING_LIMIT,
  listingCategories,
  MAX_LISTING_LIMIT,
} from "../../../../lib/api/constants";
import { mapListingForApi, type ListingRow } from "../../../../lib/api/listings";

const querySchema = z.object({
  category: z.enum(listingCategories).optional(),
  province: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LISTING_LIMIT).optional(),
});

const listingSelect =
  "id, company_id, slug, category, status, title, description, price_cents, province, city, contact_phone, published_at, created_at, updated_at, listing_images(id, storage_path, sort_order)";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    category: searchParams.get("category") ?? undefined,
    province: searchParams.get("province") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid query parameters.", 400);
  }

  const supabase = await createSupabaseServerClient();
  const limit = parsed.data.limit ?? DEFAULT_LISTING_LIMIT;
  const cursor = decodeCursor(parsed.data.cursor ?? null);

  let query = supabase
    .from("listings")
    .select(listingSelect)
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 10);

  if (parsed.data.category) query = query.eq("category", parsed.data.category);
  if (parsed.data.province) query = query.ilike("province", parsed.data.province);
  if (parsed.data.city) query = query.ilike("city", parsed.data.city);
  if (cursor) query = query.lte("published_at", cursor.publishedAt);

  const { data, error } = await query;
  if (error) {
    return jsonError("SERVER_ERROR", "Unable to load listings.", 500);
  }

  let rows = (data ?? []) as ListingRow[];

  if (cursor) {
    rows = rows.filter((row) => {
      if (!row.published_at) return false;
      if (row.published_at < cursor.publishedAt) return true;
      if (row.published_at > cursor.publishedAt) return false;
      return row.id < cursor.id;
    });
  }

  const slice = rows.slice(0, limit);
  const items = slice.map(mapListingForApi);
  const last = slice[slice.length - 1];

  const nextCursor =
    rows.length > limit && last?.published_at
      ? encodeCursor({ publishedAt: last.published_at, id: last.id })
      : null;

  return jsonOk({ items, next_cursor: nextCursor });
}
