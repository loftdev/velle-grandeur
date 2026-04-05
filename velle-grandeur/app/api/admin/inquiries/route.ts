import { z } from "zod";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { jsonError, jsonOk } from "../../../../lib/api/errors";
import { requireAdmin } from "../../../../lib/api/guards";
import { inquiryStatuses, MAX_LISTING_LIMIT } from "../../../../lib/api/constants";

const querySchema = z.object({
  status: z.enum(inquiryStatuses).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LISTING_LIMIT).optional(),
});

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const guard = await requireAdmin(supabase);
  if ("response" in guard) return guard.response;

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid query parameters.", 400);
  }

  let query = supabase
    .from("inquiries")
    .select(
      "id, company_id, listing_id, name, email, phone, message, status, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit ?? MAX_LISTING_LIMIT);

  if (parsed.data.status) {
    query = query.eq("status", parsed.data.status);
  }

  const { data, error } = await query;

  if (error) {
    return jsonError("SERVER_ERROR", "Unable to load inquiries.", 500);
  }

  return jsonOk({ items: data ?? [] });
}
